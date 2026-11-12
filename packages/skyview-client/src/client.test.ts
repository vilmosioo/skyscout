import { describe, expect, it, vi } from 'vitest';
import {
  SkyviewClient,
  SkyviewRateLimitError,
  SkyviewRequestError,
  SkyviewTimeoutError,
  formatSkyviewPosition,
} from './index';

describe('formatSkyviewPosition', () => {
  it('formats { ra, dec } objects into coordinate strings', () => {
    expect(formatSkyviewPosition({ ra: 56.75, dec: 24.12 })).toBe('56.750000, 24.120000');
  });

  it('passes through string positions directly', () => {
    expect(formatSkyviewPosition('M45')).toBe('M45');
    expect(formatSkyviewPosition('  56.75, 24.12 ')).toBe('56.75, 24.12');
  });
});

describe('SkyviewClient getImageUrl', () => {
  const client = new SkyviewClient();

  it('builds valid NASA SkyView cutout URLs with query parameters', () => {
    const url = client.getImageUrl({
      position: { ra: 56.75, dec: 24.12 },
      survey: 'DSS2 Color',
      pixels: 800,
      sizeDeg: 1.5,
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://skyview.gsfc.nasa.gov');
    expect(parsed.pathname).toBe('/current/cgi/runquery.pl');
    expect(parsed.searchParams.get('Position')).toBe('56.750000, 24.120000');
    expect(parsed.searchParams.get('Survey')).toBe('DSS2 Color');
    expect(parsed.searchParams.get('Pixels')).toBe('800');
    expect(parsed.searchParams.get('Size')).toBe('1.5');
    expect(parsed.searchParams.get('Return')).toBe('JPEG');
  });

  it('handles survey arrays, PNG format and projections', () => {
    const url = client.getImageUrl(
      {
        position: 'NGC 6231',
        survey: ['2MASS-J', '2MASS-H', '2MASS-K'],
        pixels: 1200,
        projection: 'Tan',
        scaling: 'Log',
      },
      'png'
    );

    const parsed = new URL(url);
    expect(parsed.searchParams.get('Position')).toBe('NGC 6231');
    expect(parsed.searchParams.get('Survey')).toBe('2MASS-J,2MASS-H,2MASS-K');
    expect(parsed.searchParams.get('Return')).toBe('PNG');
    expect(parsed.searchParams.get('Projection')).toBe('Tan');
    expect(parsed.searchParams.get('Scaling')).toBe('Log');
  });
});

describe('SkyviewClient executeRequest & Error Hierarchy', () => {
  it('fetches image blobs successfully', async () => {
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(mockBlob),
    });

    const client = new SkyviewClient({ fetch: mockFetch as unknown as typeof fetch });
    const result = await client.fetchImageBlob({
      position: { ra: 88.07, dec: 32.55 },
      survey: '2MASS Color',
    });

    expect(result).toBe(mockBlob);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('runquery.pl'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('throws SkyviewRateLimitError on HTTP 429', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'Retry-After': '15' }),
      text: () => Promise.resolve('Rate limited'),
    });

    const client = new SkyviewClient({ fetch: mockFetch as unknown as typeof fetch });
    await expect(
      client.fetchImageArrayBuffer({ position: 'M13' })
    ).rejects.toThrow(SkyviewRateLimitError);
  });

  it('throws SkyviewRequestError on HTTP 500 error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      text: () => Promise.resolve('Internal SkyView Server Error'),
    });

    const client = new SkyviewClient({ fetch: mockFetch as unknown as typeof fetch });
    await expect(
      client.fetchFits({ position: 'M42' })
    ).rejects.toThrow(SkyviewRequestError);
  });

  it('throws SkyviewTimeoutError on abort timeout', async () => {
    const mockFetch = vi.fn().mockImplementation((_url, { signal }) => {
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const client = new SkyviewClient({
      fetch: mockFetch as unknown as typeof fetch,
      timeoutMs: 10,
    });

    await expect(
      client.fetchImageBlob({ position: 'Pleiades' })
    ).rejects.toThrow(SkyviewTimeoutError);
  });

  it('provides public domain attribution text for art prints', () => {
    const client = new SkyviewClient();
    expect(client.getAttribution('2MASS Color')).toContain('Public Domain');
    expect(client.getAttribution('WISE 3.4')).toContain('Public Domain');
    expect(client.getAttribution('DSS2 Color')).toContain('Public Domain');
  });
});
