import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GaiaClient, type GaiaStar } from '@skyscout/gaia-client';
import {
  bpRpToStarHexColor,
  clearStarCache,
  COLOR_SCHEMES,
  computeConstantRadiusCurve,
  computeStarCanvasRadius,
  downloadGalleryPoster,
  drawCornerTelescopePlate,
  FAMOUS_CLUSTER_STARS,
  fetchCustomConeStars,
  fetchTargetStars,
  findClosestStarAtPoint,
  formatPosterTitle,
  generateClusterFallbackStars,
  generateClusterPreviewPoints,
  getClusterCutoutUrl,
  getGaiaStarExternalUrls,
  getStarPhysicalDetails,
  hexToRgba,
  HR_BOUNDS,
  panHrBounds,
  POSTER_THEMES,
  renderFineArtPoster,
  renderGalleryPosterCanvas,
  renderTwoMapsPoster,
  type PosterThemeId,
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

    // Verify distinct astrophysics and morphology across different clusters
    const ngc6231 = TARGET_PRESETS.find((p) => p.id === 'ngc-6231')!; // Ultra-young 12 Myr OB nursery
    const m67 = TARGET_PRESETS.find((p) => p.id === 'm67')!; // Ancient 4 Gyr open cluster
    const m13 = TARGET_PRESETS.find((p) => p.id === 'm13')!; // 12 Gyr globular cluster
    const doubleCluster = TARGET_PRESETS.find((p) => p.id === 'double-cluster')!; // Twin core

    const stars6231 = generateClusterFallbackStars(ngc6231);
    const starsM67 = generateClusterFallbackStars(m67);
    const starsM13 = generateClusterFallbackStars(m13);
    const starsDouble = generateClusterFallbackStars(doubleCluster);

    // NGC 6231 has blazing OB supergiants (M_G < -4)
    const brightest6231 = Math.min(...stars6231.map((s) => s.absoluteMagG!));
    expect(brightest6231).toBeLessThan(-3.5);

    // M67 is ancient: turnoff is faint (M_G ~ 3.8) and brightest giants rarely exceed M_G ~ -1
    const brightestM67 = Math.min(...starsM67.map((s) => s.absoluteMagG!));
    expect(brightestM67).toBeGreaterThan(brightest6231 + 2.5);

    // M13 Globular cluster has horizontal branch stars (M_G ~ 0.5 across blue-yellow colors)
    const hbStars = starsM13.filter((s) => s.absoluteMagG! >= 0.2 && s.absoluteMagG! <= 1.0 && s.bpRp! < 0.3);
    expect(hbStars.length).toBeGreaterThan(5);

    // Double Cluster has stars split between two distinct cores
    const westStars = starsDouble.filter((s) => s.ra < doubleCluster.cone!.ra);
    const eastStars = starsDouble.filter((s) => s.ra > doubleCluster.cone!.ra);
    expect(westStars.length).toBeGreaterThan(50);
    expect(eastStars.length).toBeGreaterThan(50);
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

  describe('3 Distinct Museum Fine-Art Poster Themes', () => {
    const createMockCtx = () =>
      ({
        fillRect: vi.fn(),
        fillText: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        clip: vi.fn(),
        rect: vi.fn(),
        drawImage: vi.fn(),
        setLineDash: vi.fn(),
        measureText: vi.fn(() => ({ width: 120 })),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      } as unknown as CanvasRenderingContext2D);

    const testPreset = TARGET_PRESETS.find((p) => p.id === 'ngc-6231') || TARGET_PRESETS[0];
    const testStars = [{ star: sampleStar, sourceLabel: testPreset.shortName }];

    it('defines the three requested themes with correct visual metadata', () => {
      const themes = Object.keys(POSTER_THEMES) as PosterThemeId[];
      expect(themes).toEqual(['two-maps', 'star-quilt', 'night-fall']);

      expect(POSTER_THEMES['two-maps'].name).toBe('Two Maps');
      expect(POSTER_THEMES['two-maps'].isLight).toBe(false);

      expect(POSTER_THEMES['star-quilt'].name).toBe('Star Quilt');
      expect(POSTER_THEMES['star-quilt'].isLight).toBe(true);

      expect(POSTER_THEMES['night-fall'].name).toBe('Night Fall');
      expect(POSTER_THEMES['night-fall'].isLight).toBe(false);
    });

    it('renders Two Maps poster with sky disc, diagram box and connecting strands', () => {
      const ctx = createMockCtx();
      renderFineArtPoster({
        ctx,
        width: 5400,
        height: 7200,
        bounds: HR_BOUNDS,
        themeId: 'two-maps',
        stars: testStars,
        primaryPreset: testPreset,
      });

      // Background fill
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 5400, 7200);
      // Sky disc and stars drawn with arc
      expect(ctx.arc).toHaveBeenCalled();
      // Connecting bezier curves
      expect(ctx.bezierCurveTo).toHaveBeenCalled();
      // Editorial typography with cluster title
      expect(ctx.fillText).toHaveBeenCalledWith(
        formatPosterTitle(testPreset),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('renders Star Quilt poster on archival cream with stitched patchwork tiles', () => {
      const ctx = createMockCtx();
      renderFineArtPoster({
        ctx,
        width: 5400,
        height: 7200,
        bounds: HR_BOUNDS,
        themeId: 'star-quilt',
        stars: testStars,
        primaryPreset: testPreset,
      });

      // Archival cream background
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 5400, 7200);
      // Dashed stitching lines for quilt patches
      expect(ctx.setLineDash).toHaveBeenCalledWith([8, 6]);
      // Prominent cluster title
      expect(ctx.fillText).toHaveBeenCalledWith(
        formatPosterTitle(testPreset),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('renders Night Fall poster with frameless cosmic flowing strands', () => {
      const ctx = createMockCtx();
      renderFineArtPoster({
        ctx,
        width: 5400,
        height: 7200,
        bounds: HR_BOUNDS,
        themeId: 'night-fall',
        stars: testStars,
        primaryPreset: testPreset,
      });

      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 5400, 7200);
      // Flowing luminous strands
      expect(ctx.bezierCurveTo).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
    });

    it('generates public-domain cutout URLs via HipsClient with correct survey and coordinates', () => {
      const pleiades = TARGET_PRESETS.find((p) => p.id === 'pleiades')!;
      const url2Mass = getClusterCutoutUrl(pleiades, '2mass');
      const urlDss2 = getClusterCutoutUrl(pleiades, 'dss2');

      expect(url2Mass).toContain('CDS%2FP%2F2MASS%2Fcolor');
      expect(url2Mass).toContain(`ra=${pleiades.cone!.ra.toFixed(6)}`);
      expect(urlDss2).toContain('CDS%2FP%2FDSS2%2Fcolor');
    });

    it('renders archival corner telescope plate with scientific reticle brackets and crosshairs', () => {
      const pleiades = TARGET_PRESETS.find((p) => p.id === 'pleiades')!;
      const ctx = createMockCtx();
      const mockImage = {} as CanvasImageSource;

      drawCornerTelescopePlate({
        ctx,
        x: 4030,
        y: 360,
        size: 680,
        image: mockImage,
        preset: pleiades,
        themeIsLight: false,
      });

      expect(ctx.strokeRect).toHaveBeenCalledWith(4030, 360, 680, 680);
      expect(ctx.drawImage).toHaveBeenCalledWith(mockImage, 4030, 360, 680, 680);
      expect(ctx.fillText).toHaveBeenCalledWith('PHOTOGRAPHIC SURVEY PLATE', 4030, 340);
      expect(ctx.fillText).toHaveBeenCalledWith('NASA IPAC 2MASS ALL-SKY INFRARED', 4030, 360 + 680 + 32);
    });

    it('highlights famous or brightest stars with glowing strands, radial halos, and callout labels in Two Maps poster', () => {
      const pleiadesPreset = TARGET_PRESETS.find((p) => p.id === 'pleiades')!;
      expect(FAMOUS_CLUSTER_STARS['pleiades']).toBeDefined();
      expect(FAMOUS_CLUSTER_STARS['pleiades'][0].name).toBe('Alcyone');

      const ctx = createMockCtx();
      renderTwoMapsPoster({
        ctx,
        width: 5400,
        height: 7200,
        bounds: HR_BOUNDS,
        stars: [
          {
            star: {
              ...sampleStar,
              sourceId: 'star-alcyone',
              absoluteMagG: -3.2,
              bpRp: -0.09,
            },
            sourceLabel: 'Pleiades',
          },
          {
            star: {
              ...sampleStar,
              sourceId: 'star-atlas',
              absoluteMagG: -2.8,
              bpRp: -0.05,
            },
            sourceLabel: 'Pleiades',
          },
          {
            star: {
              ...sampleStar,
              sourceId: 'star-faint',
              absoluteMagG: 5.5,
              bpRp: 0.95,
            },
            sourceLabel: 'Pleiades',
          },
        ],
        primaryPreset: pleiadesPreset,
      });

      // Verifies radial gradient creation for halos
      expect(ctx.createRadialGradient).toHaveBeenCalled();
      // Verifies hero title rendered at the top of the poster (y=400)
      expect(ctx.fillText).toHaveBeenCalledWith(formatPosterTitle(pleiadesPreset), 650, 400);
      // Verifies star name callout label for Alcyone
      expect(ctx.fillText).toHaveBeenCalledWith('Alcyone', expect.any(Number), expect.any(Number));
      // Verifies authentic poster description text
      expect(ctx.fillText).toHaveBeenCalledWith(
        '(bright at top). Lines join the brightest stars.',
        expect.any(Number),
        expect.any(Number)
      );
      // Verifies hexToRgba helper
      expect(hexToRgba('#60a5fa', 0.5)).toBe('rgba(96, 165, 250, 0.5)');
    });

    it('renders heliocentric Solar Neighborhood sphere centered on the Sun for solar-50pc', () => {
      const solarPreset = TARGET_PRESETS.find((p) => p.id === 'solar-50pc')!;
      expect(solarPreset).toBeDefined();

      const ctx = createMockCtx();
      renderTwoMapsPoster({
        ctx,
        width: 5400,
        height: 7200,
        bounds: HR_BOUNDS,
        stars: [
          {
            star: {
              ...sampleStar,
              sourceId: 'star-sirius',
              distancePc: 2.64,
              absoluteMagG: 1.43,
              bpRp: -0.03,
            },
            sourceLabel: 'Solar Volume',
          },
          {
            star: {
              ...sampleStar,
              sourceId: 'star-vega',
              distancePc: 7.68,
              absoluteMagG: 0.58,
              bpRp: 0.0,
            },
            sourceLabel: 'Solar Volume',
          },
        ],
        primaryPreset: solarPreset,
      });

      // Verifies Sun anchor label & heliocentric subtitle
      expect(ctx.fillText).toHaveBeenCalledWith('☉ Sun (0 pc)', expect.any(Number), expect.any(Number));
      expect(ctx.fillText).toHaveBeenCalledWith(
        'THE SOLAR NEIGHBORHOOD — 50 PC SPHERE CENTERED ON THE SUN',
        expect.any(Number),
        expect.any(Number)
      );
      // Verifies tailored solar neighborhood description
      expect(ctx.fillText).toHaveBeenCalledWith(
        'Above, our local stellar neighborhood mapped from the',
        expect.any(Number),
        expect.any(Number)
      );
    });
  });
});
