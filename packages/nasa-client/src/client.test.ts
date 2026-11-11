import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_IPAC_TAP_ENDPOINT,
  DEFAULT_MAST_TAP_ENDPOINT,
  NasaClient,
  normalizeTapResponse,
  parseLosslessNasaJson,
} from './client';
import {
  NasaError,
  NasaParseError,
  NasaRateLimitError,
  NasaRequestError,
  NasaTimeoutError,
} from './errors';

describe('NasaClient', () => {
  it('initializes with default endpoints and configuration', () => {
    const client = new NasaClient();
    expect(client.ipacEndpoint).toBe(DEFAULT_IPAC_TAP_ENDPOINT);
    expect(client.mastEndpoint).toBe(DEFAULT_MAST_TAP_ENDPOINT);
    expect(client.timeoutMs).toBe(45_000);
    expect(client.retries).toBe(2);
  });

  it('accepts custom endpoints and removes trailing slashes', () => {
    const client = new NasaClient({
      ipacTapEndpoint: 'https://custom.ipac.test/TAP///',
      mastTapEndpoint: 'https://custom.mast.test/tap/',
      timeoutMs: 10_000,
      retries: 1,
    });
    expect(client.ipacEndpoint).toBe('https://custom.ipac.test/TAP');
    expect(client.mastEndpoint).toBe('https://custom.mast.test/tap');
    expect(client.timeoutMs).toBe(10_000);
    expect(client.retries).toBe(1);
  });

  describe('parseLosslessNasaJson & normalizeTapResponse', () => {
    it('preserves 64-bit integer IDs without floating-point precision loss', () => {
      const rawJson = '{"source_id": 4295828484920485923}';
      const parsed = parseLosslessNasaJson<{ source_id: string }>(rawJson);
      expect(parsed.source_id).toBe('4295828484920485923');
    });

    it('normalizes standard IVOA TAP tabular response { metadata, data }', () => {
      const rawText = JSON.stringify({
        metadata: [{ name: 'designation' }, { name: 'j_m' }, { name: 'k_m' }],
        data: [
          ['03472911+2406184', 8.45, 8.12],
          ['03472922+2406195', 10.2, 9.85],
        ],
      });

      const normalized = normalizeTapResponse<{ designation: string; j_m: number; k_m: number }>(
        rawText
      );
      expect(normalized).toHaveLength(2);
      expect(normalized[0]).toEqual({
        designation: '03472911+2406184',
        j_m: 8.45,
        k_m: 8.12,
      });
      expect(normalized[1].j_m).toBe(10.2);
    });

    it('normalizes array of row objects directly', () => {
      const rawText = JSON.stringify([
        { id: 101, tmag: 9.5 },
        { id: 102, tmag: 11.2 },
      ]);
      const normalized = normalizeTapResponse<{ id: number; tmag: number }>(rawText);
      expect(normalized).toHaveLength(2);
      expect(normalized[0].tmag).toBe(9.5);
    });

    it('throws NasaParseError on malformed JSON', () => {
      expect(() => normalizeTapResponse('<html><body>Internal Error</body></html>')).toThrow(
        NasaParseError
      );
    });
  });

  describe('coneSearch2Mass', () => {
    it('validates coordinate boundaries', async () => {
      const client = new NasaClient();
      await expect(
        client.coneSearch2Mass({ ra: -5, dec: 20, radiusDeg: 0.5 })
      ).rejects.toThrow(NasaError);
      await expect(
        client.coneSearch2Mass({ ra: 370, dec: 20, radiusDeg: 0.5 })
      ).rejects.toThrow(NasaError);
      await expect(
        client.coneSearch2Mass({ ra: 50, dec: 95, radiusDeg: 0.5 })
      ).rejects.toThrow(NasaError);
      await expect(
        client.coneSearch2Mass({ ra: 50, dec: 20, radiusDeg: 0 })
      ).rejects.toThrow(NasaError);
      await expect(
        client.coneSearch2Mass({ ra: 50, dec: 20, radiusDeg: 15 })
      ).rejects.toThrow(NasaError);
    });

    it('queries NASA IPAC TAP and returns parsed TwoMassStar objects with computed jMinusK', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            metadata: [
              { name: 'designation' },
              { name: 'ra' },
              { name: 'dec' },
              { name: 'j_m' },
              { name: 'h_m' },
              { name: 'k_m' },
              { name: 'j_msigcom' },
              { name: 'h_msigcom' },
              { name: 'k_msigcom' },
              { name: 'ph_qual' },
            ],
            data: [
              ['03472911+2406184', 56.871, 24.103, 8.5, 8.2, 8.1, 0.02, 0.02, 0.03, 'AAA'],
            ],
          }),
      });

      const client = new NasaClient({ fetch: mockFetch as unknown as typeof fetch });
      const stars = await client.coneSearch2Mass({
        ra: 56.87,
        dec: 24.1,
        radiusDeg: 0.2,
        limit: 10,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe(`${DEFAULT_IPAC_TAP_ENDPOINT}/sync`);
      expect(calledInit.method).toBe('POST');
      expect(calledInit.body).toContain('fp_psc');
      expect(calledInit.body).toContain('CIRCLE');

      expect(stars).toHaveLength(1);
      const star = stars[0];
      expect(star.designation).toBe('03472911+2406184');
      expect(star.ra).toBe(56.871);
      expect(star.dec).toBe(24.103);
      expect(star.jMag).toBe(8.5);
      expect(star.hMag).toBe(8.2);
      expect(star.kMag).toBe(8.1);
      expect(star.jMinusK).toBe(0.4); // 8.5 - 8.1
      expect(star.qualityFlag).toBe('AAA');
    });
  });

  describe('coneSearchTic', () => {
    it('queries STScI MAST TAP and returns parsed TicStar with physical parameters', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            metadata: [
              { name: 'id' },
              { name: 'ra' },
              { name: 'dec' },
              { name: 'tmag' },
              { name: 'gaia' },
              { name: 'plx' },
              { name: 'e_plx' },
              { name: 'd' },
              { name: 'teff' },
              { name: 'rad' },
              { name: 'mass' },
              { name: 'lum' },
              { name: 'bmag' },
              { name: 'vmag' },
            ],
            data: [
              [
                '142984920',
                56.75,
                24.11,
                9.15,
                '4295828484920485923',
                7.35,
                0.05,
                136.0,
                5820,
                1.05,
                1.02,
                1.12,
                9.8,
                9.2,
              ],
            ],
          }),
      });

      const client = new NasaClient({ fetch: mockFetch as unknown as typeof fetch });
      const stars = await client.coneSearchTic({
        ra: 56.75,
        dec: 24.11,
        radiusDeg: 0.1,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe(`${DEFAULT_MAST_TAP_ENDPOINT}/sync`);
      expect(calledInit.body).toContain('tic_v82');

      expect(stars).toHaveLength(1);
      const s = stars[0];
      expect(s.ticId).toBe('142984920');
      expect(s.gaiaSourceId).toBe('4295828484920485923');
      expect(s.tessMag).toBe(9.15);
      expect(s.parallax).toBe(7.35);
      expect(s.distancePc).toBe(136.0);
      expect(s.teffK).toBe(5820);
      expect(s.radiusSolar).toBe(1.05);
      expect(s.massSolar).toBe(1.02);
      expect(s.luminositySolar).toBe(1.12);
      expect(s.bMinusV).toBe(0.6); // 9.8 - 9.2
    });
  });

  describe('error handling & retries', () => {
    it('throws NasaRateLimitError on HTTP 429', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests',
      });

      const client = new NasaClient({ fetch: mockFetch as unknown as typeof fetch, retries: 0 });
      await expect(client.queryIpac('SELECT 1')).rejects.toThrow(NasaRateLimitError);
    });

    it('throws NasaRequestError on HTTP 400 bad request without retrying', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Syntax error in ADQL',
      });

      const client = new NasaClient({ fetch: mockFetch as unknown as typeof fetch, retries: 2 });
      await expect(client.queryIpac('INVALID SQL')).rejects.toThrow(NasaRequestError);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries on 400
    });

    it('retries on 500 server errors and succeeds if next attempt works', async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return { ok: false, status: 503, text: async () => 'Service Unavailable' };
        }
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify([{ result: 42 }]),
        };
      });

      const client = new NasaClient({
        fetch: mockFetch as unknown as typeof fetch,
        retries: 2,
        retryDelayMs: 5,
      });
      const rows = await client.queryIpac<{ result: number }>('SELECT 42');
      expect(rows).toEqual([{ result: 42 }]);
      expect(callCount).toBe(2);
    });

    it('maps AbortError to NasaTimeoutError', async () => {
      const mockFetch = vi.fn().mockImplementation(async () => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        throw error;
      });

      const client = new NasaClient({
        fetch: mockFetch as unknown as typeof fetch,
        retries: 0,
        timeoutMs: 10,
      });

      await expect(client.queryIpac('SELECT 1')).rejects.toThrow(NasaTimeoutError);
    });
  });
});
