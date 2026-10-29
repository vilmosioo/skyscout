import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GaiaClient, type GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  clearStarCache,
  fetchTargetStars,
  HR_BOUNDS,
  starToCanvasXY,
  toggleTargetSelection,
} from './hrPlot';

describe('StarPlot H–R Diagram Coordinate & Smooth Color Interpolation', () => {
  const box = { left: 50, top: 40, width: 800, height: 500 };

  it('maps (bpRp, absoluteMagG) to inverted astronomical canvas coordinates', () => {
    const topLeft = starToCanvasXY(HR_BOUNDS.minBpRp, HR_BOUNDS.minAbsMag, box);
    expect(topLeft.x).toBeCloseTo(50, 5);
    expect(topLeft.y).toBeCloseTo(40, 5);

    const bottomRight = starToCanvasXY(HR_BOUNDS.maxBpRp, HR_BOUNDS.maxAbsMag, box);
    expect(bottomRight.x).toBeCloseTo(850, 5);
    expect(bottomRight.y).toBeCloseTo(540, 5);

    const brightStar = starToCanvasXY(0.82, 0.0, box);
    const solarStar = starToCanvasXY(0.82, 4.67, box);
    expect(brightStar.y).toBeLessThan(solarStar.y);
  });

  it('smoothly interpolates (G_BP - G_RP) colors without hard steps', () => {
    // Exact stop values
    expect(bpRpToStarHexColor(-0.4)).toBe('#60a5fa'); // Hot blue
    expect(bpRpToStarHexColor(0.4)).toBe('#f8fafc');  // Pure white
    expect(bpRpToStarHexColor(0.82)).toBe('#fde047'); // Solar yellow

    // Nearby values blend continuously rather than snapping to identical buckets
    const c1 = bpRpToStarHexColor(0.5);
    const c2 = bpRpToStarHexColor(0.65);
    const c3 = bpRpToStarHexColor(0.8);
    expect(c1).not.toBe(c2);
    expect(c2).not.toBe(c3);
  });
});

describe('Multi-Source Selection Toggle', () => {
  it('allows selecting multiple targets and prevents deselecting the last active target', () => {
    let selected = toggleTargetSelection(['neighborhood'], 'pleiades');
    expect(selected).toEqual(['neighborhood', 'pleiades']);

    selected = toggleTargetSelection(selected, 'm67');
    expect(selected).toEqual(['neighborhood', 'pleiades', 'm67']);

    // Deselecting one removes only that target
    selected = toggleTargetSelection(selected, 'pleiades');
    expect(selected).toEqual(['neighborhood', 'm67']);

    // Cannot deselect when only 1 target remains active
    selected = toggleTargetSelection(['m67'], 'm67');
    expect(selected).toEqual(['m67']);
  });
});

describe('fetchTargetStars Live Dispatch & Local Caching', () => {
  beforeEach(() => {
    clearStarCache();
  });

  const sampleStar: GaiaStar = {
    sourceId: '64995134679307264',
    ra: 56.87,
    dec: 24.1,
    parallaxMas: 7.33,
    parallaxErrorMas: 0.1,
    parallaxSnr: 73.3,
    pmRaMasYr: 19.3,
    pmDecMasYr: -43.6,
    radialVelocityKmS: 5.2,
    magG: 2.84,
    magBp: 2.79,
    magRp: 2.88,
    bpRp: -0.09,
    teffK: 12300,
    extinctionAg: 0.1,
    reddeningBpRp: 0.05,
    distancePc: 136.4,
    distanceLy: 444.9,
    absoluteMagG: -2.95,
    logLuminositySolar: 3.07,
    spectralClass: 'B',
  };

  it('caches the first response in storage and skips network calls on subsequent requests', async () => {
    const storeMap = new Map<string, string>();
    const mockStorage = {
      getItem: vi.fn((key: string) => storeMap.get(key) ?? null),
      setItem: vi.fn((key: string, val: string) => {
        storeMap.set(key, val);
      }),
    };

    const client = new GaiaClient({ fetch: vi.fn() as unknown as typeof fetch });
    const spy = vi.spyOn(client, 'searchByDistance').mockResolvedValue([sampleStar]);

    // First call hits network and writes to storage
    const first = await fetchTargetStars(client, 'neighborhood', 600, mockStorage);
    expect(first).toEqual([sampleStar]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

    // Clear in-memory cache so we verify localStorage persistence directly
    clearStarCache();

    // Second call reads from mockStorage without hitting GaiaClient
    const second = await fetchTargetStars(client, 'neighborhood', 600, mockStorage);
    expect(second).toEqual([sampleStar]);
    expect(spy).toHaveBeenCalledTimes(1); // still 1!
    expect(mockStorage.getItem).toHaveBeenCalled();
  });

  it('dispatches pleiades and m67 presets to client.coneSearch', async () => {
    const client = new GaiaClient({ fetch: vi.fn() as unknown as typeof fetch });
    const spy = vi.spyOn(client, 'coneSearch').mockResolvedValue([]);

    await fetchTargetStars(client, 'pleiades', 500);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        ra: 56.75,
        dec: 24.12,
        limit: 500,
      })
    );

    await fetchTargetStars(client, 'm67', 700);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        ra: 132.825,
        dec: 11.8,
        limit: 700,
      })
    );
  });
});
