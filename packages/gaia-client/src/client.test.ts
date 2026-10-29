import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_GAIA_TAP_ENDPOINT,
  GaiaClient,
  mapRawGaiaRowToStar,
  parseLosslessGaiaJson,
  parseTapTabularResponse,
  resolveConeRadiusDegrees,
} from './client';
import {
  GaiaError,
  GaiaRateLimitError,
  GaiaRequestError,
  GaiaTimeoutError,
} from './errors';
import type { GaiaTapJsonResponse } from './types';

const sampleTapPayload = JSON.stringify({
  metadata: [
    { name: 'source_id', datatype: 'long' },
    { name: 'ra', datatype: 'double' },
    { name: 'dec', datatype: 'double' },
    { name: 'parallax', datatype: 'double' },
    { name: 'parallax_error', datatype: 'float' },
    { name: 'parallax_over_error', datatype: 'float' },
    { name: 'pmra', datatype: 'double' },
    { name: 'pmdec', datatype: 'double' },
    { name: 'radial_velocity', datatype: 'float' },
    { name: 'phot_g_mean_mag', datatype: 'float' },
    { name: 'phot_bp_mean_mag', datatype: 'float' },
    { name: 'phot_rp_mean_mag', datatype: 'float' },
    { name: 'bp_rp', datatype: 'float' },
    { name: 'teff_gspphot', datatype: 'float' },
    { name: 'ag_gspphot', datatype: 'float' },
    { name: 'ebpminrp_gspphot', datatype: 'float' },
  ],
  data: [
    [
      '64995134679307264',
      56.8712,
      24.1051,
      7.33,
      0.17,
      42.5,
      19.34,
      -43.67,
      5.2,
      2.84,
      2.79,
      2.88,
      -0.09,
      12300,
      0.12,
      0.06,
    ],
  ],
});

describe('GaiaClient Initialization', () => {
  it('initializes with zero arguments (no API key required for public ESA Gaia TAP)', () => {
    const client = new GaiaClient();
    expect(client).toBeInstanceOf(GaiaClient);
  });

  it('accepts custom endpoint, timeoutMs, and fetch implementation', () => {
    const mockFetch = vi.fn();
    const client = new GaiaClient({
      endpoint: '/gaia-tap/',
      timeoutMs: 15_000,
      fetch: mockFetch as unknown as typeof fetch,
    });
    expect(client).toBeInstanceOf(GaiaClient);
  });
});

describe('64-bit Gaia source_id Precision & TAP Tabular JSON Parsing', () => {
  it('preserves 19-digit Gaia DR3 source_id integers inside TAP tabular arrays', () => {
    // 5853498713190525696 (Proxima Centauri) would round to 5853498713190526000 in IEEE-754 float64
    const rawTapJson = `{
      "metadata": [
        {"name": "source_id", "datatype": "long"},
        {"name": "ra", "datatype": "double"},
        {"name": "parallax", "datatype": "double"}
      ],
      "data": [
        [5853498713190525696, 217.4289, 768.0665]
      ]
    }`;

    const parsed = parseLosslessGaiaJson<GaiaTapJsonResponse>(rawTapJson);
    const rows = parseTapTabularResponse<{ source_id: string; ra: number; parallax: number }>(parsed);

    expect(rows).toHaveLength(1);
    expect(rows[0].source_id).toBe('5853498713190525696');
    expect(rows[0].ra).toBeCloseTo(217.4289, 4);
    expect(rows[0].parallax).toBeCloseTo(768.0665, 4);
  });

  it('throws GaiaError on malformed TAP JSON structure', () => {
    // @ts-expect-error testing invalid structure
    expect(() => parseTapTabularResponse({ foo: 'bar' })).toThrow(GaiaError);
  });
});

describe('High-Level API Methods (Abstracting ADQL & TAP)', () => {
  it('executes coneSearch with distance (pc) and radius conversions', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => sampleTapPayload,
    });

    const client = new GaiaClient({ fetch: mockFetch as unknown as typeof fetch });
    const stars = await client.coneSearch({
      ra: 56.75,
      dec: 24.12,
      radiusArcmin: 90, // 1.5 degrees
      minDistancePc: 125, // maxParallaxMas = 8.0
      maxDistancePc: 150, // minParallaxMas = 6.666667
      minParallaxSnr: 10,
      maxMagG: 16.5,
      sortBy: 'brightest',
      limit: 250,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${DEFAULT_GAIA_TAP_ENDPOINT}/sync`);
    const decodedQuery = new URLSearchParams(init.body).get('QUERY')!;
    expect(decodedQuery).toContain('SELECT TOP 250');
    expect(decodedQuery).toContain("CIRCLE('ICRS', 56.75, 24.12, 1.5)");
    expect(decodedQuery).toContain('parallax >= 6.666667');
    expect(decodedQuery).toContain('parallax <= 8');
    expect(decodedQuery).toContain('ORDER BY phot_g_mean_mag ASC');

    expect(stars).toHaveLength(1);
    const star = stars[0];
    expect(star.sourceId).toBe('64995134679307264');
    expect(star.magG).toBe(2.84);
    expect(star.bpRp).toBe(-0.09);
    expect(star.parallaxMas).toBe(7.33);
    expect(star.distancePc).toBeCloseTo(136.4256, 3);
    expect(star.absoluteMagG).toBeCloseTo(-2.953, 2);
    expect(star.spectralClass).toBe('B');
    expect(star.teffK).toBe(12300);
  });

  it('executes searchByDistance and converts maxDistancePc into parallax threshold', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => sampleTapPayload,
    });

    const client = new GaiaClient({ fetch: mockFetch as unknown as typeof fetch });
    await client.searchByDistance({
      maxDistancePc: 20, // parallax >= 50 mas
      minParallaxSnr: 20,
      limit: 100,
    });

    const [, init] = mockFetch.mock.calls[0];
    const decodedQuery = new URLSearchParams(init.body).get('QUERY')!;
    expect(decodedQuery).toContain('parallax >= 50');
    expect(decodedQuery).toContain('ORDER BY parallax DESC');
  });

  it('fetches a single star by sourceId via getStarById', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => sampleTapPayload,
    });

    const client = new GaiaClient({ fetch: mockFetch as unknown as typeof fetch });
    const star = await client.getStarById('64995134679307264');

    expect(star).not.toBeNull();
    expect(star?.sourceId).toBe('64995134679307264');

    await expect(client.getStarById('not-a-number')).rejects.toThrow(GaiaError);
  });

  it('validates cone radius units (degrees, arcminutes, arcseconds)', () => {
    expect(resolveConeRadiusDegrees({ ra: 0, dec: 0, radiusDeg: 2 })).toBe(2);
    expect(resolveConeRadiusDegrees({ ra: 0, dec: 0, radiusArcmin: 30 })).toBe(0.5);
    expect(resolveConeRadiusDegrees({ ra: 0, dec: 0, radiusArcsec: 360 })).toBe(0.1);
    expect(() => resolveConeRadiusDegrees({ ra: 0, dec: 0 })).toThrow(GaiaError);
  });

  it('handles missing or invalid row fields gracefully in mapRawGaiaRowToStar', () => {
    expect(mapRawGaiaRowToStar({ ra: 10, dec: 20 })).toBeNull(); // missing phot_g_mean_mag
    const starNoPlx = mapRawGaiaRowToStar({
      source_id: '12345',
      ra: 10,
      dec: 20,
      phot_g_mean_mag: 12.5,
      phot_bp_mean_mag: 13.0,
      phot_rp_mean_mag: 12.0,
    });
    expect(starNoPlx).not.toBeNull();
    expect(starNoPlx?.bpRp).toBe(1.0);
    expect(starNoPlx?.distancePc).toBeNull();
    expect(starNoPlx?.absoluteMagG).toBeNull();
  });
});

describe('Error Hierarchy', () => {
  it('throws GaiaRateLimitError on HTTP 429', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'Too Many Requests',
    });

    const client = new GaiaClient({ fetch: mockFetch as unknown as typeof fetch });
    await expect(client.searchStars({ limit: 5 })).rejects.toThrow(GaiaRateLimitError);
  });

  it('throws GaiaRequestError on HTTP 400 / 500 with status code and body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid ADQL syntax near FROM',
    });

    const client = new GaiaClient({ fetch: mockFetch as unknown as typeof fetch });
    try {
      await client.queryAdql('SELECT BROKEN FROM');
      expect.fail('Expected GaiaRequestError');
    } catch (err) {
      expect(err).toBeInstanceOf(GaiaRequestError);
      expect((err as GaiaRequestError).statusCode).toBe(400);
      expect((err as GaiaRequestError).responseBody).toContain('Invalid ADQL syntax');
    }
  });

  it('throws GaiaTimeoutError when request exceeds timeoutMs', async () => {
    const mockFetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          const abortErr = new Error('The operation was aborted.');
          abortErr.name = 'AbortError';
          reject(abortErr);
        });
      });
    });

    const client = new GaiaClient({
      timeoutMs: 20,
      fetch: mockFetch as unknown as typeof fetch,
    });

    await expect(client.searchStars({ limit: 10 })).rejects.toThrow(GaiaTimeoutError);
  });
});
