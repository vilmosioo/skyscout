import { describe, expect, it, vi } from 'vitest';
import {
  HipsClient,
  HipsRateLimitError,
  HipsRequestError,
  HipsTimeoutError,
} from './index';

describe('HipsClient getCutoutUrl', () => {
  const client = new HipsClient();

  it('builds valid IVOA hips2fits cutout URLs with parameters', () => {
    const url = client.getCutoutUrl({
      ra: 56.75,
      dec: 24.12,
      fovDeg: 1.5,
      width: 800,
      height: 800,
      hips: 'CDS/P/DSS2/color',
      projection: 'TAN',
      format: 'jpg',
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://alasky.cds.unistra.fr');
    expect(parsed.pathname).toBe('/hips-image-services/hips2fits');
    expect(parsed.searchParams.get('ra')).toBe('56.750000');
    expect(parsed.searchParams.get('dec')).toBe('24.120000');
    expect(parsed.searchParams.get('fov')).toBe('1.5');
    expect(parsed.searchParams.get('width')).toBe('800');
    expect(parsed.searchParams.get('height')).toBe('800');
    expect(parsed.searchParams.get('hips')).toBe('CDS/P/DSS2/color');
    expect(parsed.searchParams.get('format')).toBe('jpg');
  });

  it('defaults to DSS2 color and TAN projection', () => {
    const url = client.getCutoutUrl({
      ra: 88.07,
      dec: 32.55,
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('hips')).toBe('CDS/P/DSS2/color');
    expect(parsed.searchParams.get('projection')).toBe('TAN');
    expect(parsed.searchParams.get('coordsys')).toBe('icrs');
  });
});

describe('HipsClient executeRequest & Error Hierarchy', () => {
  it('fetches image blobs successfully', async () => {
    const mockBlob = new Blob(['hips-image'], { type: 'image/jpeg' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(mockBlob),
    });

    const client = new HipsClient({ fetch: mockFetch as unknown as typeof fetch });
    const result = await client.fetchCutoutBlob({
      ra: 56.75,
      dec: 24.12,
      hips: 'CDS/P/2MASS/color',
    });

    expect(result).toBe(mockBlob);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('hips2fits'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('throws HipsRateLimitError on HTTP 429', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'Retry-After': '30' }),
      text: () => Promise.resolve('Rate limited'),
    });

    const client = new HipsClient({ fetch: mockFetch as unknown as typeof fetch });
    await expect(
      client.fetchCutoutArrayBuffer({ ra: 0, dec: 0 })
    ).rejects.toThrow(HipsRateLimitError);
  });

  it('throws HipsRequestError on HTTP 500 error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      text: () => Promise.resolve('Server Error'),
    });

    const client = new HipsClient({ fetch: mockFetch as unknown as typeof fetch });
    await expect(
      client.fetchFits({ ra: 10, dec: 20 })
    ).rejects.toThrow(HipsRequestError);
  });

  it('throws HipsTimeoutError when aborted by timeout', async () => {
    const mockFetch = vi.fn().mockImplementation((_url, { signal }) => {
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const client = new HipsClient({
      fetch: mockFetch as unknown as typeof fetch,
      timeoutMs: 10,
    });

    await expect(
      client.fetchCutoutBlob({ ra: 50, dec: 50 })
    ).rejects.toThrow(HipsTimeoutError);
  });

  it('returns appropriate survey attribution strings', () => {
    const client = new HipsClient();
    expect(client.getSurveyAttribution('CDS/P/2MASS/color')).toContain('NASA 2MASS survey. U.S. Public Domain.');
    expect(client.getSurveyAttribution('CDS/P/DSS2/color')).toContain('STScI');
    expect(client.getSurveyAttribution('CDS/P/PanSTARRS/DR1/color-z-zg-g')).toContain('Pan-STARRS');
  });
});
