import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GaiaClient, type GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  clearStarCache,
  COLOR_SCHEMES,
  computeConstantRadiusCurve,
  computeStarCanvasRadius,
  downloadGalleryPoster,
  fetchCustomConeStars,
  fetchTargetStars,
  findClosestStarAtPoint,
  formatPosterTitle,
  generateClusterFallbackStars,
  generateClusterPreviewPoints,
  getGaiaStarExternalUrls,
  getStarPhysicalDetails,
  HR_BOUNDS,
  panHrBounds,
  renderGalleryPosterCanvas,
  searchCatalogPresets,
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
  it('provides 33 curated presets across Solar Neighborhood, Open Clusters, and Globular Clusters', () => {
    expect(TARGET_PRESETS.length).toBe(33);
    const solarVolumes = TARGET_PRESETS.filter((p) => p.category === 'Solar Volume');
    expect(solarVolumes.map((p) => p.id)).toEqual(['solar-50pc']);
    expect(TARGET_PRESETS.some((p) => p.id === 'm13')).toBe(true);
    expect(TARGET_PRESETS.some((p) => p.id === 'omega-centauri')).toBe(true);
    expect(TARGET_PRESETS.some((p) => p.id === 'double-cluster')).toBe(true);
    expect(TARGET_PRESETS.some((p) => p.id === 'ngc-188')).toBe(true);
  });

  it('filters catalog presets by category and search query, and generates deterministic preview points', () => {
    const scorp = searchCatalogPresets('Scorpius', 'All');
    expect(scorp.length).toBeGreaterThanOrEqual(4);

    const globularM13 = searchCatalogPresets('M13', 'Globular Cluster');
    expect(globularM13.map((p) => p.id)).toEqual(['m13']);

    const previewPts = generateClusterPreviewPoints(globularM13[0]);
    expect(previewPts.length).toBeGreaterThan(150);
  });

  it('generates rich, physics-accurate offline fallback stars for clusters', () => {
    const pleiades = TARGET_PRESETS.find((p) => p.id === 'pleiades')!;
    const fallbackStars = generateClusterFallbackStars(pleiades);

    expect(fallbackStars.length).toBeGreaterThan(300);
    const first = fallbackStars[0];
    expect(first.sourceId).toMatch(/^synth-pleiades-/);
    expect(typeof first.ra).toBe('number');
    expect(typeof first.dec).toBe('number');
    expect(first.distancePc).toBe(136);
    expect(first.parallaxMas).toBeGreaterThan(0);
    expect(first.absoluteMagG).not.toBeNull();
    expect(first.magG).toBeGreaterThan(0);
    expect(first.logLuminositySolar).not.toBeNull();
    expect(first.teffK).toBeGreaterThan(2000);
    expect(first.spectralClass).not.toBeNull();
  });

  it('computes constant-radius Stefan-Boltzmann curves', () => {
    const curve1Solar = computeConstantRadiusCurve(1, 30);
    const curve100Solar = computeConstantRadiusCurve(100, 30);
    expect(curve1Solar.length).toBe(30);
    // At the same temperature/color, a 100 R☉ star is 10,000x more luminous (10 mag brighter) than a 1 R☉ star
    expect(curve100Solar[10].absoluteMagG).toBeCloseTo(curve1Solar[10].absoluteMagG - 10, 4);
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

    await fetchCustomConeStars(
      client,
      { name: 'NGC 752', ra: 29.421, dec: 37.785, radiusDeg: 0.65, minDistancePc: 380, maxDistancePc: 520 },
      800
    );
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        ra: 29.421,
        dec: 37.785,
        radiusDeg: 0.65,
        limit: 800,
      })
    );
  });

  it('renders 18x24 museum gallery poster canvas with plaque metadata', () => {
    const mockCtx = {
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      clip: vi.fn(),
      rect: vi.fn(),
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const pleiadesPreset = TARGET_PRESETS.find((p) => p.id === 'pleiades')!;

    expect(() =>
      renderGalleryPosterCanvas({
        ctx: mockCtx,
        bounds: HR_BOUNDS,
        schemeId: 'blackbody',
        stars: [{ star: sampleStar, sourceLabel: 'Pleiades' }],
        showRadiusLines: true,
        primaryPreset: pleiadesPreset,
        additionalPresets: [],
      })
    ).not.toThrow();

    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 5400, 7200);
    expect(mockCtx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('PLEIADES'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('handles downloadGalleryPoster safely in browser or headless environments', async () => {
    const pleiades = TARGET_PRESETS.find((p) => p.id === 'pleiades')!;
    // Should resolve cleanly without unhandled rejection
    await expect(downloadGalleryPoster(pleiades, 'blackbody')).resolves.toBeUndefined();
  });

  it('formats clean, non-redundant poster titles without duplicating catalog codes', () => {
    const pleiades = TARGET_PRESETS.find((p) => p.id === 'pleiades')!;
    expect(formatPosterTitle(pleiades)).toBe('M45 · PLEIADES');

    const m13 = TARGET_PRESETS.find((p) => p.id === 'm13')!;
    expect(formatPosterTitle(m13)).toBe('M13 · HERCULES');

    const doubleCluster = TARGET_PRESETS.find((p) => p.id === 'double-cluster')!;
    expect(formatPosterTitle(doubleCluster)).toBe('NGC 869/884 · DOUBLE CLUSTER');

    const m67 = TARGET_PRESETS.find((p) => p.id === 'm67')!;
    expect(formatPosterTitle(m67)).toBe('M67');
  });
});
