import type {
  GaiaClient,
  GaiaConeSearchOptions,
  GaiaStar,
  GaiaStarFilterOptions,
} from '@skyscout/gaia-client';

export type TargetPresetId =
  | 'solar-50pc'
  | 'pleiades'
  | 'hyades'
  | 'praesepe'
  | 'm67'
  | 'm35'
  | 'm37'
  | 'm11'
  | 'alpha-persei'
  | 'double-cluster'
  | 'm13'
  | 'm3'
  | 'm5'
  | 'm4'
  | '47-tucanae'
  | 'omega-centauri';

export type TargetCategory = 'Solar Volume' | 'Open Cluster' | 'Globular Cluster';

export interface TargetPreset {
  id: TargetPresetId;
  label: string;
  shortName: string;
  category: TargetCategory;
  subtitle: string;
  age: string;
  distancePcApprox: number;
  cone?: GaiaConeSearchOptions;
  volume?: GaiaStarFilterOptions;
}

export const TARGET_PRESETS: TargetPreset[] = [
  // Solar Volume Shell (< 50 pc)
  {
    id: 'solar-50pc',
    label: 'Solar Neighborhood (< 50 pc / 163 ly)',
    shortName: 'Solar (<50 pc)',
    category: 'Solar Volume',
    subtitle: 'Bright stars & local Red Clump giants within 50 pc of the Sun',
    age: '0.1 – 10 Gyr',
    distancePcApprox: 50,
    volume: {
      maxDistancePc: 50,
      minParallaxSnr: 25,
      sortBy: 'brightest',
    },
  },
  // Open Clusters (Young -> Old)
  {
    id: 'double-cluster',
    label: 'Double Cluster (NGC 869 / 884)',
    shortName: 'Double Cluster',
    category: 'Open Cluster',
    subtitle: 'Ultra-young Perseus OB1 supergiant & OB association (~14 Myr)',
    age: '~14 Myr',
    distancePcApprox: 2250,
    cone: {
      ra: 35.12,
      dec: 57.14,
      radiusDeg: 0.65,
      minDistancePc: 1850,
      maxDistancePc: 2700,
      minParallaxSnr: 4,
      maxMagG: 16.5,
    },
  },
  {
    id: 'alpha-persei',
    label: 'Alpha Persei Cluster (Melotte 20)',
    shortName: 'α Persei',
    category: 'Open Cluster',
    subtitle: 'Young moving group (~50 Myr) anchored by supergiant Mirfak',
    age: '~50 Myr',
    distancePcApprox: 175,
    cone: {
      ra: 51.68,
      dec: 48.97,
      radiusDeg: 3.0,
      minDistancePc: 155,
      maxDistancePc: 195,
      minParallaxSnr: 12,
      maxMagG: 16.0,
    },
  },
  {
    id: 'pleiades',
    label: 'Pleiades (M45 · Seven Sisters)',
    shortName: 'M45 Pleiades',
    category: 'Open Cluster',
    subtitle: 'Young Open Cluster (~115 Myr) with luminous blue B-type stars',
    age: '~115 Myr',
    distancePcApprox: 136,
    cone: {
      ra: 56.75,
      dec: 24.12,
      radiusDeg: 2.2,
      minDistancePc: 122,
      maxDistancePc: 152,
      minParallaxSnr: 10,
      maxMagG: 16.5,
    },
  },
  {
    id: 'm35',
    label: 'Messier 35 (NGC 2168)',
    shortName: 'M35',
    category: 'Open Cluster',
    subtitle: 'Rich Gemini open cluster (~150 Myr) with evolved blue-yellow giants',
    age: '~150 Myr',
    distancePcApprox: 880,
    cone: {
      ra: 92.27,
      dec: 24.34,
      radiusDeg: 0.45,
      minDistancePc: 760,
      maxDistancePc: 1020,
      minParallaxSnr: 5,
      maxMagG: 17.0,
    },
  },
  {
    id: 'm11',
    label: 'Wild Duck Cluster (M11 · NGC 6705)',
    shortName: 'M11 Wild Duck',
    category: 'Open Cluster',
    subtitle: 'One of the richest, most compact open clusters (~250 Myr)',
    age: '~250 Myr',
    distancePcApprox: 1900,
    cone: {
      ra: 282.77,
      dec: -6.27,
      radiusDeg: 0.3,
      minDistancePc: 1600,
      maxDistancePc: 2300,
      minParallaxSnr: 4,
      maxMagG: 16.8,
    },
  },
  {
    id: 'm37',
    label: 'Messier 37 (NGC 2099)',
    shortName: 'M37',
    category: 'Open Cluster',
    subtitle: 'Richest Auriga open cluster (~500 Myr) with over a dozen red giants',
    age: '~500 Myr',
    distancePcApprox: 1400,
    cone: {
      ra: 88.07,
      dec: 32.55,
      radiusDeg: 0.38,
      minDistancePc: 1200,
      maxDistancePc: 1650,
      minParallaxSnr: 5,
      maxMagG: 17.0,
    },
  },
  {
    id: 'hyades',
    label: 'Hyades Cluster (Melotte 25)',
    shortName: 'Hyades',
    category: 'Open Cluster',
    subtitle: 'Nearest open cluster (~47 pc, ~625 Myr) with A-star turnoff & red clump',
    age: '~625 Myr',
    distancePcApprox: 47,
    cone: {
      ra: 66.75,
      dec: 15.87,
      radiusDeg: 6.0,
      minDistancePc: 38,
      maxDistancePc: 57,
      minParallaxSnr: 15,
      maxMagG: 15.5,
    },
  },
  {
    id: 'praesepe',
    label: 'Beehive Cluster (M44 · Praesepe)',
    shortName: 'M44 Beehive',
    category: 'Open Cluster',
    subtitle: 'Intermediate cluster (~650 Myr) with prominent binary star sequence',
    age: '~650 Myr',
    distancePcApprox: 186,
    cone: {
      ra: 130.1,
      dec: 19.67,
      radiusDeg: 1.8,
      minDistancePc: 170,
      maxDistancePc: 205,
      minParallaxSnr: 10,
      maxMagG: 16.5,
    },
  },
  {
    id: 'm67',
    label: 'Messier 67 (M67 · King Cobra)',
    shortName: 'M67',
    category: 'Open Cluster',
    subtitle: 'Solar-age open cluster (~4 Gyr) with textbook Red Giant Branch turnoff',
    age: '~4.0 Gyr',
    distancePcApprox: 850,
    cone: {
      ra: 132.825,
      dec: 11.8,
      radiusDeg: 0.65,
      minDistancePc: 740,
      maxDistancePc: 980,
      minParallaxSnr: 5,
      maxMagG: 17.5,
    },
  },
  // Globular Clusters (Ancient Halo / ~11–13 Gyr)
  {
    id: 'm4',
    label: 'Messier 4 (M4 · NGC 6121)',
    shortName: 'M4',
    category: 'Globular Cluster',
    subtitle: 'Nearest globular cluster to Earth (~1.85 kpc, ~12.2 Gyr) in Scorpius',
    age: '~12.2 Gyr',
    distancePcApprox: 1850,
    cone: {
      ra: 245.897,
      dec: -26.526,
      radiusDeg: 0.35,
      minDistancePc: 1450,
      maxDistancePc: 2350,
      minParallaxSnr: 3,
      maxMagG: 17.2,
    },
  },
  {
    id: '47-tucanae',
    label: '47 Tucanae (NGC 104)',
    shortName: '47 Tuc',
    category: 'Globular Cluster',
    subtitle: 'Massive southern globular cluster (~4.5 kpc, ~11.8 Gyr) with steep RGB',
    age: '~11.8 Gyr',
    distancePcApprox: 4500,
    cone: {
      ra: 6.024,
      dec: -72.081,
      radiusDeg: 0.42,
      minDistancePc: 3300,
      maxDistancePc: 6500,
      minParallaxSnr: 3,
      maxMagG: 17.0,
    },
  },
  {
    id: 'omega-centauri',
    label: 'Omega Centauri (NGC 5139)',
    shortName: 'ω Centauri',
    category: 'Globular Cluster',
    subtitle: 'Largest Milky Way globular cluster (~5.2 kpc, ~11.5 Gyr) & Horizontal Branch',
    age: '~11.5 Gyr',
    distancePcApprox: 5200,
    cone: {
      ra: 201.697,
      dec: -47.479,
      radiusDeg: 0.45,
      minDistancePc: 3600,
      maxDistancePc: 8500,
      minParallaxSnr: 3,
      maxMagG: 17.0,
    },
  },
  {
    id: 'm13',
    label: 'Great Hercules Cluster (M13 · NGC 6205)',
    shortName: 'M13 Hercules',
    category: 'Globular Cluster',
    subtitle: 'Showpiece northern globular cluster (~7.1 kpc, ~11.6 Gyr) with Blue HB',
    age: '~11.6 Gyr',
    distancePcApprox: 7100,
    cone: {
      ra: 250.423,
      dec: 36.46,
      radiusDeg: 0.32,
      minDistancePc: 4500,
      maxDistancePc: 12000,
      minParallaxSnr: 2.5,
      maxMagG: 17.2,
    },
  },
  {
    id: 'm5',
    label: 'Messier 5 (M5 · NGC 5904)',
    shortName: 'M5',
    category: 'Globular Cluster',
    subtitle: 'Ancient Serpens globular cluster (~7.5 kpc, ~12.5 Gyr) rich in RR Lyrae stars',
    age: '~12.5 Gyr',
    distancePcApprox: 7500,
    cone: {
      ra: 229.638,
      dec: 2.081,
      radiusDeg: 0.32,
      minDistancePc: 4800,
      maxDistancePc: 12500,
      minParallaxSnr: 2.5,
      maxMagG: 17.2,
    },
  },
  {
    id: 'm3',
    label: 'Messier 3 (M3 · NGC 5272)',
    shortName: 'M3',
    category: 'Globular Cluster',
    subtitle: 'Archetypal halo globular cluster (~10.2 kpc, ~11.4 Gyr) in Canes Venatici',
    age: '~11.4 Gyr',
    distancePcApprox: 10200,
    cone: {
      ra: 205.548,
      dec: 28.377,
      radiusDeg: 0.3,
      minDistancePc: 6000,
      maxDistancePc: 16000,
      minParallaxSnr: 2,
      maxMagG: 17.5,
    },
  },
];

export const CACHE_KEY_PREFIX = 'starplot:gaia:v1:';

const memoryCache = new Map<string, GaiaStar[]>();

function getCacheKey(targetId: TargetPresetId, limit: number): string {
  return `${CACHE_KEY_PREFIX}${targetId}:${limit}`;
}

/**
 * Reads cached stars for a preset from in-memory or `localStorage` if available.
 */
export function getCachedTargetStars(
  targetId: TargetPresetId,
  limit: number = 1000,
  storage?: Pick<Storage, 'getItem'>
): GaiaStar[] | null {
  const key = getCacheKey(targetId, limit);
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  const store = storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  if (!store) return null;

  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GaiaStar[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage read or parse errors
  }
  return null;
}

/**
 * Persists stars for a preset into in-memory and `localStorage` cache.
 */
export function setCachedTargetStars(
  targetId: TargetPresetId,
  limit: number,
  stars: GaiaStar[],
  storage?: Pick<Storage, 'setItem'>
): void {
  const key = getCacheKey(targetId, limit);
  memoryCache.set(key, stars);

  const store = storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  if (!store) return;

  try {
    store.setItem(key, JSON.stringify(stars));
  } catch {
    // Ignore quota exceeded or private browsing errors
  }
}

/**
 * Clears the in-memory and `localStorage` cache (useful for testing).
 */
export function clearStarCache(storage?: Pick<Storage, 'removeItem'>): void {
  memoryCache.clear();
  const store = storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  if (!store) return;
  for (const preset of TARGET_PRESETS) {
    try {
      store.removeItem(getCacheKey(preset.id, 1000));
    } catch {
      // Ignore
    }
  }
}

/**
 * Fetches live Gaia DR3 stars for the selected target using `@skyscout/gaia-client`,
 * returning cached results from `localStorage` if already fetched.
 */
export async function fetchTargetStars(
  client: GaiaClient,
  targetId: TargetPresetId,
  limit: number = 1000,
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): Promise<GaiaStar[]> {
  const cached = getCachedTargetStars(targetId, limit, storage);
  if (cached) {
    return cached;
  }

  const preset = TARGET_PRESETS.find((p) => p.id === targetId);
  if (!preset) {
    return [];
  }

  let stars: GaiaStar[];
  if (preset.volume) {
    stars = await client.searchStars({
      ...preset.volume,
      limit,
    });
  } else if (preset.cone) {
    stars = await client.coneSearch({
      ...preset.cone,
      limit,
    });
  } else {
    stars = [];
  }

  if (stars.length > 0) {
    setCachedTargetStars(targetId, limit, stars, storage);
  }
  return stars;
}

/**
 * Toggles a target preset inside a multi-select list.
 * Clicking an active source removes it (including allowing all sources to be deselected).
 */
export function toggleTargetSelection(
  selected: TargetPresetId[],
  targetId: TargetPresetId
): TargetPresetId[] {
  if (selected.includes(targetId)) {
    return selected.filter((id) => id !== targetId);
  }
  return [...selected, targetId];
}

/**
 * Generates direct external catalog links (ESA ESASky, CDS VizieR Gaia DR3, and SIMBAD)
 * for an individual Gaia DR3 star.
 */
export function getGaiaStarExternalUrls(star: Pick<GaiaStar, 'sourceId' | 'ra' | 'dec'>): {
  esaSkyUrl: string;
  vizierGaiaDr3Url: string;
  simbadConeUrl: string;
} {
  const sourceId = encodeURIComponent(star.sourceId);
  const ra = star.ra.toFixed(6);
  const dec = star.dec >= 0 ? `+${star.dec.toFixed(6)}` : star.dec.toFixed(6);

  return {
    esaSkyUrl: `https://sky.esa.int/esasky/?target=${ra}%20${encodeURIComponent(dec)}&hips=DSS2+color&fov=0.15&cooframe=J2000&sci=true`,
    vizierGaiaDr3Url: `https://vizier.cds.unistra.fr/viz-bin/VizieR-4?-ref=VIZ65&-to=-4b&-from=-2&-this=-4&%2F%2Fsource=I%2F355%2Fgaiadr3&Source=${sourceId}`,
    simbadConeUrl: `https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra}${encodeURIComponent(dec)}&Radius=5&Radius.unit=arcsec`,
  };
}

/**
 * Plot coordinate bounds for the H–R Diagram:
 * - X-axis: Gaia Color Index (G_BP - G_RP) from -0.6 (hot blue) to +3.6 (cool red)
 * - Y-axis: Absolute Magnitude (M_G) from -4.0 (brightest at top) to +16.5 (faintest at bottom)
 */
export interface HrBounds {
  minBpRp: number;
  maxBpRp: number;
  minAbsMag: number;
  maxAbsMag: number;
}

export const HR_BOUNDS: HrBounds = {
  minBpRp: -0.6,
  maxBpRp: 3.6,
  minAbsMag: -4.5,
  maxAbsMag: 16.5,
};

export interface PlotBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Maps a star's (bpRp, absoluteMagG) into 2D Canvas pixel coordinates (x, y)
 * within the current (optionally zoomed/panned) `bounds`.
 */
export function starToCanvasXY(
  bpRp: number,
  absoluteMagG: number,
  box: PlotBox,
  bounds: HrBounds = HR_BOUNDS
): { x: number; y: number } {
  const xNorm = (bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
  const yNorm =
    (absoluteMagG - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag);

  return {
    x: box.left + xNorm * box.width,
    y: box.top + yNorm * box.height,
  };
}

/**
 * Zooms the H–R coordinate bounds around a normalized focal point `(anchorXNorm, anchorYNorm)` in `[0, 1]`.
 * `scaleFactor < 1` zooms in; `scaleFactor > 1` zooms out.
 */
export function zoomHrBounds(
  bounds: HrBounds,
  scaleFactor: number,
  anchorXNorm: number = 0.5,
  anchorYNorm: number = 0.5
): HrBounds {
  const clampedScale = Math.max(0.15, Math.min(5.0, scaleFactor));
  const currentSpanX = bounds.maxBpRp - bounds.minBpRp;
  const currentSpanY = bounds.maxAbsMag - bounds.minAbsMag;

  // Clamp total zoom range between 10x zoom-in and default full view
  const defaultSpanX = HR_BOUNDS.maxBpRp - HR_BOUNDS.minBpRp;
  const defaultSpanY = HR_BOUNDS.maxAbsMag - HR_BOUNDS.minAbsMag;

  const newSpanX = Math.max(defaultSpanX * 0.08, Math.min(defaultSpanX * 1.25, currentSpanX * clampedScale));
  const newSpanY = Math.max(defaultSpanY * 0.08, Math.min(defaultSpanY * 1.25, currentSpanY * clampedScale));

  const focalBpRp = bounds.minBpRp + anchorXNorm * currentSpanX;
  const focalAbsMag = bounds.minAbsMag + anchorYNorm * currentSpanY;

  return {
    minBpRp: focalBpRp - anchorXNorm * newSpanX,
    maxBpRp: focalBpRp + (1 - anchorXNorm) * newSpanX,
    minAbsMag: focalAbsMag - anchorYNorm * newSpanY,
    maxAbsMag: focalAbsMag + (1 - anchorYNorm) * newSpanY,
  };
}

/**
 * Pans the H–R coordinate bounds by pixel deltas `(dxPx, dyPx)` relative to `box`.
 */
export function panHrBounds(
  bounds: HrBounds,
  dxPx: number,
  dyPx: number,
  box: PlotBox
): HrBounds {
  const spanX = bounds.maxBpRp - bounds.minBpRp;
  const spanY = bounds.maxAbsMag - bounds.minAbsMag;

  const deltaBpRp = -(dxPx / box.width) * spanX;
  const deltaAbsMag = -(dyPx / box.height) * spanY;

  return {
    minBpRp: bounds.minBpRp + deltaBpRp,
    maxBpRp: bounds.maxBpRp + deltaBpRp,
    minAbsMag: bounds.minAbsMag + deltaAbsMag,
    maxAbsMag: bounds.maxAbsMag + deltaAbsMag,
  };
}

/**
 * Color Scheme definitions for rendering and poster exports.
 */
export type ColorSchemeId = 'blackbody' | 'ultraviolet' | 'emerald' | 'gold' | 'print-light';

export interface ColorScheme {
  id: ColorSchemeId;
  label: string;
  canvasBg: string;
  gridColor: string;
  axisTextColor: string;
  titleTextColor: string;
  watermarkColor: string;
  stops: Array<{ bpRp: number; rgb: [number, number, number] }>;
}

export const COLOR_SCHEMES: Record<ColorSchemeId, ColorScheme> = {
  blackbody: {
    id: 'blackbody',
    label: 'Planck Blackbody',
    canvasBg: '#080c16',
    gridColor: 'rgba(255, 255, 255, 0.06)',
    axisTextColor: '#94a3b8',
    titleTextColor: '#e2e8f0',
    watermarkColor: 'rgba(255, 255, 255, 0.14)',
    stops: [
      { bpRp: -0.4, rgb: [96, 165, 250] },  // #60a5fa Hot O/B blue
      { bpRp: 0.0, rgb: [186, 230, 253] },  // #bae6fd B/A blue-white
      { bpRp: 0.4, rgb: [248, 250, 252] },  // #f8fafc A/F pure white
      { bpRp: 0.82, rgb: [253, 224, 71] },  // #fde047 G2V Solar yellow
      { bpRp: 1.35, rgb: [251, 146, 60] },  // #fb923c K orange
      { bpRp: 2.3, rgb: [248, 113, 113] },  // #f87171 M red
      { bpRp: 3.5, rgb: [220, 38, 38] },    // #dc2626 Deep M crimson
    ],
  },
  ultraviolet: {
    id: 'ultraviolet',
    label: 'Cosmic Ultraviolet',
    canvasBg: '#090614',
    gridColor: 'rgba(192, 132, 252, 0.07)',
    axisTextColor: '#a78bfa',
    titleTextColor: '#f3e8ff',
    watermarkColor: 'rgba(192, 132, 252, 0.15)',
    stops: [
      { bpRp: -0.4, rgb: [34, 211, 238] },  // Cyan
      { bpRp: 0.2, rgb: [129, 140, 248] },  // Indigo
      { bpRp: 0.82, rgb: [192, 132, 252] }, // Purple
      { bpRp: 1.6, rgb: [244, 114, 182] },  // Pink-magenta
      { bpRp: 2.8, rgb: [251, 113, 133] },  // Rose
    ],
  },
  emerald: {
    id: 'emerald',
    label: 'Aurora Borealis',
    canvasBg: '#041014',
    gridColor: 'rgba(45, 212, 191, 0.07)',
    axisTextColor: '#5eead4',
    titleTextColor: '#ccfbf1',
    watermarkColor: 'rgba(94, 234, 212, 0.14)',
    stops: [
      { bpRp: -0.4, rgb: [224, 242, 254] }, // Ice blue
      { bpRp: 0.2, rgb: [56, 189, 248] },   // Sky
      { bpRp: 0.82, rgb: [45, 212, 191] },  // Teal
      { bpRp: 1.6, rgb: [52, 211, 153] },   // Emerald
      { bpRp: 2.8, rgb: [163, 230, 53] },   // Lime
    ],
  },
  gold: {
    id: 'gold',
    label: ' JWST Infrared Gold',
    canvasBg: '#0c0906',
    gridColor: 'rgba(251, 191, 36, 0.07)',
    axisTextColor: '#d97706',
    titleTextColor: '#fef3c7',
    watermarkColor: 'rgba(251, 191, 36, 0.14)',
    stops: [
      { bpRp: -0.4, rgb: [255, 251, 235] }, // Brilliant white-gold
      { bpRp: 0.3, rgb: [253, 230, 138] },  // Pale gold
      { bpRp: 0.82, rgb: [251, 191, 36] },  // Amber gold
      { bpRp: 1.6, rgb: [234, 88, 12] },    // Deep orange
      { bpRp: 2.8, rgb: [153, 27, 27] },    // Infrared copper-red
    ],
  },
  'print-light': {
    id: 'print-light',
    label: 'Archival Print (Light)',
    canvasBg: '#faf8f5',
    gridColor: 'rgba(15, 23, 42, 0.08)',
    axisTextColor: '#475569',
    titleTextColor: '#0f172a',
    watermarkColor: 'rgba(15, 23, 42, 0.14)',
    stops: [
      { bpRp: -0.4, rgb: [29, 78, 216] },   // Deep Cobalt Blue
      { bpRp: 0.1, rgb: [2, 132, 199] },    // Cerulean
      { bpRp: 0.55, rgb: [13, 148, 136] },  // Slate Teal
      { bpRp: 0.82, rgb: [202, 138, 4] },   // Ochre Gold
      { bpRp: 1.4, rgb: [234, 88, 12] },    // Burnt Orange
      { bpRp: 2.5, rgb: [185, 28, 28] },    // Crimson Ink
    ],
  },
};

function toHexByte(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');
}

/**
 * Smoothly interpolates Gaia color index (G_BP - G_RP) across a continuous RGB gradient
 * for the selected `schemeId` so star colors blend seamlessly without hard lines.
 */
export function bpRpToStarHexColor(
  bpRp: number,
  schemeId: ColorSchemeId = 'blackbody'
): string {
  const stops = COLOR_SCHEMES[schemeId]?.stops ?? COLOR_SCHEMES.blackbody.stops;
  if (bpRp <= stops[0].bpRp) {
    const [r, g, b] = stops[0].rgb;
    return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const curr = stops[i];
    const next = stops[i + 1];
    if (bpRp <= next.bpRp) {
      const t = (bpRp - curr.bpRp) / (next.bpRp - curr.bpRp);
      const r = curr.rgb[0] + t * (next.rgb[0] - curr.rgb[0]);
      const g = curr.rgb[1] + t * (next.rgb[1] - curr.rgb[1]);
      const b = curr.rgb[2] + t * (next.rgb[2] - curr.rgb[2]);
      return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
    }
  }

  const [r, g, b] = stops[stops.length - 1].rgb;
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

/**
 * Classifies a star's evolutionary stage and estimates its stellar radius in solar units ($R / R_\odot$)
 * using the Stefan-Boltzmann law: $R / R_\odot = \sqrt{L / L_\odot} \times (T_\odot / T_{\text{eff}})^2$.
 */
export function getStarPhysicalDetails(star: GaiaStar): {
  evolutionaryStage: string;
  luminositySolar: number | null;
  radiusSolar: number | null;
} {
  const absMag = star.absoluteMagG;
  const bpRp = star.bpRp ?? 0.8;

  let evolutionaryStage = 'Main Sequence Dwarf';
  if (absMag !== null) {
    if (absMag > 9.0 && bpRp < 0.95) {
      evolutionaryStage = 'White Dwarf Remnant';
    } else if (absMag < -2.5) {
      evolutionaryStage = bpRp < 0.3 ? 'Blue Supergiant' : 'Red / Yellow Supergiant';
    } else if (absMag < 2.2 && bpRp > 0.85) {
      evolutionaryStage = 'Red Giant Branch';
    } else if (absMag >= 2.2 && absMag < 3.6 && bpRp > 0.82) {
      evolutionaryStage = 'Subgiant Star';
    } else if (bpRp < 0.0) {
      evolutionaryStage = 'Hot Blue Main Sequence';
    } else if (bpRp > 1.8) {
      evolutionaryStage = 'Red Dwarf (M-V)';
    }
  }

  const luminositySolar =
    star.logLuminositySolar !== null ? Math.pow(10, star.logLuminositySolar) : null;

  let radiusSolar: number | null = null;
  if (luminositySolar !== null && star.teffK !== null && star.teffK > 0) {
    const tempRatio = 5778 / star.teffK;
    radiusSolar = Math.sqrt(luminositySolar) * tempRatio * tempRatio;
  }

  return {
    evolutionaryStage,
    luminositySolar,
    radiusSolar,
  };
}
