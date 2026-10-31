import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GaiaClient, type GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  clearStarCache,
  COLOR_SCHEMES,
  computeStarCanvasRadius,
  fetchTargetStars,
  findClosestStarAtPoint,
  getGaiaStarExternalUrls,
  getStarPhysicalDetails,
  HR_BOUNDS,
  panHrBounds,
  starToCanvasXY,
  TARGET_PRESETS,
  toggleTargetSelection,
  zoomHrBounds,
} from './hrPlot';

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

describe('StarPlot H–R Diagram Coordinate, Zoom/Pan & Color Schemes', () => {
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

  it('computes fine stardust radii (0.55px–1.20px) while keeping 12px responsive hover hit-testing', () => {
    const faintDwarfRadius = computeStarCanvasRadius(14.5);
    const solarRadius = computeStarCanvasRadius(4.8);
    const supergiantRadius = computeStarCanvasRadius(-8.0);

    expect(faintDwarfRadius).toBeCloseTo(0.55, 2);
    expect(solarRadius).toBeGreaterThan(faintDwarfRadius);
    expect(solarRadius).toBeLessThan(1.0);
    expect(supergiantRadius).toBeCloseTo(1.2, 2);

    const { x, y } = starToCanvasXY(sampleStar.bpRp!, sampleStar.absoluteMagG!, box);
    const items = [{ star: sampleStar, sourceLabel: 'Pleiades' }];

    // Hovering 9px away from a pinpoint star still selects it
    expect(findClosestStarAtPoint(items, x + 9, y - 5, box)).toBe(items[0]);
    // Hovering 20px away misses cleanly
    expect(findClosestStarAtPoint(items, x + 20, y, box)).toBeNull();
  });

  it('zooms and pans H–R coordinate bounds around focal anchor points', () => {
    const zoomedIn = zoomHrBounds(HR_BOUNDS, 0.5, 0.5, 0.5);
    const origSpanX = HR_BOUNDS.maxBpRp - HR_BOUNDS.minBpRp;
    const newSpanX = zoomedIn.maxBpRp - zoomedIn.minBpRp;
    expect(newSpanX).toBeCloseTo(origSpanX * 0.5, 4);

    // Panning right by 80px (10% of 800px box width) shifts minBpRp negatively by 10% of span
    const panned = panHrBounds(zoomedIn, 80, 0, box);
    expect(panned.minBpRp).toBeCloseTo(zoomedIn.minBpRp - 0.1 * newSpanX, 4);
  });

  it('smoothly interpolates (G_BP - G_RP) colors across all 5 color schemes', () => {
    expect(Object.keys(COLOR_SCHEMES)).toEqual([
      'blackbody',
      'ultraviolet',
      'emerald',
      'gold',
      'print-light',
    ]);

    expect(bpRpToStarHexColor(-0.45, 'blackbody')).toBe('#6ed7ff');
    expect(bpRpToStarHexColor(0.82, 'blackbody')).toBe('#ffea00');

    // Different color schemes produce distinct palettes
    const bb = bpRpToStarHexColor(0.82, 'blackbody');
    const uv = bpRpToStarHexColor(0.82, 'ultraviolet');
    const pr = bpRpToStarHexColor(0.82, 'print-light');
    expect(bb).not.toBe(uv);
    expect(uv).not.toBe(pr);

    // Continuous blending check
    expect(bpRpToStarHexColor(0.5, 'blackbody')).not.toBe(
      bpRpToStarHexColor(0.65, 'blackbody')
    );
  });

  it('computes rich physical star details (evolutionary stage, luminosity L☉, radius R☉)', () => {
    const details = getStarPhysicalDetails(sampleStar);
    expect(details.evolutionaryStage).toContain('Supergiant');
    expect(details.luminositySolar).toBeGreaterThan(1000);
    expect(details.radiusSolar).toBeGreaterThan(5);
  });
});

describe('Expanded Messier & Famous Clusters Catalog + Multi-Select', () => {
  it('provides 16 curated presets across Solar Neighborhood, Open Clusters, and Globular Clusters', () => {
    expect(TARGET_PRESETS.length).toBe(16);
    const solarVolumes = TARGET_PRESETS.filter((p) => p.category === 'Solar Volume');
    expect(solarVolumes.map((p) => p.id)).toEqual(['solar-50pc']);
    expect(TARGET_PRESETS.some((p) => p.id === 'm13')).toBe(true);
    expect(TARGET_PRESETS.some((p) => p.id === 'omega-centauri')).toBe(true);
    expect(TARGET_PRESETS.some((p) => p.id === 'double-cluster')).toBe(true);
  });

  it('allows selecting and removing any target when clicking on it again', () => {
    let selected = toggleTargetSelection(['solar-50pc'], 'pleiades');
    expect(selected).toEqual(['solar-50pc', 'pleiades']);

    selected = toggleTargetSelection(selected, 'm13');
    expect(selected).toEqual(['solar-50pc', 'pleiades', 'm13']);

    selected = toggleTargetSelection(selected, 'pleiades');
    expect(selected).toEqual(['solar-50pc', 'm13']);

    // Clicking the last remaining source removes it cleanly
    selected = toggleTargetSelection(['m13'], 'm13');
    expect(selected).toEqual([]);
  });

  it('builds external ESASky, VizieR Gaia DR3, and SIMBAD URLs for individual stars', () => {
    const urls = getGaiaStarExternalUrls(sampleStar);
    expect(urls.esaSkyUrl).toContain('https://sky.esa.int/esasky/');
    expect(urls.vizierGaiaDr3Url).toContain('64995134679307264');
    expect(urls.simbadConeUrl).toContain('https://simbad.cds.unistra.fr/simbad/sim-coo');
  });
});

describe('fetchTargetStars Live Dispatch & Local Caching', () => {
  beforeEach(() => {
    clearStarCache();
  });

  it('caches the first response in storage and skips network calls on subsequent requests', async () => {
    const storeMap = new Map<string, string>();
    const mockStorage = {
      getItem: vi.fn((key: string) => storeMap.get(key) ?? null),
      setItem: vi.fn((key: string, val: string) => {
        storeMap.set(key, val);
      }),
    };

    const client = new GaiaClient({ fetch: vi.fn() as unknown as typeof fetch });
    const spy = vi.spyOn(client, 'searchStars').mockResolvedValue([sampleStar]);

    const first = await fetchTargetStars(client, 'solar-50pc', 600, mockStorage);
    expect(first).toEqual([sampleStar]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

    clearStarCache();

    const second = await fetchTargetStars(client, 'solar-50pc', 600, mockStorage);
    expect(second).toEqual([sampleStar]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(mockStorage.getItem).toHaveBeenCalled();
  });

  it('deduplicates concurrent in-flight requests for the same target (e.g. React StrictMode double-mount)', async () => {
    const client = new GaiaClient({ fetch: vi.fn() as unknown as typeof fetch });
    let resolveNetwork!: (value: GaiaStar[]) => void;
    const spy = vi.spyOn(client, 'searchStars').mockImplementation(
      () =>
        new Promise<GaiaStar[]>((resolve) => {
          resolveNetwork = resolve;
        })
    );

    const p1 = fetchTargetStars(client, 'solar-50pc', 1000);
    const p2 = fetchTargetStars(client, 'solar-50pc', 1000);

    expect(spy).toHaveBeenCalledTimes(1);

    resolveNetwork([sampleStar]);
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual([sampleStar]);
    expect(r2).toEqual([sampleStar]);
  });

  it('dispatches open and globular cluster presets to client.coneSearch', async () => {
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

    await fetchTargetStars(client, 'm13', 700);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        ra: 250.423,
        dec: 36.46,
        limit: 700,
      })
    );
  });
});
