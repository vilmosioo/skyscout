import { bpRpToEffectiveTempK, bpRpToSpectralClass, formatDms, formatHms } from '@skyscout/core';
import { NasaClient, type TwoMassStar } from '@skyscout/nasa-client';
import type {
  GaiaClient,
  GaiaConeSearchOptions,
  GaiaStar,
  GaiaStarFilterOptions,
} from '@skyscout/gaia-client';

export type TargetPresetId =
  | 'solar-50pc'
  | 'ngc-6231'
  | 'double-cluster'
  | 'jewel-box'
  | 'ic-2602'
  | 'alpha-persei'
  | 'm47'
  | 'm6'
  | 'pleiades'
  | 'm35'
  | 'm7'
  | 'm11'
  | 'm38'
  | 'wishing-well'
  | 'm39'
  | 'm46'
  | 'm37'
  | 'hyades'
  | 'praesepe'
  | 'm67'
  | 'ngc-188'
  | 'm4'
  | 'ngc-6397'
  | 'm22'
  | '47-tucanae'
  | 'omega-centauri'
  | 'm13'
  | 'm5'
  | 'm3'
  | 'm10'
  | 'm12'
  | 'm15'
  | 'm92';

export type TargetCategory = 'Solar Volume' | 'Open Cluster' | 'Globular Cluster';

export interface TargetPreset {
  id: TargetPresetId;
  label: string;
  shortName: string;
  catalogCode?: string;
  constellation?: string;
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
    catalogCode: 'Local Bubble',
    constellation: 'All-Sky',
    category: 'Solar Volume',
    subtitle: 'Bright stars, Main Sequence spine, White Dwarfs & local Red Clump giants within 50 pc',
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
    id: 'ngc-6231',
    label: 'Northern Jewel Box (NGC 6231 · Caldwell 76)',
    shortName: 'NGC 6231',
    catalogCode: 'NGC 6231',
    constellation: 'Scorpius',
    category: 'Open Cluster',
    subtitle: 'Luminous OB supergiant nursery (~12 Myr) at the heart of Scorpius OB1',
    age: '~12 Myr',
    distancePcApprox: 1590,
    cone: {
      ra: 253.535,
      dec: -41.827,
      radiusDeg: 0.35,
      minDistancePc: 1300,
      maxDistancePc: 1950,
      minParallaxSnr: 4,
      maxMagG: 16.5,
    },
  },
  {
    id: 'double-cluster',
    label: 'Double Cluster (NGC 869 / 884 · h & χ Persei)',
    shortName: 'Double Cluster',
    catalogCode: 'NGC 869/884',
    constellation: 'Perseus',
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
    id: 'jewel-box',
    label: 'Jewel Box Cluster (NGC 4755 · κ Crucis)',
    shortName: 'Jewel Box',
    catalogCode: 'NGC 4755',
    constellation: 'Crux',
    category: 'Open Cluster',
    subtitle: 'Brilliant blue B-supergiants contrasted with a ruby M-supergiant (~16 Myr)',
    age: '~16 Myr',
    distancePcApprox: 1970,
    cone: {
      ra: 193.412,
      dec: -60.362,
      radiusDeg: 0.28,
      minDistancePc: 1650,
      maxDistancePc: 2350,
      minParallaxSnr: 4,
      maxMagG: 16.5,
    },
  },
  {
    id: 'ic-2602',
    label: 'Southern Pleiades (IC 2602 · θ Carinae)',
    shortName: 'IC 2602',
    catalogCode: 'IC 2602',
    constellation: 'Carina',
    category: 'Open Cluster',
    subtitle: 'Nearby young southern cluster (~35 Myr) spanning Carina',
    age: '~35 Myr',
    distancePcApprox: 152,
    cone: {
      ra: 160.739,
      dec: -64.401,
      radiusDeg: 1.5,
      minDistancePc: 135,
      maxDistancePc: 170,
      minParallaxSnr: 10,
      maxMagG: 16.5,
    },
  },
  {
    id: 'alpha-persei',
    label: 'Alpha Persei Cluster (Melotte 20)',
    shortName: 'α Persei',
    catalogCode: 'Mel 20',
    constellation: 'Perseus',
    category: 'Open Cluster',
    subtitle: 'Young moving group (~50 Myr) anchored by yellow supergiant Mirfak',
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
    id: 'm47',
    label: 'Messier 47 (NGC 2422)',
    shortName: 'M47',
    catalogCode: 'M47',
    constellation: 'Puppis',
    category: 'Open Cluster',
    subtitle: 'Bright Puppis open cluster (~78 Myr) dominated by hot B and A main-sequence stars',
    age: '~78 Myr',
    distancePcApprox: 490,
    cone: {
      ra: 114.146,
      dec: -14.483,
      radiusDeg: 0.55,
      minDistancePc: 430,
      maxDistancePc: 550,
      minParallaxSnr: 6,
      maxMagG: 16.5,
    },
  },
  {
    id: 'm6',
    label: 'Butterfly Cluster (Messier 6 · NGC 6405)',
    shortName: 'Butterfly',
    catalogCode: 'M6',
    constellation: 'Scorpius',
    category: 'Open Cluster',
    subtitle: 'Scorpius open cluster (~95 Myr) featuring orange K-giant BM Scorpii',
    age: '~95 Myr',
    distancePcApprox: 460,
    cone: {
      ra: 265.083,
      dec: -32.253,
      radiusDeg: 0.45,
      minDistancePc: 410,
      maxDistancePc: 520,
      minParallaxSnr: 6,
      maxMagG: 16.5,
    },
  },
  {
    id: 'pleiades',
    label: 'Pleiades (M45 · Seven Sisters)',
    shortName: 'Pleiades',
    catalogCode: 'M45',
    constellation: 'Taurus',
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
    catalogCode: 'M35',
    constellation: 'Gemini',
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
    id: 'm7',
    label: 'Ptolemy Cluster (Messier 7 · NGC 6475)',
    shortName: 'Ptolemy',
    catalogCode: 'M7',
    constellation: 'Scorpius',
    category: 'Open Cluster',
    subtitle: 'Naked-eye Scorpius cluster (~200 Myr) known since antiquity',
    age: '~200 Myr',
    distancePcApprox: 280,
    cone: {
      ra: 268.463,
      dec: -34.793,
      radiusDeg: 0.85,
      minDistancePc: 245,
      maxDistancePc: 315,
      minParallaxSnr: 8,
      maxMagG: 16.5,
    },
  },
  {
    id: 'm11',
    label: 'Wild Duck Cluster (M11 · NGC 6705)',
    shortName: 'Wild Duck',
    catalogCode: 'M11',
    constellation: 'Scutum',
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
    id: 'm38',
    label: 'Starfish Cluster (Messier 38 · NGC 1912)',
    shortName: 'Starfish',
    catalogCode: 'M38',
    constellation: 'Auriga',
    category: 'Open Cluster',
    subtitle: 'Intermediate-age Auriga cluster (~290 Myr) with yellow G-type giants',
    age: '~290 Myr',
    distancePcApprox: 1060,
    cone: {
      ra: 82.167,
      dec: 35.855,
      radiusDeg: 0.4,
      minDistancePc: 920,
      maxDistancePc: 1250,
      minParallaxSnr: 5,
      maxMagG: 17.0,
    },
  },
  {
    id: 'wishing-well',
    label: 'Wishing Well Cluster (NGC 3532 · Caldwell 91)',
    shortName: 'Wishing Well',
    catalogCode: 'NGC 3532',
    constellation: 'Carina',
    category: 'Open Cluster',
    subtitle: 'Spectacular Carina open cluster (~300 Myr) — first target imaged by Hubble',
    age: '~300 Myr',
    distancePcApprox: 485,
    cone: {
      ra: 166.449,
      dec: -58.753,
      radiusDeg: 0.55,
      minDistancePc: 430,
      maxDistancePc: 540,
      minParallaxSnr: 7,
      maxMagG: 16.5,
    },
  },
  {
    id: 'm39',
    label: 'Messier 39 (NGC 7092)',
    shortName: 'M39',
    catalogCode: 'M39',
    constellation: 'Cygnus',
    category: 'Open Cluster',
    subtitle: 'Loose, bright Cygnus cluster (~300 Myr) with crisp main-sequence turnoff',
    age: '~300 Myr',
    distancePcApprox: 300,
    cone: {
      ra: 322.958,
      dec: 48.433,
      radiusDeg: 0.75,
      minDistancePc: 265,
      maxDistancePc: 335,
      minParallaxSnr: 8,
      maxMagG: 16.5,
    },
  },
  {
    id: 'm46',
    label: 'Messier 46 (NGC 2437)',
    shortName: 'M46',
    catalogCode: 'M46',
    constellation: 'Puppis',
    category: 'Open Cluster',
    subtitle: 'Rich Puppis cluster (~300 Myr) containing planetary nebula NGC 2438 in line of sight',
    age: '~300 Myr',
    distancePcApprox: 1510,
    cone: {
      ra: 115.442,
      dec: -14.81,
      radiusDeg: 0.35,
      minDistancePc: 1320,
      maxDistancePc: 1750,
      minParallaxSnr: 4,
      maxMagG: 17.0,
    },
  },
  {
    id: 'm37',
    label: 'Messier 37 (NGC 2099)',
    shortName: 'M37',
    catalogCode: 'M37',
    constellation: 'Auriga',
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
    catalogCode: 'Mel 25',
    constellation: 'Taurus',
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
    shortName: 'Beehive',
    catalogCode: 'M44',
    constellation: 'Cancer',
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
    catalogCode: 'M67',
    constellation: 'Cancer',
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
  {
    id: 'ngc-188',
    label: 'NGC 188 (Caldwell 1 · Ancient Polar Cluster)',
    shortName: 'NGC 188',
    catalogCode: 'NGC 188',
    constellation: 'Cepheus',
    category: 'Open Cluster',
    subtitle: 'One of the oldest open clusters in the Milky Way (~6.8 Gyr) near Polaris',
    age: '~6.8 Gyr',
    distancePcApprox: 1850,
    cone: {
      ra: 11.798,
      dec: 85.244,
      radiusDeg: 0.45,
      minDistancePc: 1550,
      maxDistancePc: 2200,
      minParallaxSnr: 4,
      maxMagG: 17.8,
    },
  },
  // Globular Clusters (Ancient Halo / ~11–13 Gyr)
  {
    id: 'm4',
    label: 'Messier 4 (M4 · NGC 6121)',
    shortName: 'M4',
    catalogCode: 'M4',
    constellation: 'Scorpius',
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
    id: 'ngc-6397',
    label: 'NGC 6397 (Caldwell 86 · Core-Collapsed Globular)',
    shortName: 'NGC 6397',
    catalogCode: 'NGC 6397',
    constellation: 'Ara',
    category: 'Globular Cluster',
    subtitle: 'Metal-poor southern globular cluster (~2.4 kpc, ~12.6 Gyr) with tight main sequence',
    age: '~12.6 Gyr',
    distancePcApprox: 2400,
    cone: {
      ra: 265.175,
      dec: -53.674,
      radiusDeg: 0.38,
      minDistancePc: 1900,
      maxDistancePc: 3100,
      minParallaxSnr: 3,
      maxMagG: 17.2,
    },
  },
  {
    id: 'm22',
    label: 'Great Sagittarius Cluster (Messier 22 · NGC 6656)',
    shortName: 'Sagittarius',
    catalogCode: 'M22',
    constellation: 'Sagittarius',
    category: 'Globular Cluster',
    subtitle: 'Bright elliptical globular cluster (~3.2 kpc, ~12.0 Gyr) near the Galactic Bulge',
    age: '~12.0 Gyr',
    distancePcApprox: 3200,
    cone: {
      ra: 279.1,
      dec: -23.905,
      radiusDeg: 0.35,
      minDistancePc: 2400,
      maxDistancePc: 4300,
      minParallaxSnr: 3,
      maxMagG: 17.0,
    },
  },
  {
    id: '47-tucanae',
    label: '47 Tucanae (NGC 104)',
    shortName: '47 Tuc',
    catalogCode: 'NGC 104',
    constellation: 'Tucana',
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
    catalogCode: 'NGC 5139',
    constellation: 'Centaurus',
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
    id: 'm10',
    label: 'Messier 10 (NGC 6254)',
    shortName: 'M10',
    catalogCode: 'M10',
    constellation: 'Ophiuchus',
    category: 'Globular Cluster',
    subtitle: 'Rich Ophiuchus globular cluster (~4.4 kpc, ~11.4 Gyr) with blue horizontal branch',
    age: '~11.4 Gyr',
    distancePcApprox: 4400,
    cone: {
      ra: 254.288,
      dec: -4.1,
      radiusDeg: 0.3,
      minDistancePc: 3200,
      maxDistancePc: 6500,
      minParallaxSnr: 2.5,
      maxMagG: 17.2,
    },
  },
  {
    id: 'm12',
    label: 'Gumball Globular (Messier 12 · NGC 6218)',
    shortName: 'Gumball',
    catalogCode: 'M12',
    constellation: 'Ophiuchus',
    category: 'Globular Cluster',
    subtitle: 'Loosely concentrated Ophiuchus globular cluster (~5.1 kpc, ~12.6 Gyr)',
    age: '~12.6 Gyr',
    distancePcApprox: 5100,
    cone: {
      ra: 251.809,
      dec: -1.949,
      radiusDeg: 0.3,
      minDistancePc: 3600,
      maxDistancePc: 7500,
      minParallaxSnr: 2.5,
      maxMagG: 17.2,
    },
  },
  {
    id: 'm13',
    label: 'Great Hercules Cluster (M13 · NGC 6205)',
    shortName: 'Hercules',
    catalogCode: 'M13',
    constellation: 'Hercules',
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
    catalogCode: 'M5',
    constellation: 'Serpens',
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
    id: 'm92',
    label: 'Messier 92 (NGC 6341)',
    shortName: 'M92',
    catalogCode: 'M92',
    constellation: 'Hercules',
    category: 'Globular Cluster',
    subtitle: 'One of the oldest, most metal-poor globular clusters in the Milky Way (~13.0 Gyr)',
    age: '~13.0 Gyr',
    distancePcApprox: 8300,
    cone: {
      ra: 259.281,
      dec: 43.136,
      radiusDeg: 0.28,
      minDistancePc: 5200,
      maxDistancePc: 13500,
      minParallaxSnr: 2.2,
      maxMagG: 17.4,
    },
  },
  {
    id: 'm3',
    label: 'Messier 3 (M3 · NGC 5272)',
    shortName: 'M3',
    catalogCode: 'M3',
    constellation: 'Canes Venatici',
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
  {
    id: 'm15',
    label: 'Great Pegasus Cluster (Messier 15 · NGC 7078)',
    shortName: 'Pegasus',
    catalogCode: 'M15',
    constellation: 'Pegasus',
    category: 'Globular Cluster',
    subtitle: 'Dense core-collapsed Pegasus globular cluster (~10.4 kpc, ~12.5 Gyr)',
    age: '~12.5 Gyr',
    distancePcApprox: 10400,
    cone: {
      ra: 322.493,
      dec: 12.167,
      radiusDeg: 0.28,
      minDistancePc: 6200,
      maxDistancePc: 16500,
      minParallaxSnr: 2,
      maxMagG: 17.5,
    },
  },
];

export const NASA_CACHE_KEY_PREFIX = 'starplot:nasa:v1:';
const nasaMemoryCache = new Map<string, GaiaStar[]>();
const nasaInFlightRequests = new Map<string, Promise<GaiaStar[]>>();

function getNasaCacheKey(targetId: TargetPresetId, limit: number): string {
  return `${NASA_CACHE_KEY_PREFIX}${targetId}:${limit}`;
}

export function getCachedNasaStars(
  targetId: TargetPresetId,
  limit: number = 1000,
  storage?: Pick<Storage, 'getItem'>
): GaiaStar[] | null {
  const key = getNasaCacheKey(targetId, limit);
  if (nasaMemoryCache.has(key)) {
    return nasaMemoryCache.get(key)!;
  }

  const store = storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  if (!store) return null;

  try {
    const raw = store.getItem(key) ?? (limit !== 1000 ? store.getItem(getNasaCacheKey(targetId, 1000)) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GaiaStar[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      nasaMemoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

export function setCachedNasaStars(
  targetId: TargetPresetId,
  limit: number,
  stars: GaiaStar[],
  storage?: Pick<Storage, 'setItem'> & Partial<Pick<Storage, 'removeItem'>>
): void {
  const key = getNasaCacheKey(targetId, limit);
  nasaMemoryCache.set(key, stars);

  const store = storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  if (!store) return;

  const serialized = JSON.stringify(stars);
  try {
    store.setItem(key, serialized);
  } catch {
    // Quota eviction
    if (typeof store.removeItem === 'function') {
      for (const p of TARGET_PRESETS) {
        if (p.id === targetId) continue;
        try {
          store.removeItem(getNasaCacheKey(p.id, limit));
          store.removeItem(getNasaCacheKey(p.id, 1000));
          store.setItem(key, serialized);
          break;
        } catch {
          // Keep evicting
        }
      }
    }
  }
}

/**
 * Fetches stars for a cluster using the NASA 2MASS All-Sky Point Source Catalog via `@skyscout/nasa-client`,
 * with in-memory and persistent `localStorage` heavy caching.
 */
export async function fetchNasaClusterStars(
  client: NasaClient,
  targetId: TargetPresetId,
  limit: number = 1000,
  storage?: Pick<Storage, 'getItem' | 'setItem'> & Partial<Pick<Storage, 'removeItem'>>
): Promise<GaiaStar[]> {
  const cached = getCachedNasaStars(targetId, limit, storage);
  if (cached && cached.length > 0) {
    return cached;
  }

  const preset = TARGET_PRESETS.find((p) => p.id === targetId);
  if (!preset) return [];

  const key = getNasaCacheKey(targetId, limit);
  const existingInFlight = nasaInFlightRequests.get(key);
  if (existingInFlight) {
    return existingInFlight;
  }

  const requestPromise = (async (): Promise<GaiaStar[]> => {
    try {
      const ra = preset.cone?.ra ?? 56.75;
      const dec = preset.cone?.dec ?? 24.12;
      const radiusDeg = Math.min(1.5, Math.max(0.2, preset.cone?.radiusDeg ?? 0.8));
      const distPc = preset.distancePcApprox || 150;
      const distMod = 5 * Math.log10(distPc) - 5;

      const nasaStars = await client.coneSearch2Mass({
        ra,
        dec,
        radiusDeg,
        limit,
      });

      if (nasaStars.length === 0) {
        const fallback = generateClusterFallbackStars(preset);
        setCachedNasaStars(targetId, limit, fallback, storage);
        return fallback;
      }

      const stars: GaiaStar[] = nasaStars.map((s, idx) => {
        const j = s.jMag ?? 10;
        const k = s.kMag ?? j;
        const jMinusK = s.jMinusK ?? 0.4;
        const bpRp = Number((jMinusK * 2.3).toFixed(3));
        const absMag = Number((k - distMod).toFixed(3));
        const teffK = bpRpToEffectiveTempK(bpRp);

        return {
          sourceId: s.designation || `nasa-${preset.id}-${idx + 1}`,
          ra: s.ra,
          dec: s.dec,
          parallaxMas: Number((1000 / distPc).toFixed(3)),
          parallaxErrorMas: 0.05,
          parallaxSnr: 25,
          pmRaMasYr: 0,
          pmDecMasYr: 0,
          radialVelocityKmS: null,
          magG: j,
          magBp: j,
          magRp: k,
          bpRp,
          teffK: teffK ? Math.round(teffK) : null,
          extinctionAg: 0.05,
          reddeningBpRp: 0.02,
          distancePc: distPc,
          distanceLy: Number((distPc * 3.26156).toFixed(1)),
          absoluteMagG: absMag,
          logLuminositySolar: Number(((4.74 - absMag) / 2.5).toFixed(3)),
          spectralClass: bpRpToSpectralClass(bpRp),
        };
      });

      setCachedNasaStars(targetId, limit, stars, storage);
      return stars;
    } catch (err) {
      console.warn(`NASA query failed for ${preset.label}, falling back to synthesized stars:`, err);
      const fallback = generateClusterFallbackStars(preset);
      setCachedNasaStars(targetId, limit, fallback, storage);
      return fallback;
    } finally {
      nasaInFlightRequests.delete(key);
    }
  })();

  nasaInFlightRequests.set(key, requestPromise);
  return requestPromise;
}

export const CACHE_KEY_PREFIX = 'starplot:gaia:v1:';

const memoryCache = new Map<string, GaiaStar[]>();
const inFlightRequests = new Map<string, Promise<GaiaStar[]>>();

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
    const raw =
      store.getItem(key) ?? (limit !== 1000 ? store.getItem(getCacheKey(targetId, 1000)) : null);
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
 * If browser `localStorage` hits its ~5 MB quota (after ~12 cached clusters),
 * older `starplot:gaia:v1:*` entries are evicted so the newly fetched preset is always cached.
 */
export function setCachedTargetStars(
  targetId: TargetPresetId,
  limit: number,
  stars: GaiaStar[],
  storage?: Pick<Storage, 'setItem'> & Partial<Pick<Storage, 'removeItem'>>
): void {
  const key = getCacheKey(targetId, limit);
  memoryCache.set(key, stars);

  const store = storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  if (!store) return;

  const serialized = JSON.stringify(stars);
  try {
    store.setItem(key, serialized);
  } catch {
    // Browser localStorage (~5 MB limit) is full — evict older cached presets until setItem succeeds
    if (typeof store.removeItem === 'function') {
      for (const preset of TARGET_PRESETS) {
        if (preset.id === targetId) continue;
        try {
          store.removeItem(getCacheKey(preset.id, limit));
          store.removeItem(getCacheKey(preset.id, 1000));
          store.setItem(key, serialized);
          break;
        } catch {
          // Keep evicting until enough quota is freed
        }
      }
    }
  }
}

/**
 * Clears the in-memory and `localStorage` cache (useful for testing).
 */
export function clearStarCache(storage?: Pick<Storage, 'removeItem'>): void {
  memoryCache.clear();
  inFlightRequests.clear();
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
 * deduplicating concurrent in-flight requests (e.g. React StrictMode double-mount)
 * and returning cached results from `localStorage` if already fetched.
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

  const key = getCacheKey(targetId, limit);
  const existingInFlight = inFlightRequests.get(key);
  if (existingInFlight) {
    return existingInFlight;
  }

  const requestPromise = (async (): Promise<GaiaStar[]> => {
    try {
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
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, requestPromise);
  return requestPromise;
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
  minBpRp: -0.55,
  maxBpRp: 3.45,
  minAbsMag: -6.5,
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
 * Computes a fine stardust canvas dot radius (in CSS pixels) from a star's absolute magnitude M_G,
 * matching the classic Richard Powell / Wikipedia H–R diagram point-cloud aesthetic:
 * - Faint dwarfs (M_G >= +14): 0.55px radius (~1.1px pinpoint)
 * - Solar-type dwarfs (M_G ~ +4.8): ~0.83px radius (~1.65px pinpoint)
 * - Luminous giants/supergiants (M_G <= -5): capped at 1.20px radius
 */
export function computeStarCanvasRadius(absoluteMagG: number, scale: number = 1): number {
  const baseRadius = Math.max(0.55, Math.min(1.2, 0.55 + (14 - absoluteMagG) * 0.032));
  return baseRadius * scale;
}

/**
 * Finds the closest plotted star within `hitRadiusPx` (defaults to 12px) of `(mouseX, mouseY)`
 * so hover/click selection remains responsive even when visual star radii are sub-2px pinpoints.
 */
export function findClosestStarAtPoint<
  T extends { star: Pick<GaiaStar, 'bpRp' | 'absoluteMagG'> }
>(
  items: readonly T[],
  mouseX: number,
  mouseY: number,
  box: PlotBox,
  bounds: HrBounds = HR_BOUNDS,
  hitRadiusPx: number = 12
): T | null {
  let closest: T | null = null;
  let minDistSq = hitRadiusPx * hitRadiusPx;

  for (const item of items) {
    const { bpRp, absoluteMagG } = item.star;
    if (bpRp === null || absoluteMagG === null) continue;
    const { x, y } = starToCanvasXY(bpRp, absoluteMagG, box, bounds);
    const dx = x - mouseX;
    const dy = y - mouseY;
    const d2 = dx * dx + dy * dy;
    if (d2 < minDistSq) {
      minDistSq = d2;
      closest = item;
    }
  }

  return closest;
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
    label: 'Classic H–R (Wikipedia / Powell)',
    canvasBg: '#000000',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    axisTextColor: '#cbd5e1',
    titleTextColor: '#fde047',
    watermarkColor: 'rgba(217, 70, 239, 0.75)',
    stops: [
      { bpRp: -0.45, rgb: [110, 215, 255] }, // #6ed7ff Cyan-blue O/B
      { bpRp: -0.1, rgb: [205, 245, 255] },  // #cdf5ff Ice blue-white B/A
      { bpRp: 0.2, rgb: [255, 255, 255] },   // #ffffff Pure white A/F
      { bpRp: 0.55, rgb: [255, 253, 175] },  // #fffdaf Warm cream F/G
      { bpRp: 0.82, rgb: [255, 234, 0] },    // #ffea00 Vivid canary yellow G (Sun)
      { bpRp: 1.15, rgb: [255, 158, 0] },    // #ff9e00 Golden amber-orange K / Red Clump
      { bpRp: 1.65, rgb: [255, 68, 0] },     // #ff4400 Fiery orange-red late-K / early-M
      { bpRp: 2.35, rgb: [215, 20, 0] },     // #d71400 Deep ruby red M-dwarf
      { bpRp: 3.4, rgb: [135, 5, 0] },       // #870500 Dark crimson late M-dwarf
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

export const RADIUS_LINES_SOLAR = [0.01, 0.1, 1, 10, 100, 1000] as const;

/**
 * Computes a curve of `(bpRp, absoluteMagG)` points along a line of constant stellar radius (`radiusSolar` in R☉)
 * using `@skyscout/core`'s `bpRpToEffectiveTempK` and the Stefan–Boltzmann relation:
 * $L / L_\odot = (R / R_\odot)^2 \times (T_{\text{eff}} / 5772\,\text{K})^4$, $M_G = 4.67 - 2.5 \log_{10}(L / L_\odot)$.
 */
export function computeConstantRadiusCurve(
  radiusSolar: number,
  steps: number = 42
): Array<{ bpRp: number; absoluteMagG: number }> {
  if (radiusSolar <= 0 || steps < 2) return [];
  const points: Array<{ bpRp: number; absoluteMagG: number }> = [];
  const minBpRp = -0.45;
  const maxBpRp = 3.3;

  for (let i = 0; i < steps; i++) {
    const bpRp = minBpRp + (i / (steps - 1)) * (maxBpRp - minBpRp);
    const teff = bpRpToEffectiveTempK(bpRp) ?? 5772;
    const lumSolar = Math.pow(radiusSolar, 2) * Math.pow(teff / 5772, 4);
    const absoluteMagG = 4.67 - 2.5 * Math.log10(lumSolar);
    points.push({ bpRp, absoluteMagG });
  }
  return points;
}

/**
 * Filters `TARGET_PRESETS` by category (`All` or specific category) and case-insensitive search query
 * matching `label`, `shortName`, `catalogCode`, `constellation`, or `subtitle`.
 */
export function searchCatalogPresets(
  query: string,
  category: TargetCategory | 'All' = 'All'
): TargetPreset[] {
  const q = query.trim().toLowerCase();
  return TARGET_PRESETS.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (!q) return true;
    return (
      p.label.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      (p.catalogCode?.toLowerCase().includes(q) ?? false) ||
      (p.constellation?.toLowerCase().includes(q) ?? false) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });
}

/**
 * Custom user-defined sky cone search target (`/chart/custom?...`).
 */
export interface CustomConeTarget {
  name: string;
  ra: number;
  dec: number;
  radiusDeg: number;
  minDistancePc?: number;
  maxDistancePc?: number;
}

/**
 * Fetches live Gaia DR3 stars for a custom sky cone search, with in-memory + `localStorage` caching
 * and in-flight request deduplication.
 */
export async function fetchCustomConeStars(
  client: GaiaClient,
  target: CustomConeTarget,
  limit: number = 1000,
  storage?: Pick<Storage, 'getItem' | 'setItem'> & Partial<Pick<Storage, 'removeItem'>>
): Promise<GaiaStar[]> {
  const slug = `custom:${target.ra.toFixed(3)}:${target.dec.toFixed(3)}:${target.radiusDeg.toFixed(2)}:${target.minDistancePc ?? 0}:${target.maxDistancePc ?? 0}:${limit}`;
  const key = `${CACHE_KEY_PREFIX}${slug}`;

  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  const store = storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  if (store) {
    try {
      const raw = store.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as GaiaStar[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }

  const existing = inFlightRequests.get(key);
  if (existing) return existing;

  const promise = (async (): Promise<GaiaStar[]> => {
    try {
      const stars = await client.coneSearch({
        ra: target.ra,
        dec: target.dec,
        radiusDeg: target.radiusDeg,
        minDistancePc: target.minDistancePc,
        maxDistancePc: target.maxDistancePc,
        minParallaxSnr: 3,
        maxMagG: 17.2,
        limit,
      });
      if (stars.length > 0) {
        memoryCache.set(key, stars);
        if (store) {
          try {
            store.setItem(key, JSON.stringify(stars));
          } catch {
            // Ignore quota errors
          }
        }
      }
      return stars;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Generates deterministic, astrophysically shaped H–R preview points `(bpRp, absoluteMagG)`
 * for a cluster card on the `/` Home Page Grid when the cluster has not yet been fetched into `localStorage`.
 * Ensures all 32 cards on the Home Page Grid render an immediate H–R thumbnail with zero network calls.
 */
/**
 * Parses cluster age string (e.g. "~12 Myr", "~115 Myr", "~11.4 Gyr") into numeric Myr.
 */
export function parseClusterAgeMyr(ageStr: string): number {
  const matchGyr = ageStr.match(/([\d.]+)\s*Gyr/i);
  if (matchGyr) return parseFloat(matchGyr[1]) * 1000;
  const matchMyr = ageStr.match(/([\d.]+)\s*Myr/i);
  if (matchMyr) return parseFloat(matchMyr[1]);
  return 300;
}

export function generateClusterPreviewPoints(
  preset: TargetPreset
): Array<{ bpRp: number; absoluteMagG: number }> {
  // Deterministic PRNG seeded by preset.id
  let seed = 2166136261;
  for (let i = 0; i < preset.id.length; i++) {
    seed ^= preset.id.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  const rand = (): number => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 10000) / 10000;
  };

  const points: Array<{ bpRp: number; absoluteMagG: number }> = [];

  if (preset.category === 'Globular Cluster') {
    // Globular Cluster (~10–13 Gyr): Subgiant turnoff + Steep RGB + Horizontal Branch
    for (let i = 0; i < 90; i++) {
      // Lower main sequence and turnoff at M_G ~ 4.0, bpRp ~ 0.52
      const t = rand();
      const bpRp = 0.52 + t * 1.15 + (rand() - 0.5) * 0.1;
      const absMag = 4.0 + t * 5.4 + (rand() - 0.5) * 0.45;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    for (let i = 0; i < 75; i++) {
      // Steep Red Giant Branch rising to M_G ~ -2.6
      const t = Math.pow(rand(), 0.85);
      const bpRp = 0.65 + t * 0.95 + (rand() - 0.5) * 0.08;
      const absMag = 3.6 - t * 6.2 + (rand() - 0.5) * 0.35;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    for (let i = 0; i < 50; i++) {
      // Distinctive Horizontal Branch (M_G ~ +0.55 across blue to red)
      const bpRp = -0.2 + rand() * 0.95;
      const absMag = 0.55 + (rand() - 0.5) * 0.35 + (bpRp < 0.1 ? (0.1 - bpRp) * 2.0 : 0);
      points.push({ bpRp, absoluteMagG: absMag });
    }
    return points;
  }

  if (preset.category === 'Solar Volume') {
    // Solar 50 pc field: full Main Sequence spine + Red Clump + White Dwarfs
    for (let i = 0; i < 160; i++) {
      const t = Math.pow(rand(), 0.9);
      const bpRp = -0.05 + t * 3.15 + (rand() - 0.5) * 0.14;
      const absMag = 0.6 + t * 12.2 + (rand() - 0.5) * 0.55;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    for (let i = 0; i < 30; i++) {
      // Red Clump giants
      points.push({
        bpRp: 1.05 + (rand() - 0.5) * 0.35,
        absoluteMagG: 0.6 + (rand() - 0.5) * 1.4,
      });
    }
    for (let i = 0; i < 20; i++) {
      // White Dwarf cooling sequence
      const t = rand();
      points.push({
        bpRp: -0.15 + t * 0.95,
        absoluteMagG: 10.5 + t * 3.8 + (rand() - 0.5) * 0.4,
      });
    }
    return points;
  }

  // Open Cluster: calculate turnoff and evolved stars based on numeric age in Myr
  const ageMyr = parseClusterAgeMyr(preset.age);

  if (ageMyr <= 22) {
    // Ultra-young OB cluster (~12-16 Myr: NGC 6231, Double Cluster, Jewel Box)
    // Main sequence extends up to blazing O/B stars M_G ~ -5.5
    for (let i = 0; i < 170; i++) {
      const t = Math.pow(rand(), 0.75);
      const bpRp = -0.35 + t * 2.85 + (rand() - 0.5) * 0.08;
      const absMag = -5.2 + t * 16.5 + (rand() - 0.5) * 0.45;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    // Luminous blue and red supergiants (e.g. Kappa Crucis in Jewel Box)
    for (let i = 0; i < 12; i++) {
      const isRed = rand() > 0.65;
      points.push({
        bpRp: isRed ? 1.55 + (rand() - 0.5) * 0.3 : -0.25 + (rand() - 0.5) * 0.15,
        absoluteMagG: isRed ? -4.8 + (rand() - 0.5) * 1.2 : -5.8 + (rand() - 0.5) * 1.2,
      });
    }
  } else if (ageMyr <= 60) {
    // Young cluster (~35-50 Myr: IC 2602, Alpha Persei)
    // Turnoff reaches M_G ~ -2.5, bpRp ~ -0.22
    for (let i = 0; i < 165; i++) {
      const t = Math.pow(rand(), 0.8);
      const bpRp = -0.22 + t * 2.75 + (rand() - 0.5) * 0.08;
      const absMag = -2.5 + t * 14.0 + (rand() - 0.5) * 0.45;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    // Yellow/orange supergiant giants like Mirfak (Alpha Persei)
    for (let i = 0; i < 10; i++) {
      points.push({
        bpRp: 0.65 + (rand() - 0.5) * 0.4,
        absoluteMagG: -1.8 + (rand() - 0.5) * 1.2,
      });
    }
  } else if (ageMyr <= 160) {
    // Pleiades era (~78-150 Myr: M47, M6 Butterfly, Pleiades, M35)
    // Turnoff at upper Main Sequence M_G ~ -1.0 to 0.0, bpRp ~ -0.15
    for (let i = 0; i < 165; i++) {
      const t = Math.pow(rand(), 0.85);
      const bpRp = -0.15 + t * 2.7 + (rand() - 0.5) * 0.08;
      const absMag = -0.8 + t * 12.5 + (rand() - 0.5) * 0.4;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    // Prominent giants (like orange giant BM Scorpii in M6 Butterfly)
    for (let i = 0; i < 12; i++) {
      points.push({
        bpRp: 1.2 + (rand() - 0.5) * 0.35,
        absoluteMagG: -0.5 + (rand() - 0.5) * 1.0,
      });
    }
  } else if (ageMyr <= 900) {
    // Intermediate clusters (~200-800 Myr: M7, M11 Wild Duck, Hyades, Praesepe, M37, M36, M38)
    // Turnoff at A/F stars M_G ~ 1.2, bpRp ~ 0.22
    for (let i = 0; i < 165; i++) {
      const t = Math.pow(rand(), 0.85);
      const bpRp = 0.22 + t * 2.35 + (rand() - 0.5) * 0.08;
      const absMag = 1.2 + t * 10.5 + (rand() - 0.5) * 0.4;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    // Distinctive Red Clump helium-burning giants (M_G ~ 0.5, bpRp ~ 1.05)
    const rcCount = preset.id === 'm11' ? 24 : 16;
    for (let i = 0; i < rcCount; i++) {
      points.push({
        bpRp: 1.05 + (rand() - 0.5) * 0.25,
        absoluteMagG: 0.5 + (rand() - 0.5) * 0.6,
      });
    }
  } else {
    // Ancient Open Clusters (M67 ~4 Gyr, NGC 188 ~7 Gyr)
    // Turnoff near solar temperature M_G ~ 3.8, bpRp ~ 0.58 + Subgiant hook & RGB
    for (let i = 0; i < 120; i++) {
      const t = Math.pow(rand(), 0.85);
      const bpRp = 0.58 + t * 2.05 + (rand() - 0.5) * 0.08;
      const absMag = 3.8 + t * 8.2 + (rand() - 0.5) * 0.4;
      points.push({ bpRp, absoluteMagG: absMag });
    }
    // Subgiant branch & Red Giant Branch
    for (let i = 0; i < 40; i++) {
      const t = Math.pow(rand(), 0.85);
      const bpRp = 0.72 + t * 0.75 + (rand() - 0.5) * 0.08;
      const absMag = 3.4 - t * 4.2 + (rand() - 0.5) * 0.4;
      points.push({ bpRp, absoluteMagG: absMag });
    }
  }

  return points;
}

/**
 * Generates an offline reference stellar dataset for a cluster preset.
 * Used as a zero-latency fallback whenever the live ESA Gaia TAP service is
 * overloaded (503), down for maintenance, or when working offline.
 * Ensures the user is never blocked from exploring diagrams or exporting fine-art posters.
 */
export function generateClusterFallbackStars(preset: TargetPreset): GaiaStar[] {
  const previewPoints = generateClusterPreviewPoints(preset);
  const points: Array<{ bpRp: number; absoluteMagG: number }> = [];

  let seed = 987654321;
  for (let i = 0; i < preset.id.length; i++) {
    seed ^= preset.id.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  const rand = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed % 10000) / 10000;
  };

  for (const pt of previewPoints) {
    points.push(pt);
    // Add a secondary star with slight photometric noise to create a dense ~350+ star field
    points.push({
      bpRp: pt.bpRp + (rand() - 0.5) * 0.04,
      absoluteMagG: pt.absoluteMagG + (rand() - 0.5) * 0.15,
    });
  }

  const distPc = preset.distancePcApprox ?? 150;
  const distMod = 5 * Math.log10(Math.max(1, distPc)) - 5;
  const basePlx = 1000 / distPc;

  const baseRa = preset.cone?.ra ?? 56.75;
  const baseDec = preset.cone?.dec ?? 24.12;
  const radiusDeg = Math.max(0.2, preset.cone?.radiusDeg ?? 1.2);
  const cosDec = Math.max(0.1, Math.cos((baseDec * Math.PI) / 180));

  // Pleiades iconic 7 bright asterism star offsets (Alcyone, Atlas, Electra, Maia, Merope, Taygeta, Pleione)
  const pleiadesAsterism = [
    { dra: 0.12, ddec: 0.08, magOffset: -4.5 },
    { dra: -0.22, ddec: -0.05, magOffset: -4.2 },
    { dra: 0.35, ddec: 0.12, magOffset: -4.0 },
    { dra: 0.18, ddec: 0.28, magOffset: -3.8 },
    { dra: 0.05, ddec: -0.15, magOffset: -3.7 },
    { dra: 0.26, ddec: 0.32, magOffset: -3.5 },
    { dra: -0.25, ddec: 0.02, magOffset: -3.2 },
  ];

  return points.map((pt, idx) => {
    const plx = basePlx * (1 + (rand() - 0.5) * 0.05);
    let photG = pt.absoluteMagG + distMod + (rand() - 0.5) * 0.08;
    const roundedDistPc = Math.round(distPc);
    const distLy = Number((roundedDistPc * 3.26156).toFixed(1));
    const logLum = Number(((4.74 - pt.absoluteMagG) / 2.5).toFixed(3));
    const teffK = bpRpToEffectiveTempK(pt.bpRp);

    let ra = baseRa;
    let dec = baseDec;

    if (preset.id === 'double-cluster') {
      // Iconic twin cores of NGC 869 (west) and NGC 884 (east) separated by ~0.45 deg
      const isEast = idx % 2 === 0;
      const coreOffsetRa = isEast ? 0.22 : -0.22;
      const angle = rand() * 2 * Math.PI;
      const r = Math.pow(rand(), 1.5) * (radiusDeg * 0.45);
      ra = baseRa + coreOffsetRa + (r * Math.cos(angle)) / cosDec;
      dec = baseDec + r * Math.sin(angle);
    } else if (preset.category === 'Globular Cluster') {
      // King / Plummer sphere concentration: stars packed heavily into the central core
      const angle = rand() * 2 * Math.PI;
      const rFrac = Math.pow(rand(), 2.2); // Core-heavy concentration
      const r = rFrac * radiusDeg;
      ra = baseRa + (r * Math.cos(angle)) / cosDec;
      dec = baseDec + r * Math.sin(angle);
    } else if (preset.id === 'pleiades' && idx < pleiadesAsterism.length) {
      // Seven Sisters asterism
      const ast = pleiadesAsterism[idx];
      ra = baseRa + ast.dra;
      dec = baseDec + ast.ddec;
      photG += ast.magOffset;
    } else if (preset.id === 'm11') {
      // Wild Duck iconic V-wedge flock shape
      const t = rand();
      const arm = rand() > 0.5 ? 1 : -1;
      const dra = (t * 0.7 + (rand() - 0.5) * 0.15) * radiusDeg * arm;
      const ddec = (t * 0.5 + (rand() - 0.5) * 0.15) * radiusDeg;
      ra = baseRa + dra / cosDec;
      dec = baseDec - ddec;
    } else if (preset.id === 'm6') {
      // Butterfly Cluster twin wings
      const wing = rand() > 0.5 ? 1 : -1;
      const angle = (rand() - 0.5) * 1.2 + (wing > 0 ? 0 : Math.PI);
      const r = (0.2 + 0.8 * Math.sqrt(rand())) * radiusDeg;
      ra = baseRa + (r * Math.cos(angle)) / cosDec;
      dec = baseDec + r * Math.sin(angle);
    } else {
      // Gaussian open cluster core dispersal
      const angle = rand() * 2 * Math.PI;
      const r = Math.pow(rand(), 1.4) * radiusDeg;
      ra = baseRa + (r * Math.cos(angle)) / cosDec;
      dec = baseDec + r * Math.sin(angle);
    }

    dec = Math.max(-90, Math.min(90, dec));
    const bp = photG + pt.bpRp * 0.5;
    const rp = photG - pt.bpRp * 0.5;

    return {
      sourceId: `synth-${preset.id}-${idx + 1}`,
      ra: Number(ra.toFixed(6)),
      dec: Number(dec.toFixed(6)),
      parallaxMas: Number(plx.toFixed(3)),
      parallaxErrorMas: 0.03,
      parallaxSnr: 35,
      pmRaMasYr: Number(((rand() - 0.5) * 10).toFixed(2)),
      pmDecMasYr: Number(((rand() - 0.5) * 10).toFixed(2)),
      radialVelocityKmS: Number(((rand() - 0.5) * 20).toFixed(1)),
      magG: Number(photG.toFixed(3)),
      magBp: Number(bp.toFixed(3)),
      magRp: Number(rp.toFixed(3)),
      bpRp: Number(pt.bpRp.toFixed(3)),
      teffK: teffK ? Math.round(teffK) : null,
      extinctionAg: 0.05,
      reddeningBpRp: 0.03,
      distancePc: roundedDistPc,
      distanceLy: distLy,
      absoluteMagG: Number(pt.absoluteMagG.toFixed(3)),
      logLuminositySolar: logLum,
      spectralClass: bpRpToSpectralClass(pt.bpRp),
    };
  });
}

/**
 * Formats a clean, non-redundant museum poster title for a cluster preset,
 * preventing duplicate catalog codes (e.g. avoids "M45 · M45 PLEIADES" -> "M45 · PLEIADES").
 */
export function formatPosterTitle(preset: TargetPreset): string {
  const code = preset.catalogCode?.trim();
  let name = preset.shortName?.trim();

  // If shortName starts with catalogCode (e.g. "M45 Pleiades" starts with "M45"), strip it
  if (code && name && name.toLowerCase().startsWith(code.toLowerCase())) {
    name = name.slice(code.length).replace(/^[\s·\-\:]+/, '').trim();
  }

  if (code && name && code.toLowerCase() !== name.toLowerCase()) {
    return `${code.toUpperCase()} · ${name.toUpperCase()}`;
  }

  if (name) {
    return name.toUpperCase();
  }

  return (code ?? 'HERTZSPRUNG–RUSSELL DIAGRAM').toUpperCase();
}

export type PosterThemeId = 'two-maps' | 'star-quilt' | 'night-fall';

export interface PosterThemeInfo {
  id: PosterThemeId;
  name: string;
  badge: string;
  subtitle: string;
  bg: string;
  isLight?: boolean;
}

export const POSTER_THEMES: Record<PosterThemeId, PosterThemeInfo> = {
  'two-maps': {
    id: 'two-maps',
    name: 'Two Maps',
    badge: '🌌 Two Maps',
    subtitle: 'Where the stars are vs what they are, connected by luminous strands',
    bg: '#030509',
    isLight: false,
  },
  'star-quilt': {
    id: 'star-quilt',
    name: 'Star Quilt',
    badge: '🧵 Star Quilt',
    subtitle: 'Graphic binned patchwork with dashed stitching, one fabric per spectral class',
    bg: '#f7f4ed',
    isLight: true,
  },
  'night-fall': {
    id: 'night-fall',
    name: 'Night Fall',
    badge: '🌊 Cascade',
    subtitle: 'Frameless cosmic cascade streaming from sky directly into diagram',
    bg: '#010306',
    isLight: false,
  },
};

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  if (typeof (ctx as unknown as { roundRect?: Function }).roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Theme 1: "Two Maps"
 * Circular celestial sky disc on top, H–R diagram box on bottom, connected by luminous bezier threads.
 */
export function renderTwoMapsPoster(options: {
  ctx: CanvasRenderingContext2D;
  width?: number;
  height?: number;
  bounds: HrBounds;
  stars: Array<{ star: GaiaStar; sourceLabel: string }>;
  primaryPreset?: TargetPreset | null;
}): void {
  const { ctx, width = 5400, height = 7200, bounds, stars, primaryPreset } = options;

  // 1. Pitch black background
  ctx.fillStyle = '#030509';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const preset = primaryPreset ?? TARGET_PRESETS[0];

  // 2. Top Sky Disc ("WHERE THE STARS ARE")
  const skyCenter = { x: centerX, y: 1850 };
  const skyRadius = 1150;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(skyCenter.x, skyCenter.y, skyRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(skyCenter.x, skyCenter.y, skyRadius * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(skyCenter.x - 20, skyCenter.y);
  ctx.lineTo(skyCenter.x + 20, skyCenter.y);
  ctx.moveTo(skyCenter.x, skyCenter.y - 20);
  ctx.lineTo(skyCenter.x, skyCenter.y + 20);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();

  ctx.font = '500 32px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('THE SKY — WHERE THE STARS ARE', centerX, 3180);

  // 3. Bottom H–R Diagram Box ("WHAT THE STARS ARE")
  const hrBox: PlotBox = {
    left: 650,
    top: 3680,
    width: 4100,
    height: 2320,
  };

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(hrBox.left, hrBox.top, hrBox.width, hrBox.height);

  ctx.font = '500 32px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('THE DIAGRAM — WHAT THE STARS ARE', centerX, 3560);

  // Left Y-axis Logarithmic Luminosity Decades
  const lumTicks = [
    { label: '10⁵', mag: -7.76 },
    { label: '10⁴', mag: -5.26 },
    { label: '10³', mag: -2.76 },
    { label: '10²', mag: -0.26 },
    { label: '10¹', mag: 2.24 },
    { label: '10⁰', mag: 4.74 },
    { label: '10⁻¹', mag: 7.24 },
    { label: '10⁻²', mag: 9.74 },
  ];

  ctx.font = '400 30px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;

  for (const tick of lumTicks) {
    const yNorm = (tick.mag - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag);
    if (yNorm >= 0 && yNorm <= 1) {
      const y = hrBox.top + yNorm * hrBox.height;
      ctx.fillText(tick.label, hrBox.left - 25, y + 10);
      ctx.beginPath();
      ctx.moveTo(hrBox.left, y);
      ctx.lineTo(hrBox.left + 15, y);
      ctx.stroke();
    }
  }

  // Bottom X-axis Spectral Classes (O B A F G K M)
  const spectralLetters = [
    { cls: 'O', bpRp: -0.42, color: '#60a5fa' },
    { cls: 'B', bpRp: -0.15, color: '#93c5fd' },
    { cls: 'A', bpRp: 0.12, color: '#f8fafc' },
    { cls: 'F', bpRp: 0.45, color: '#fef08a' },
    { cls: 'G', bpRp: 0.82, color: '#facc15' },
    { cls: 'K', bpRp: 1.32, color: '#fb923c' },
    { cls: 'M', bpRp: 2.15, color: '#ef4444' },
  ];

  ctx.font = '700 52px "Inter", sans-serif';
  ctx.textAlign = 'center';
  for (const item of spectralLetters) {
    const xNorm = (item.bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
    if (xNorm >= 0 && xNorm <= 1) {
      const x = hrBox.left + xNorm * hrBox.width;
      ctx.fillStyle = item.color;
      ctx.fillText(item.cls, x, hrBox.top + hrBox.height + 70);
    }
  }

  // 4. Coordinates projection & Connecting Strands
  const baseRa = preset.cone?.ra ?? 56.75;
  const baseDec = preset.cone?.dec ?? 24.12;
  const radiusDeg = Math.max(0.2, preset.cone?.radiusDeg ?? 1.2);
  const cosDec = Math.cos((baseDec * Math.PI) / 180);

  const starData = stars
    .map(({ star }) => {
      const bpRp = star.bpRp ?? 0.8;
      const absMag = star.absoluteMagG ?? 4.5;
      const dx = ((star.ra - baseRa) * cosDec) / radiusDeg;
      const dy = (star.dec - baseDec) / radiusDeg;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const rClamped = dist <= 1 ? dist : 1 / (1 + (dist - 1) * 0.4);
      const angle = Math.atan2(dy, dx);

      const skyX = skyCenter.x + Math.cos(angle) * rClamped * (skyRadius - 40);
      const skyY = skyCenter.y - Math.sin(angle) * rClamped * (skyRadius - 40);

      const xNorm = (bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
      const yNorm = (absMag - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag);
      const hrX = hrBox.left + xNorm * hrBox.width;
      const hrY = hrBox.top + yNorm * hrBox.height;

      const hex = bpRpToStarHexColor(bpRp, 'blackbody');
      const brightnessNorm = Math.max(0, Math.min(1, (12 - absMag) / 16));

      return { star, skyX, skyY, hrX, hrY, hex, brightnessNorm, absMag };
    })
    .sort((a, b) => b.absMag - a.absMag);

  for (const item of starData) {
    const alpha = Math.min(0.35, 0.08 + item.brightnessNorm * 0.25);
    const lineWidth = Math.max(1.2, 1.0 + item.brightnessNorm * 2.2);

    ctx.save();
    ctx.strokeStyle = item.hex;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(item.skyX, item.skyY);
    const cp1Y = item.skyY + (item.hrY - item.skyY) * 0.45;
    const cp2Y = item.hrY - (item.hrY - item.skyY) * 0.45;
    ctx.bezierCurveTo(item.skyX, cp1Y, item.hrX, cp2Y, item.hrX, item.hrY);
    ctx.stroke();
    ctx.restore();
  }

  for (const item of starData) {
    const dotRadius = Math.max(2.2, 2.0 + item.brightnessNorm * 5.0);

    ctx.fillStyle = item.hex;
    ctx.beginPath();
    ctx.arc(item.skyX, item.skyY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(item.hrX, item.hrY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const distStr =
    preset.distancePcApprox >= 1000
      ? `${(preset.distancePcApprox / 1000).toFixed(1)} kpc`
      : `${preset.distancePcApprox} pc`;

  ctx.textAlign = 'left';
  ctx.font = '700 108px "Inter", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(formatPosterTitle(preset), hrBox.left, 6520);

  ctx.font = '400 32px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText(
    `${preset.category.toUpperCase()} · ${preset.constellation?.toUpperCase() ?? 'MILKY WAY'} · ~${distStr.toUpperCase()} · ~${preset.age.toUpperCase()}`,
    hrBox.left,
    6590
  );

  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(
    'NASA IPAC 2MASS ALL-SKY SURVEY · U.S. PUBLIC DOMAIN · 300 DPI FINE-ART EDITION',
    hrBox.left,
    6650
  );

  ctx.textAlign = 'left';
  ctx.font = '400 29px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const rightX = centerX + 400;
  ctx.fillText('Above, the stars as they sit in the sky. Below, the same', rightX, 6520);
  ctx.fillText('stars sorted by temperature (hot at left) and luminosity', rightX, 6565);
  ctx.fillText('(bright at top). Luminous threads join the stars.', rightX, 6610);
}

/**
 * Theme 2: "Star Quilt"
 * Binned patchwork of stitched fabric tiles on warm archival cream.
 */
export function renderStarQuiltPoster(options: {
  ctx: CanvasRenderingContext2D;
  width?: number;
  height?: number;
  bounds: HrBounds;
  stars: Array<{ star: GaiaStar; sourceLabel: string }>;
  primaryPreset?: TargetPreset | null;
}): void {
  const { ctx, width = 5400, height = 7200, bounds, stars, primaryPreset } = options;

  ctx.fillStyle = '#f7f4ed';
  ctx.fillRect(0, 0, width, height);

  const preset = primaryPreset ?? TARGET_PRESETS[0];

  ctx.textAlign = 'left';
  ctx.font = '900 155px "Inter", "Georgia", serif';
  ctx.fillStyle = '#292524';
  ctx.fillText(formatPosterTitle(preset), 520, 580);

  ctx.textAlign = 'right';
  ctx.font = '500 32px "JetBrains Mono", monospace';
  ctx.fillStyle = '#78716c';
  ctx.fillText('SEVEN FABRICS, ONE PER CLASS', width - 520, 520);
  ctx.fillText('HOT LEFT · BRIGHT TOP', width - 520, 570);

  const gridLeft = 1200;
  const gridTop = 1350;
  const gridWidth = 3100;
  const gridHeight = 3900;
  const numCols = 18;
  const numRows = 20;

  const cellW = gridWidth / numCols;
  const cellH = gridHeight / numRows;
  const patchW = cellW * 0.88;
  const patchH = cellH * 0.88;

  const bins = new Map<string, number>();
  let maxCount = 1;

  for (const { star } of stars) {
    const bpRp = star.bpRp ?? 0.8;
    const absMag = star.absoluteMagG ?? 4.5;
    const col = Math.floor(((bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp)) * numCols);
    const row = Math.floor(((absMag - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag)) * numRows);
    if (col >= 0 && col < numCols && row >= 0 && row < numRows) {
      const key = `${col},${row}`;
      const cnt = (bins.get(key) ?? 0) + 1;
      bins.set(key, cnt);
      if (cnt > maxCount) maxCount = cnt;
    }
  }

  const getColColor = (col: number): { fill: string; stroke: string } => {
    if (col <= 1) return { fill: '#3b5998', stroke: '#2b4478' };
    if (col <= 4) return { fill: '#5dade2', stroke: '#3498db' };
    if (col <= 6) return { fill: '#aed6f1', stroke: '#85c1e9' };
    if (col <= 8) return { fill: '#fcf3cf', stroke: '#d4ac0d' };
    if (col <= 11) return { fill: '#f5b041', stroke: '#d68910' };
    if (col <= 14) return { fill: '#eb984e', stroke: '#ba4a00' };
    return { fill: '#cb4335', stroke: '#922b21' };
  };

  bins.forEach((count, key) => {
    const [colStr, rowStr] = key.split(',');
    const col = parseInt(colStr, 10);
    const row = parseInt(rowStr, 10);

    const px = gridLeft + col * cellW + (cellW - patchW) / 2;
    const py = gridTop + row * cellH + (cellH - patchH) / 2;

    const { fill, stroke } = getColColor(col);
    const alpha = Math.min(1.0, 0.35 + 0.65 * Math.pow(count / maxCount, 0.5));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    drawRoundedRect(ctx, px, py, patchW, patchH, 16);
    ctx.fill();

    ctx.globalAlpha = Math.min(1.0, alpha * 1.2);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    drawRoundedRect(ctx, px + 8, py + 8, patchW - 16, patchH - 16, 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  });

  const spectralClasses = [
    { label: 'O', col: 1, color: '#3b5998' },
    { label: 'B', col: 3, color: '#5dade2' },
    { label: 'A', col: 5, color: '#6ba4e8' },
    { label: 'F', col: 8, color: '#d4ac0d' },
    { label: 'G', col: 10, color: '#f5b041' },
    { label: 'K', col: 13, color: '#eb984e' },
    { label: 'M', col: 16, color: '#cb4335' },
  ];

  ctx.font = '800 96px "Inter", sans-serif';
  ctx.textAlign = 'center';
  for (const sp of spectralClasses) {
    const x = gridLeft + sp.col * cellW + cellW / 2;
    ctx.fillStyle = sp.color;
    ctx.fillText(sp.label, x, gridTop + gridHeight + 110);
  }

  ctx.textAlign = 'left';
  ctx.font = '400 36px "Inter", sans-serif';
  ctx.fillStyle = '#44403c';
  ctx.fillText('Each patch is one square of the H–R diagram, cut from the', 520, 6260);
  ctx.fillText('fabric of its spectral class. Solid patches hold many stars;', 520, 6315);
  ctx.fillText('faded ones hold one or two.', 520, 6370);

  ctx.textAlign = 'right';
  ctx.font = '500 30px "JetBrains Mono", monospace';
  ctx.fillStyle = '#78716c';
  ctx.fillText('EACH STEP UP ×10 IN LUMINOSITY', width - 520, 6260);
  ctx.fillText(`${preset.label.toUpperCase()} · ${stars.length} STARS`, width - 520, 6310);
  ctx.fillText('NASA 2MASS INFRARED SURVEY · U.S. PUBLIC DOMAIN', width - 520, 6360);
}

/**
 * Theme 3: "Night Fall / Cascade"
 * Frameless flowing cascade of stars pouring from sky field into diagonal H–R sequence.
 */
export function renderNightFallPoster(options: {
  ctx: CanvasRenderingContext2D;
  width?: number;
  height?: number;
  bounds: HrBounds;
  stars: Array<{ star: GaiaStar; sourceLabel: string }>;
  primaryPreset?: TargetPreset | null;
}): void {
  const { ctx, width = 5400, height = 7200, bounds, stars, primaryPreset } = options;

  ctx.fillStyle = '#010306';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const preset = primaryPreset ?? TARGET_PRESETS[0];

  ctx.textAlign = 'left';
  ctx.font = '500 44px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText(preset.catalogCode ?? preset.shortName, 520, 480);

  const skyField = {
    left: 1000,
    top: 750,
    width: 3400,
    height: 2200,
  };

  const hrBox: PlotBox = {
    left: 650,
    top: 3600,
    width: 4100,
    height: 2400,
  };

  const baseRa = preset.cone?.ra ?? 56.75;
  const baseDec = preset.cone?.dec ?? 24.12;
  const radiusDeg = Math.max(0.2, preset.cone?.radiusDeg ?? 1.2);
  const cosDec = Math.cos((baseDec * Math.PI) / 180);

  const starData = stars
    .map(({ star }) => {
      const bpRp = star.bpRp ?? 0.8;
      const absMag = star.absoluteMagG ?? 4.5;
      const dx = ((star.ra - baseRa) * cosDec) / radiusDeg;
      const dy = (star.dec - baseDec) / radiusDeg;

      const skyX = skyField.left + skyField.width / 2 + dx * (skyField.width * 0.45);
      const skyY = skyField.top + skyField.height / 2 - dy * (skyField.height * 0.45);

      const xNorm = (bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
      const yNorm = (absMag - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag);
      const hrX = hrBox.left + xNorm * hrBox.width;
      const hrY = hrBox.top + yNorm * hrBox.height;

      const hex = bpRpToStarHexColor(bpRp, 'blackbody');
      const brightnessNorm = Math.max(0, Math.min(1, (12 - absMag) / 16));

      return { star, skyX, skyY, hrX, hrY, hex, brightnessNorm, absMag };
    })
    .sort((a, b) => b.absMag - a.absMag);

  for (const item of starData) {
    const alpha = Math.min(0.4, 0.08 + item.brightnessNorm * 0.3);
    const lineWidth = Math.max(1.4, 1.2 + item.brightnessNorm * 3.5);

    ctx.save();
    ctx.strokeStyle = item.hex;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(item.skyX, item.skyY);
    const cp1Y = item.skyY + (item.hrY - item.skyY) * 0.5;
    const cp2Y = item.hrY - (item.hrY - item.skyY) * 0.5;
    ctx.bezierCurveTo(item.skyX, cp1Y, item.hrX, cp2Y, item.hrX, item.hrY);
    ctx.stroke();
    ctx.restore();
  }

  for (const item of starData) {
    const dotRadius = Math.max(2.5, 2.0 + item.brightnessNorm * 5.5);

    ctx.fillStyle = item.hex;
    ctx.beginPath();
    ctx.arc(item.skyX, item.skyY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(item.hrX, item.hrY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const spectralLetters = [
    { cls: 'O', bpRp: -0.42, color: '#60a5fa' },
    { cls: 'B', bpRp: -0.15, color: '#93c5fd' },
    { cls: 'A', bpRp: 0.12, color: '#f8fafc' },
    { cls: 'F', bpRp: 0.45, color: '#fef08a' },
    { cls: 'G', bpRp: 0.82, color: '#facc15' },
    { cls: 'K', bpRp: 1.32, color: '#fb923c' },
    { cls: 'M', bpRp: 2.15, color: '#ef4444' },
  ];

  ctx.font = '700 52px "Inter", sans-serif';
  ctx.textAlign = 'center';
  for (const item of spectralLetters) {
    const xNorm = (item.bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
    if (xNorm >= 0 && xNorm <= 1) {
      const x = hrBox.left + xNorm * hrBox.width;
      ctx.fillStyle = item.color;
      ctx.fillText(item.cls, x, hrBox.top + hrBox.height + 60);
    }
  }

  const distStr =
    preset.distancePcApprox >= 1000
      ? `${(preset.distancePcApprox / 1000).toFixed(1)} kpc`
      : `${preset.distancePcApprox} pc`;

  ctx.textAlign = 'left';
  ctx.font = '700 108px "Inter", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(formatPosterTitle(preset), hrBox.left, 6500);

  ctx.font = '400 32px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText(
    `${preset.category.toUpperCase()} · ${preset.constellation?.toUpperCase() ?? 'MILKY WAY'} · ~${distStr.toUpperCase()} · ~${preset.age.toUpperCase()}`,
    hrBox.left,
    6570
  );

  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(
    'NASA IPAC 2MASS ALL-SKY SURVEY · U.S. PUBLIC DOMAIN · 300 DPI FINE-ART PRINT',
    hrBox.left,
    6630
  );

  ctx.textAlign = 'left';
  ctx.font = '400 29px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  const rightX = centerX + 400;
  ctx.fillText('Every star falls from its place in the sky to its place', rightX, 6500);
  ctx.fillText('on the H–R diagram: hot at left, bright at top,', rightX, 6545);
  ctx.fillText('×10 per step. Strand width follows luminosity.', rightX, 6590);
}

/**
 * Main fine-art poster renderer: delegates to the active theme
 * ('two-maps', 'star-quilt', or 'night-fall').
 */
export function renderFineArtPoster(options: {
  ctx: CanvasRenderingContext2D;
  width?: number;
  height?: number;
  bounds: HrBounds;
  themeId?: PosterThemeId;
  stars: Array<{ star: GaiaStar; sourceLabel: string }>;
  primaryPreset?: TargetPreset | null;
}): void {
  const { themeId = 'two-maps' } = options;
  if (themeId === 'star-quilt') {
    renderStarQuiltPoster(options);
    return;
  }
  if (themeId === 'night-fall') {
    renderNightFallPoster(options);
    return;
  }
  renderTwoMapsPoster(options);
}

/**
 * Render an ultra-high resolution 18×24" fine-art poster (5400 × 7200 px at 300 DPI)
 * featuring the classic Wikipedia / Richard Powell H–R diagram on top
 * and an editorial Clean Museum Edition typography block at the bottom.
 */
export function renderGalleryPosterCanvas(options: {
  ctx: CanvasRenderingContext2D;
  width?: number;
  height?: number;
  bounds: HrBounds;
  schemeId?: ColorSchemeId;
  themeId?: PosterThemeId;
  stars: Array<{ star: GaiaStar; sourceLabel: string }>;
  showRadiusLines?: boolean;
  primaryPreset?: TargetPreset | null;
  customTarget?: CustomConeTarget | null;
  additionalPresets?: TargetPreset[];
}): void {
  const {
    ctx,
    width = 5400,
    height = 7200,
    bounds,
    schemeId = 'blackbody',
    themeId,
    stars,
    showRadiusLines = false,
    primaryPreset,
    customTarget,
    additionalPresets = [],
  } = options;

  if (themeId) {
    renderFineArtPoster({
      ctx,
      width,
      height,
      bounds,
      themeId,
      stars,
      primaryPreset,
    });
    return;
  }

  const scheme = COLOR_SCHEMES[schemeId];
  const isLightTheme = schemeId === 'print-light';
  const scale = 4.5;

  // 1. Canvas background
  ctx.fillStyle = scheme.canvasBg;
  ctx.fillRect(0, 0, width, height);

  // 2. Plot area geometry (centered horizontally, top margin for frame bleed)
  const box: PlotBox = {
    left: 440,
    top: 360,
    width: 4520,
    height: 4550,
  };

  // Top Spectral Class & Surface Temperature Header (O B A F G K M + Kelvin ticks)
  const spectralHeader: Array<{ cls: string; bpRp: number; temp: string }> = [
    { cls: 'O', bpRp: -0.42, temp: '30000K' },
    { cls: 'B', bpRp: -0.15, temp: '10000K' },
    { cls: 'A', bpRp: 0.12, temp: '7500K' },
    { cls: 'F', bpRp: 0.45, temp: '6000K' },
    { cls: 'G', bpRp: 0.82, temp: '5000K' },
    { cls: 'K', bpRp: 1.32, temp: '4000K' },
    { cls: 'M', bpRp: 2.15, temp: '3000K' },
  ];

  ctx.textAlign = 'center';
  for (const sp of spectralHeader) {
    const { x } = starToCanvasXY(sp.bpRp, 0, box, bounds);
    if (x >= box.left + 24 && x <= box.left + box.width - 24) {
      ctx.font = `700 ${Math.round(13 * scale)}px "Inter", sans-serif`;
      ctx.fillStyle = bpRpToStarHexColor(sp.bpRp, schemeId);
      ctx.fillText(sp.cls, x, box.top - 28 * scale);

      ctx.strokeStyle = scheme.axisTextColor;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(x, box.top);
      ctx.lineTo(x, box.top - 6 * scale);
      ctx.stroke();

      ctx.font = `400 ${Math.round(10 * scale)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = scheme.axisTextColor;
      ctx.fillText(sp.temp, x, box.top - 10 * scale);
    }
  }

  // Bottom X-axis ticks: Color Index (G_BP - G_RP)
  ctx.strokeStyle = scheme.axisTextColor;
  ctx.fillStyle = scheme.axisTextColor;
  ctx.lineWidth = 1.2 * scale;
  ctx.font = `400 ${Math.round(10.5 * scale)}px "JetBrains Mono", monospace`;

  const xStep = bounds.maxBpRp - bounds.minBpRp > 1.8 ? 0.5 : 0.2;
  const firstX = Math.ceil(bounds.minBpRp / xStep) * xStep;
  for (let c = firstX; c <= bounds.maxBpRp + 1e-6; c += xStep) {
    const { x } = starToCanvasXY(c, 0, box, bounds);
    if (x < box.left || x > box.left + box.width) continue;

    ctx.beginPath();
    ctx.moveTo(x, box.top + box.height);
    ctx.lineTo(x, box.top + box.height + 6 * scale);
    ctx.stroke();

    ctx.textAlign = 'center';
    const prefix = c > 0.001 ? '+' : '';
    ctx.fillText(`${prefix}${c.toFixed(xStep < 0.5 ? 2 : 1)}`, x, box.top + box.height + 18 * scale);
  }

  // Right Y-axis ticks: Absolute Magnitude (M_G)
  const yStep = bounds.maxAbsMag - bounds.minAbsMag > 10 ? 5 : 2;
  const firstY = Math.ceil(bounds.minAbsMag / yStep) * yStep;
  for (let m = firstY; m <= bounds.maxAbsMag + 1e-6; m += yStep) {
    const { y } = starToCanvasXY(0, m, box, bounds);
    if (y < box.top || y > box.top + box.height) continue;

    ctx.strokeStyle = scheme.axisTextColor;
    ctx.beginPath();
    ctx.moveTo(box.left + box.width, y);
    ctx.lineTo(box.left + box.width + 6 * scale, y);
    ctx.stroke();

    ctx.fillStyle = scheme.titleTextColor;
    ctx.textAlign = 'left';
    ctx.fillText(`${m > 0 ? '+' : ''}${m}`, box.left + box.width + 10 * scale, y + 3.5 * scale);
  }

  // Left Y-axis decade ticks: Solar Luminosity (L / L_sun = 10^(0.4 * (4.67 - M_G)))
  const lumDecades: Array<{ lumLabel: string; logLum: number }> = [
    { lumLabel: '100 000', logLum: 5 },
    { lumLabel: '10 000', logLum: 4 },
    { lumLabel: '1000', logLum: 3 },
    { lumLabel: '100', logLum: 2 },
    { lumLabel: '10', logLum: 1 },
    { lumLabel: '1', logLum: 0 },
    { lumLabel: '0.1', logLum: -1 },
    { lumLabel: '0.01', logLum: -2 },
    { lumLabel: '0.001', logLum: -3 },
    { lumLabel: '0.0001', logLum: -4 },
  ];
  for (const dec of lumDecades) {
    const absMag = 4.67 - 2.5 * dec.logLum;
    const { y } = starToCanvasXY(0, absMag, box, bounds);
    if (y < box.top + 12 || y > box.top + box.height - 12) continue;

    ctx.strokeStyle = scheme.axisTextColor;
    ctx.beginPath();
    ctx.moveTo(box.left - 6 * scale, y);
    ctx.lineTo(box.left, y);
    ctx.stroke();

    ctx.fillStyle = scheme.titleTextColor;
    ctx.textAlign = 'right';
    ctx.fillText(dec.lumLabel, box.left - 10 * scale, y + 3.5 * scale);
  }

  // Clip interior plot region
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.left, box.top, box.width, box.height);
  ctx.clip();

  // Optional Constant Stellar Radius Overlay Lines (0.01 R☉ to 1000 R☉)
  if (showRadiusLines) {
    ctx.save();
    ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.22)' : 'rgba(148, 163, 184, 0.25)';
    ctx.fillStyle = isLightTheme ? 'rgba(15, 23, 42, 0.55)' : 'rgba(148, 163, 184, 0.65)';
    ctx.lineWidth = 1 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.font = `${Math.round(9.5 * scale)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';

    for (const rSolar of RADIUS_LINES_SOLAR) {
      const curve = computeConstantRadiusCurve(rSolar, 42);
      ctx.beginPath();
      curve.forEach((pt, idx) => {
        const { x, y } = starToCanvasXY(pt.bpRp, pt.absoluteMagG, box, bounds);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      const labelAnchor = curve[6];
      if (labelAnchor) {
        const pos = starToCanvasXY(labelAnchor.bpRp, labelAnchor.absoluteMagG, box, bounds);
        ctx.fillText(`${rSolar} R☉`, pos.x + 4 * scale, pos.y - 4 * scale);
      }
    }
    ctx.restore();
  }

  // Plot live Gaia stars as pinpoint fine-art stardust points
  ctx.save();
  if (!isLightTheme) {
    ctx.globalCompositeOperation = 'lighter';
  }
  for (const { star } of stars) {
    if (star.bpRp === null || star.absoluteMagG === null) continue;
    const { x, y } = starToCanvasXY(star.bpRp, star.absoluteMagG, box, bounds);
    if (x < box.left - 10 || x > box.left + box.width + 10) continue;
    if (y < box.top - 10 || y > box.top + box.height + 10) continue;

    const color = bpRpToStarHexColor(star.bpRp, schemeId);
    const radius = computeStarCanvasRadius(star.absoluteMagG, scale);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = isLightTheme ? 0.85 : 0.80;
    ctx.fill();
  }
  ctx.restore();
  ctx.restore(); // end of clip

  // Crisp outer plot frame border
  ctx.strokeStyle = isLightTheme ? '#334155' : 'rgba(203, 213, 225, 0.80)';
  ctx.lineWidth = 1.3 * scale;
  ctx.strokeRect(box.left, box.top, box.width, box.height);

  // Axis titles
  ctx.fillStyle = scheme.axisTextColor;
  ctx.font = `500 ${Math.round(11.5 * scale)}px "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Colour Index (G_BP − G_RP)', box.left + box.width / 2, box.top + box.height + 34 * scale);

  ctx.fillStyle = scheme.titleTextColor;
  ctx.save();
  ctx.translate(16 * scale, box.top + box.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Luminosity (Sun = 1)', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(width - 14 * scale, box.top + box.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('Absolute Magnitude (M_G)', 0, 0);
  ctx.restore();

  // 3. Editorial Clean Museum Plaque Block
  const centerX = width / 2;

  let mainTitle = 'HERTZSPRUNG–RUSSELL DIAGRAM';
  let subtitle = 'STELLAR EVOLUTION & SPECTRAL CLASSIFICATION';

  if (additionalPresets.length > 0 && primaryPreset) {
    mainTitle = 'STELLAR POPULATION COMPARISON';
    subtitle = [primaryPreset.shortName, ...additionalPresets.map((p) => p.shortName)]
      .join('  •  ')
      .toUpperCase();
  } else if (primaryPreset) {
    mainTitle = formatPosterTitle(primaryPreset);
    subtitle = 'HERTZSPRUNG–RUSSELL STELLAR POPULATION DIAGRAM';
  } else if (customTarget) {
    mainTitle = customTarget.name.toUpperCase();
    subtitle = `ICRS CONE · RA ${customTarget.ra.toFixed(2)}°  DEC ${customTarget.dec.toFixed(2)}°`;
  }

  // Museum Title
  ctx.font = `700 110px "Inter", sans-serif`;
  ctx.fillStyle = isLightTheme ? '#0f172a' : scheme.titleTextColor;
  ctx.textAlign = 'center';
  ctx.fillText(mainTitle, centerX, 5280);

  // Subtitle
  ctx.font = `500 42px "Inter", sans-serif`;
  ctx.fillStyle = scheme.axisTextColor;
  ctx.fillText(subtitle, centerX, 5370);

  // Primary dividing rule
  ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.22)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(box.left, 5450);
  ctx.lineTo(box.left + box.width, 5450);
  ctx.stroke();

  // 5 Museum Plaque Columns
  const distPc = primaryPreset?.distancePcApprox ?? (customTarget?.minDistancePc ?? 100);
  const distStr =
    distPc >= 1000
      ? `~${(distPc / 1000).toFixed(1)} kpc (${Math.round((distPc * 3.26156) / 1000)} kly)`
      : `~${distPc} pc (${Math.round(distPc * 3.26156)} ly)`;

  let coordStr = 'ALL-SKY (4π sr)';
  if (primaryPreset?.cone) {
    coordStr = `${formatHms(primaryPreset.cone.ra, 0)}  ${formatDms(primaryPreset.cone.dec, 0)}`;
  } else if (customTarget) {
    coordStr = `${formatHms(customTarget.ra, 0)}  ${formatDms(customTarget.dec, 0)}`;
  }

  const columns = [
    {
      label: 'CATALOG ID',
      value: primaryPreset?.catalogCode ?? primaryPreset?.shortName ?? 'GAIA DR3',
    },
    {
      label: 'CLASSIFICATION',
      value: primaryPreset?.category?.toUpperCase() ?? 'STELLAR FIELD',
    },
    {
      label: 'COORDINATES (J2000)',
      value: coordStr,
    },
    {
      label: 'DISTANCE',
      value: distStr,
    },
    {
      label: 'CLUSTER AGE',
      value: primaryPreset?.age?.toUpperCase() ?? 'MIXED DISK',
    },
  ];

  const colWidth = box.width / columns.length;
  for (let i = 0; i < columns.length; i++) {
    const colCenter = box.left + colWidth * (i + 0.5);
    ctx.font = `600 28px "Inter", sans-serif`;
    ctx.fillStyle = scheme.axisTextColor;
    ctx.fillText(columns[i].label, colCenter, 5550);

    ctx.font = `500 36px "JetBrains Mono", monospace`;
    ctx.fillStyle = isLightTheme ? '#0f172a' : '#f8fafc';
    ctx.fillText(columns[i].value, colCenter, 5630);
  }

  // Secondary subtle dividing rule
  ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(box.left, 5730);
  ctx.lineTo(box.left + box.width, 5730);
  ctx.stroke();

  // Curated description
  const description =
    primaryPreset?.subtitle ??
    'Astrometric and photometric measurement of stellar population members observed by the Gaia spacecraft.';
  ctx.font = `400 35px "Inter", sans-serif`;
  ctx.fillStyle = scheme.axisTextColor;
  ctx.fillText(description, centerX, 5840);

  // Bottom Provenance Line (Clean Museum Edition: zero app promotional branding)
  ctx.font = `500 27px "JetBrains Mono", monospace`;
  ctx.fillStyle = isLightTheme ? 'rgba(15, 23, 42, 0.65)' : 'rgba(148, 163, 184, 0.65)';
  ctx.fillText(
    'OBSERVATIONAL ASTROMETRY & PHOTOMETRY: NASA IPAC / IRSA 2MASS ALL-SKY SURVEY · U.S. PUBLIC DOMAIN',
    centerX,
    6680
  );
  ctx.fillText(
    `${stars.length.toLocaleString()} MEASURED STELLAR SOURCES · 300 DPI FINE-ART PRINT EDITION`,
    centerX,
    6750
  );
}

/**
 * Asynchronously generates and downloads a print-ready 18" × 24" (300 DPI, 5400 × 7200 px)
 * portrait gallery poster PNG for a target preset.
 * Uses cached NASA 2MASS stars if available, or rich synthesized fallback stars.
 */
export async function downloadGalleryPoster(
  preset: TargetPreset,
  themeOrSchemeId: PosterThemeId | ColorSchemeId = 'two-maps',
  options?: { showRadiusLines?: boolean }
): Promise<void> {
  if (typeof document === 'undefined') return;

  const width = 5400;
  const height = 7200;
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  let stars = getCachedNasaStars(preset.id, 1000) ?? getCachedTargetStars(preset.id, 1000);
  if (!stars || stars.length === 0) {
    stars = generateClusterFallbackStars(preset);
  }

  const tagged = stars.map((star) => ({
    star,
    sourceLabel: preset.shortName,
  }));

  const isFineArtTheme =
    themeOrSchemeId === 'two-maps' ||
    themeOrSchemeId === 'star-quilt' ||
    themeOrSchemeId === 'night-fall';

  if (isFineArtTheme) {
    renderFineArtPoster({
      ctx,
      width,
      height,
      bounds: HR_BOUNDS,
      themeId: themeOrSchemeId as PosterThemeId,
      stars: tagged,
      primaryPreset: preset,
    });
  } else {
    renderGalleryPosterCanvas({
      ctx,
      width,
      height,
      bounds: HR_BOUNDS,
      schemeId: themeOrSchemeId as ColorSchemeId,
      stars: tagged,
      showRadiusLines: options?.showRadiusLines ?? false,
      primaryPreset: preset,
    });
  }

  return new Promise((resolve) => {
    offscreen.toBlob((blob) => {
      if (!blob) {
        resolve();
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `starplot-18x24-${preset.id}-${themeOrSchemeId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve();
      }, 5000);
    }, 'image/png');
  });
}



