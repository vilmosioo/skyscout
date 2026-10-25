import { describe, expect, it, vi } from 'vitest';
import { LasairClient, parseLosslessJson } from './client';
import {
  LasairAuthError,
  LasairRateLimitError,
  LasairRequestError,
} from './errors';

describe('LasairClient Initialization', () => {
  it('throws LasairAuthError when token is missing or empty', () => {
    // @ts-expect-error testing missing config
    expect(() => new LasairClient()).toThrow(LasairAuthError);
    // @ts-expect-error testing missing token
    expect(() => new LasairClient({})).toThrow(LasairAuthError);
    expect(() => new LasairClient({ token: '' })).toThrow(LasairAuthError);
    expect(() => new LasairClient({ token: '   ' })).toThrow(LasairAuthError);
  });

  it('initializes successfully with valid explicit token', () => {
    const client = new LasairClient({ token: 'test-token-123' });
    expect(client).toBeInstanceOf(LasairClient);
  });

  it('does not read from environment variables (pure environment-agnostic library)', () => {
    const originalEnv = process.env.LASAIR_TOKEN;
    try {
      process.env.LASAIR_TOKEN = 'env-token-xyz';
      // @ts-expect-error testing that client does NOT automatically inspect env vars
      expect(() => new LasairClient({})).toThrow(LasairAuthError);
    } finally {
      process.env.LASAIR_TOKEN = originalEnv;
    }
  });
});

describe('64-bit ID Precision (parseLosslessJson)', () => {
  it('preserves exact 64-bit integers without float64 rounding', () => {
    // 170657504701711053 would round to 170657504701711040 in standard JSON.parse
    const raw = '{"diaObjectId":170657504701711053,"ra":52.8238,"diaSourceId":220019695992242899}';
    const parsed = parseLosslessJson<{ diaObjectId: string; ra: number; diaSourceId: string }>(raw);

    expect(parsed.diaObjectId).toBe('170657504701711053');
    expect(parsed.diaSourceId).toBe('220019695992242899');
    expect(parsed.ra).toBe(52.8238);
  });

  it('handles arrays of 64-bit integer records', () => {
    const raw = '[{"diaObjectId":170019695992242795},{"diaObjectId":170019696008495213}]';
    const parsed = parseLosslessJson<Array<{ diaObjectId: string }>>(raw);

    expect(parsed[0].diaObjectId).toBe('170019695992242795');
    expect(parsed[1].diaObjectId).toBe('170019696008495213');
  });
});

describe('API Methods (Mocked Fetch)', () => {
  it('executes SQL query with correct authorization and headers', async () => {
    const mockResponse = [{ diaObjectId: '170019695992242795', ra: 52.82, decl: -29.69 }];
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResponse),
    });

    const client = new LasairClient({ token: 'my-token', fetch: mockFetch as unknown as typeof fetch });
    const result = await client.query({
      selected: 'objects.diaObjectId, objects.ra, objects.decl',
      tables: 'objects',
      conditions: "classification = 'SN'",
      limit: 10,
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.lasair.lsst.ac.uk/api/query/');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Token my-token');

    const body = JSON.parse(options.body);
    expect(body.selected).toBe('objects.diaObjectId, objects.ra, objects.decl');
    expect(body.tables).toBe('objects');
    expect(body.limit).toBe(10);
  });

  it('executes cone search', async () => {
    const mockResponse = { count: 1, nearest: { object: '170019695992242795', separation: 0.14 } };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResponse),
    });

    const client = new LasairClient({ token: 'my-token', fetch: mockFetch as unknown as typeof fetch });
    const result = await client.cone({ ra: 52.8238, dec: -29.6916, radius: 10, requestType: 'nearest' });

    expect(result).toEqual(mockResponse);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.lasair.lsst.ac.uk/api/cone/');
    const body = JSON.parse(options.body);
    expect(body.ra).toBe(52.8238);
    expect(body.dec).toBe(-29.6916);
    expect(body.requestType).toBe('nearest');
  });

  it('fetches object and light curve data', async () => {
    const mockObjectData = {
      diaObjectId: '170019695992242795',
      diaObject: { ra: 52.82, decl: -29.69 },
      diaSourcesList: [{ diaSourceId: '220019695992242899', band: 'r', psfFlux: 12000 }],
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockObjectData),
    });

    const client = new LasairClient({ token: 'my-token', fetch: mockFetch as unknown as typeof fetch });
    const result = await client.object('170019695992242795');

    expect(result.diaObjectId).toBe('170019695992242795');
    expect(result.diaSourcesList.length).toBe(1);
    expect(result.diaSourcesList[0].band).toBe('r');
  });

  it('handles 401 unauthorized errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => '{"detail": "Invalid token."}',
    });

    const client = new LasairClient({ token: 'bad-token', fetch: mockFetch as unknown as typeof fetch });
    await expect(client.query({ selected: 'diaObjectId', tables: 'objects', conditions: '' })).rejects.toThrow(
      LasairAuthError
    );
  });

  it('handles 429 rate limit errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => '{"detail": "Throttle limit exceeded."}',
    });

    const client = new LasairClient({ token: 'my-token', fetch: mockFetch as unknown as typeof fetch });
    await expect(client.cone({ ra: 10, dec: 20 })).rejects.toThrow(LasairRateLimitError);
  });

  it('handles 500 server errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const client = new LasairClient({ token: 'my-token', fetch: mockFetch as unknown as typeof fetch });
    await expect(client.object('12345')).rejects.toThrow(LasairRequestError);
  });
});
