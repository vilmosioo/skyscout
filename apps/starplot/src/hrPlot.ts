import type { GaiaClient, GaiaStar } from '@skyscout/gaia-client';

export type TargetPresetId = 'neighborhood' | 'pleiades' | 'm67';

export interface TargetPreset {
  id: TargetPresetId;
  label: string;
  subtitle: string;
}

export const TARGET_PRESETS: TargetPreset[] = [
  {
    id: 'neighborhood',
    label: 'Solar Neighborhood (< 25 pc)',
    subtitle: 'Main Sequence + White Dwarf Cooling Sequence',
  },
  {
    id: 'pleiades',
    label: 'Pleiades (M45)',
    subtitle: 'Young Open Cluster (~115 Myr) with Hot Blue B-Stars',
  },
  {
    id: 'm67',
    label: 'Messier 67 (M67)',
    subtitle: 'Old Open Cluster (~4 Gyr) with Red Giant Turnoff',
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

  let stars: GaiaStar[];
  switch (targetId) {
    case 'neighborhood':
      stars = await client.searchByDistance({
        maxDistancePc: 25,
        minParallaxSnr: 20,
        limit,
      });
      break;

    case 'pleiades':
      stars = await client.coneSearch({
        ra: 56.75,
        dec: 24.12,
        radiusDeg: 2.2,
        minDistancePc: 122,
        maxDistancePc: 152,
        minParallaxSnr: 10,
        maxMagG: 16.5,
        limit,
      });
      break;

    case 'm67':
      stars = await client.coneSearch({
        ra: 132.825,
        dec: 11.8,
        radiusDeg: 0.65,
        minDistancePc: 740,
        maxDistancePc: 980,
        minParallaxSnr: 5,
        maxMagG: 17.5,
        limit,
      });
      break;
  }

  if (stars.length > 0) {
    setCachedTargetStars(targetId, limit, stars, storage);
  }
  return stars;
}

/**
 * Toggles a target preset inside a multi-select list while ensuring at least one source remains selected.
 */
export function toggleTargetSelection(
  selected: TargetPresetId[],
  targetId: TargetPresetId
): TargetPresetId[] {
  if (selected.includes(targetId)) {
    if (selected.length <= 1) return selected;
    return selected.filter((id) => id !== targetId);
  }
  return [...selected, targetId];
}

/**
 * Plot coordinate bounds for the H–R Diagram:
 * - X-axis: Gaia Color Index (G_BP - G_RP) from -0.6 (hot blue) to +3.6 (cool red)
 * - Y-axis: Absolute Magnitude (M_G) from -4.0 (brightest at top) to +16.5 (faintest at bottom)
 */
export const HR_BOUNDS = {
  minBpRp: -0.6,
  maxBpRp: 3.6,
  minAbsMag: -4.0,
  maxAbsMag: 16.5,
} as const;

export interface PlotBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Maps a star's (bpRp, absoluteMagG) into 2D Canvas pixel coordinates (x, y).
 * Follows astronomical convention:
 * - Left -> Right: Blue (-0.6) -> Red (+3.6)
 * - Top -> Bottom: Bright (-4.0 mag) -> Faint (+16.5 mag)
 */
export function starToCanvasXY(
  bpRp: number,
  absoluteMagG: number,
  box: PlotBox
): { x: number; y: number } {
  const xNorm = (bpRp - HR_BOUNDS.minBpRp) / (HR_BOUNDS.maxBpRp - HR_BOUNDS.minBpRp);
  const yNorm =
    (absoluteMagG - HR_BOUNDS.minAbsMag) / (HR_BOUNDS.maxAbsMag - HR_BOUNDS.minAbsMag);

  return {
    x: box.left + xNorm * box.width,
    y: box.top + yNorm * box.height,
  };
}

/**
 * Blackbody color gradient control stops across Gaia (G_BP - G_RP) color index.
 */
const COLOR_STOPS: Array<{ bpRp: number; rgb: [number, number, number] }> = [
  { bpRp: -0.4, rgb: [96, 165, 250] },  // #60a5fa Hot O/B blue
  { bpRp: 0.0, rgb: [186, 230, 253] },  // #bae6fd B/A blue-white
  { bpRp: 0.4, rgb: [248, 250, 252] },  // #f8fafc A/F pure white
  { bpRp: 0.82, rgb: [253, 224, 71] },  // #fde047 G2V Solar yellow
  { bpRp: 1.35, rgb: [251, 146, 60] },  // #fb923c K orange
  { bpRp: 2.3, rgb: [248, 113, 113] },  // #f87171 M red
  { bpRp: 3.5, rgb: [220, 38, 38] },    // #dc2626 Deep M crimson
];

function toHexByte(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');
}

/**
 * Smoothly interpolates Gaia color index (G_BP - G_RP) across a continuous blackbody RGB gradient
 * so star colors blend seamlessly without hard banding lines.
 */
export function bpRpToStarHexColor(bpRp: number): string {
  if (bpRp <= COLOR_STOPS[0].bpRp) {
    const [r, g, b] = COLOR_STOPS[0].rgb;
    return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
  }

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const curr = COLOR_STOPS[i];
    const next = COLOR_STOPS[i + 1];
    if (bpRp <= next.bpRp) {
      const t = (bpRp - curr.bpRp) / (next.bpRp - curr.bpRp);
      const r = curr.rgb[0] + t * (next.rgb[0] - curr.rgb[0]);
      const g = curr.rgb[1] + t * (next.rgb[1] - curr.rgb[1]);
      const b = curr.rgb[2] + t * (next.rgb[2] - curr.rgb[2]);
      return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
    }
  }

  const [r, g, b] = COLOR_STOPS[COLOR_STOPS.length - 1].rgb;
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}
