import { bpRpToEffectiveTempK, bpRpToSpectralClass, formatDms, formatHms } from '@skyscout/core';
import { NasaClient, type TwoMassStar } from '@skyscout/nasa-client';
import { HipsClient } from '@skyscout/hips-client';
import { SkyviewClient } from '@skyscout/skyview-client';
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

  // Iconic local stars within 50 pc centered on the Sun
  const solarLocalStars = [
    { name: 'Sirius', ra: 101.287, dec: -16.716, distPc: 2.64, bpRp: -0.03, absMag: 1.43 },
    { name: 'Alpha Centauri', ra: 219.902, dec: -60.833, distPc: 1.34, bpRp: 0.71, absMag: 4.38 },
    { name: 'Vega', ra: 279.234, dec: 38.784, distPc: 7.68, bpRp: 0.00, absMag: 0.58 },
    { name: 'Arcturus', ra: 213.915, dec: 19.182, distPc: 11.26, bpRp: 1.23, absMag: -0.31 },
    { name: 'Procyon', ra: 114.825, dec: 5.225, distPc: 3.51, bpRp: 0.42, absMag: 2.68 },
    { name: 'Altair', ra: 297.696, dec: 8.868, distPc: 5.13, bpRp: 0.22, absMag: 2.21 },
  ];

  return points.map((pt, idx) => {
    let starDistPc = distPc;
    if (preset.id === 'solar-50pc') {
      if (idx < solarLocalStars.length) {
        starDistPc = solarLocalStars[idx].distPc;
      } else {
        starDistPc = 1.3 + Math.pow(rand(), 0.6) * 48.7;
      }
    }
    const plx = (1000 / starDistPc) * (1 + (rand() - 0.5) * 0.04);
    const starDistMod = 5 * Math.log10(Math.max(1, starDistPc)) - 5;
    let photG = pt.absoluteMagG + starDistMod + (rand() - 0.5) * 0.08;
    const roundedDistPc = Number(starDistPc.toFixed(1));
    const distLy = Number((roundedDistPc * 3.26156).toFixed(1));
    const logLum = Number(((4.74 - pt.absoluteMagG) / 2.5).toFixed(3));
    const teffK = bpRpToEffectiveTempK(pt.bpRp);

    let ra = baseRa;
    let dec = baseDec;

    if (preset.id === 'solar-50pc') {
      if (idx < solarLocalStars.length) {
        ra = solarLocalStars[idx].ra;
        dec = solarLocalStars[idx].dec;
      } else {
        ra = rand() * 360;
        dec = (Math.asin(rand() * 2 - 1) * 180) / Math.PI;
      }
    } else if (preset.id === 'double-cluster') {
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
 * Formats a clean, non-redundant poster title for a cluster preset,
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

const defaultHipsClient = new HipsClient();
const defaultSkyviewClient = new SkyviewClient();

/**
 * Returns a direct public-domain astronomical image cutout URL for a star cluster preset.
 * Defaults to NASA 2MASS near-infrared color composite (100% U.S. Public Domain).
 */
export function getClusterCutoutUrl(
  preset: TargetPreset,
  survey: '2mass' | 'dss2' = '2mass',
  pixelSize = 1200
): string {
  const ra = preset.cone?.ra ?? 56.75;
  const dec = preset.cone?.dec ?? 24.12;
  const fovDeg = Math.max(0.35, (preset.cone?.radiusDeg ?? 1.2) * 2.2);

  if (survey === '2mass') {
    return defaultHipsClient.getCutoutUrl({
      ra,
      dec,
      fovDeg,
      width: pixelSize,
      height: pixelSize,
      hips: 'CDS/P/2MASS/color',
      format: 'jpg',
    });
  }

  return defaultHipsClient.getCutoutUrl({
    ra,
    dec,
    fovDeg,
    width: pixelSize,
    height: pixelSize,
    hips: 'CDS/P/DSS2/color',
    format: 'jpg',
  });
}

/**
 * Famous / bright stars catalog mapping for presets.
 * Highlights iconic named stars (e.g. Alcyone, Mirfak, κ Crucis, BM Scorpii, Sirius, Vega)
 * with radial halos, reticle rings, luminous connecting strands, and typographic callouts.
 */
export interface FamousStarDef {
  name: string;
  designation?: string;
  spectralType?: string;
  description?: string;
}

export const FAMOUS_CLUSTER_STARS: Record<string, FamousStarDef[]> = {
  'pleiades': [
    { name: 'Alcyone', designation: 'η Tauri', spectralType: 'B7 IIIe', description: 'Brightest star in Pleiades' },
    { name: 'Atlas', designation: '27 Tauri', spectralType: 'B8 III', description: 'Father of the Pleiades' },
    { name: 'Electra', designation: '17 Tauri', spectralType: 'B6 IIIe', description: 'Third-brightest Pleiad' },
    { name: 'Maia', designation: '20 Tauri', spectralType: 'B8 III', description: 'Fourth-brightest Pleiad' },
    { name: 'Merope', designation: '23 Tauri', spectralType: 'B6 IVev', description: 'Illuminates Merope Nebula' },
    { name: 'Taygeta', designation: '19 Tauri', spectralType: 'B6 V', description: 'Triple blue-white system' },
    { name: 'Pleione', designation: '28 Tauri', spectralType: 'B8 Vne', description: 'Rapidly rotating shell star' },
  ],
  'alpha-persei': [
    { name: 'Mirfak', designation: 'α Persei', spectralType: 'F5 Ib', description: 'Yellow-white supergiant anchor' },
    { name: 'δ Persei', designation: '51 Persei', spectralType: 'B5 III', description: 'Luminous blue giant member' },
    { name: 'ψ Persei', designation: '41 Persei', spectralType: 'B5 Ve', description: 'Rapidly spinning Be star' },
    { name: 'σ Persei', designation: '35 Persei', spectralType: 'B7 V', description: 'Hot main sequence member' },
    { name: '29 Persei', designation: 'HIP 14892', spectralType: 'B3 V', description: 'Upper main sequence star' },
  ],
  'jewel-box': [
    { name: 'κ Crucis', designation: 'CD-59 4459', spectralType: 'M2 Iab', description: 'Brilliant ruby red supergiant' },
    { name: 'HD 111904', designation: 'HIP 62894', spectralType: 'B9 Ia', description: 'Luminous blue supergiant' },
    { name: 'HD 111990', designation: 'HIP 62953', spectralType: 'B1/B2 Ib', description: 'Brilliant B-type supergiant' },
    { name: 'HD 111613', designation: 'HIP 62732', spectralType: 'B9.5 Iab', description: 'Hot luminous giant' },
    { name: 'DU Crucis', designation: 'HD 111973', spectralType: 'M2 Ib', description: 'Red supergiant variable' },
  ],
  'm6': [
    { name: 'BM Scorpii', designation: 'HD 160371', spectralType: 'K2.5 Ib-II', description: 'Orange supergiant anchor' },
    { name: 'HD 160578', designation: 'HIP 86666', spectralType: 'B4 V', description: 'Hot blue main sequence star' },
    { name: 'HD 160529', designation: 'HIP 86624', spectralType: 'A2 Ia', description: 'Luminous hypergiant candidate' },
    { name: 'HD 160167', designation: 'HIP 86450', spectralType: 'B8 III', description: 'Evolved B-type giant' },
  ],
  'solar-50pc': [
    { name: 'Sirius', designation: 'α CMa', spectralType: 'A1 V', description: 'Brightest star in Earth night sky' },
    { name: 'Vega', designation: 'α Lyr', spectralType: 'A0 V', description: 'Photometric calibration anchor' },
    { name: 'Arcturus', designation: 'α Boo', spectralType: 'K1.5 III', description: 'Brightest northern red giant' },
    { name: 'Alpha Centauri', designation: 'α Cen A', spectralType: 'G2 V', description: 'Nearest solar twin to Earth' },
    { name: 'Procyon', designation: 'α CMi', spectralType: 'F5 IV-V', description: 'Nearby subgiant with WD companion' },
    { name: 'Altair', designation: 'α Aql', spectralType: 'A7 V', description: 'Rapidly rotating oblateness star' },
  ],
  'double-cluster': [
    { name: 'RS Persei', designation: 'HD 14488', spectralType: 'M4.5 Iab', description: 'Massive red supergiant' },
    { name: 'HD 14143', designation: 'HIP 10795', spectralType: 'B2 Ia', description: 'Luminous blue supergiant' },
    { name: 'HD 14818', designation: 'HIP 11274', spectralType: 'B2 Ia', description: 'Perseus OB1 supergiant' },
    { name: 'HD 14433', designation: 'HIP 11020', spectralType: 'A1 Ia', description: 'Extreme white supergiant' },
    { name: 'V500 Persei', designation: 'HD 13956', spectralType: 'B1 Ib', description: 'High-mass OB supergiant' },
  ],
  'ngc-6231': [
    { name: 'HD 152248', designation: 'V1007 Sco', spectralType: 'O7.5 III + O7', description: 'Colliding-wind O-type binary' },
    { name: 'HD 152236', designation: 'ζ¹ Scorpii', spectralType: 'B1.5 Ia+', description: 'Luminous blue hypergiant' },
    { name: 'HD 152408', designation: 'WR 79a', spectralType: 'WN7 / O-type', description: 'Extreme stellar wind giant' },
    { name: 'HD 152234', designation: 'HIP 82670', spectralType: 'B0.5 Ia', description: 'OB association supergiant' },
    { name: 'HD 152219', designation: 'V1003 Sco', spectralType: 'O9.5 IV', description: 'Hot massive turnoff star' },
  ],
  'hyades': [
    { name: 'Ain', designation: 'ε Tauri', spectralType: 'K0 III', description: 'Northern Eye of the Bull' },
    { name: 'Hyadum I', designation: 'γ Tauri', spectralType: 'K0 III', description: 'Evolved red clump giant' },
    { name: 'Hyadum II', designation: 'δ¹ Tauri', spectralType: 'K0 III', description: 'Second Hyades giant anchor' },
    { name: 'θ² Tauri', designation: '77 Tauri', spectralType: 'A7 III', description: 'Luminous A-type subgiant' },
    { name: 'θ¹ Tauri', designation: '78 Tauri', spectralType: 'K0 III', description: 'Spectroscopic binary giant' },
  ],
  'praesepe': [
    { name: 'ε Cancri', designation: '41 Cancri', spectralType: 'A5m', description: 'Central Beehive A-type member' },
    { name: 'Asellus Borealis', designation: 'γ Cancri', spectralType: 'A1 IV', description: 'Northern donkey star' },
    { name: 'Asellus Australis', designation: 'δ Cancri', spectralType: 'K0 III', description: 'Southern donkey star; red giant' },
    { name: 'HD 73598', designation: 'HIP 42527', spectralType: 'K0 III', description: 'Evolved clump giant' },
  ],
  'm11': [
    { name: 'HD 174512', designation: 'HIP 92507', spectralType: 'K0 II-III', description: 'Brightest cluster giant (mag 8.5)' },
    { name: 'HD 174567', designation: 'HIP 92534', spectralType: 'B8 III', description: 'Hot turnoff giant' },
    { name: 'HD 174403', designation: 'HIP 92455', spectralType: 'B9 V', description: 'Upper main sequence star' },
  ],
  'm7': [
    { name: 'HD 162586', designation: 'HIP 87548', spectralType: 'G8 III', description: 'Brightest yellow giant' },
    { name: 'HD 162374', designation: 'HIP 87460', spectralType: 'B6 V', description: 'Hot blue member' },
    { name: 'HD 162189', designation: 'HIP 87383', spectralType: 'B9.5 V', description: 'Main sequence star' },
  ],
  'ic-2602': [
    { name: 'θ Carinae', designation: 'HIP 52419', spectralType: 'B0.5 Vp', description: 'Brightest star in Southern Pleiades' },
    { name: 'HD 93194', designation: 'HIP 52502', spectralType: 'B5 Vn', description: 'Blue fast-rotating star' },
    { name: 'HD 92938', designation: 'HIP 52370', spectralType: 'B3 V', description: 'Hot upper main sequence member' },
  ],
  'm35': [
    { name: 'HD 41996', designation: 'HIP 29196', spectralType: 'G0 Ib/II', description: 'Yellow supergiant anchor' },
    { name: 'HD 41940', designation: 'HIP 29158', spectralType: 'B7 III', description: 'Luminous blue giant' },
    { name: 'HD 41980', designation: 'HIP 29188', spectralType: 'B8 V', description: 'Upper main sequence star' },
  ],
  'm47': [
    { name: 'HD 60997', designation: 'HIP 37050', spectralType: 'K3 II', description: 'Bright orange giant' },
    { name: 'HD 60855', designation: 'HIP 36981', spectralType: 'B2 V', description: 'Hot blue turnoff star' },
    { name: 'HD 61068', designation: 'HIP 37088', spectralType: 'B3 V', description: 'Main sequence B star' },
  ],
  'm67': [
    { name: 'HD 75707', designation: 'HIP 43574', spectralType: 'K0 III', description: 'Red Giant Branch tip' },
    { name: 'HD 75638', designation: 'HIP 43538', spectralType: 'F0 IV', description: 'Subgiant turnoff star' },
    { name: 'HD 75682', designation: 'HIP 43564', spectralType: 'G8 III', description: 'Evolved clump giant' },
  ],
  'm4': [
    { name: 'HD 147888', designation: 'HIP 80474', spectralType: 'B3/B4 V', description: 'Bright early-type star' },
    { name: '17 Scorpii', designation: 'HIP 80079', spectralType: 'A0 V', description: 'Bright Scorpius member' },
  ],
  'omega-centauri': [
    { name: 'ROA 24', designation: 'HIP 65474', spectralType: 'K3 Ib', description: 'Brightest Red Giant Branch tip' },
    { name: 'Feige 29', designation: 'HIP 64007', spectralType: 'sdB', description: 'Hot blue horizontal branch star' },
  ],
};

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) || 255;
    const g = parseInt(clean[1] + clean[1], 16) || 255;
    const b = parseInt(clean[2] + clean[2], 16) || 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const r = parseInt(clean.substring(0, 2), 16) || 255;
  const g = parseInt(clean.substring(2, 4), 16) || 255;
  const b = parseInt(clean.substring(4, 6), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Draws an archival scientific telescope plate cutout in the corner of fine-art posters,
 * complete with corner reticle brackets, viewfinder crosshair, and NASA public-domain attribution.
 */
export function drawCornerTelescopePlate(options: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  size: number;
  image?: CanvasImageSource | null;
  preset: TargetPreset;
  themeIsLight?: boolean;
}): void {
  const { ctx, x, y, size, image, preset, themeIsLight = false } = options;

  const textColor = themeIsLight ? '#292524' : '#ffffff';
  const subtextColor = themeIsLight ? '#78716c' : 'rgba(255, 255, 255, 0.55)';
  const frameBorderColor = themeIsLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.25)';
  const tickColor = themeIsLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.65)';
  const crossColor = themeIsLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.3)';

  ctx.save();

  // Header label above plate
  ctx.textAlign = 'left';
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.fillStyle = textColor;
  ctx.fillText('PHOTOGRAPHIC SURVEY PLATE', x, y - 20);

  // Background backing
  ctx.fillStyle = '#010204';
  ctx.fillRect(x, y, size, size);

  // Photographic survey plate image
  if (image) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.clip();
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
  } else {
    // Elegant starry placeholder when plate image is loading or offline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NASA 2MASS ALL-SKY', x + size / 2, y + size / 2 - 10);
    ctx.fillText('PLATE PREVIEW', x + size / 2, y + size / 2 + 18);
  }

  // Thin outer frame
  ctx.strokeStyle = frameBorderColor;
  ctx.lineWidth = 2.0;
  ctx.strokeRect(x, y, size, size);

  // Scientific corner brackets
  const tickLen = 22;
  ctx.strokeStyle = tickColor;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  // Top-left
  ctx.moveTo(x, y + tickLen);
  ctx.lineTo(x, y);
  ctx.lineTo(x + tickLen, y);
  // Top-right
  ctx.moveTo(x + size - tickLen, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size, y + tickLen);
  // Bottom-left
  ctx.moveTo(x, y + size - tickLen);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x + tickLen, y + size);
  // Bottom-right
  ctx.moveTo(x + size - tickLen, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size, y + size - tickLen);
  ctx.stroke();

  // Center viewfinder crosshair
  const midX = x + size / 2;
  const midY = y + size / 2;
  ctx.strokeStyle = crossColor;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(midX - 16, midY);
  ctx.lineTo(midX + 16, midY);
  ctx.moveTo(midX, midY - 16);
  ctx.lineTo(midX, midY + 16);
  ctx.stroke();

  // Captions below plate
  ctx.textAlign = 'left';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillStyle = subtextColor;
  ctx.fillText('NASA IPAC 2MASS ALL-SKY INFRARED', x, y + size + 32);

  ctx.font = '400 18px "JetBrains Mono", monospace';
  ctx.fillStyle = subtextColor;
  const fovText = preset.cone?.radiusDeg ? `FOV ~${(preset.cone.radiusDeg * 2).toFixed(1)}°` : 'ALL-SKY 50 PC';
  ctx.fillText(`${fovText} · U.S. PUBLIC DOMAIN`, x, y + size + 58);

  ctx.restore();
}

/**
 * Deconflicts and lays out star callouts with guaranteed non-overlapping shelves,
 * clean leader lines, and smart left/right cluster distribution.
 */
export interface CalloutInputItem {
  star: GaiaStar;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  hex: string;
  absMag?: number;
}

export interface ResolvedCalloutItem extends CalloutInputItem {
  isRight: boolean;
  leaderStartX: number;
  leaderStartY: number;
  elbowX: number;
  shelfStartX: number;
  shelfEndX: number;
  shelfY: number;
  textX: number;
  nameY: number;
  subtitleY: number;
  textAlign: CanvasTextAlign;
}

export function layoutStarCallouts(
  items: CalloutInputItem[],
  options: {
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
    originX: number;
    minVerticalGap?: number;
    shelfWidth?: number;
    isSkyArea?: boolean;
  }
): ResolvedCalloutItem[] {
  if (items.length === 0) return [];

  const minGap = options.minVerticalGap ?? 64;
  const shelfWidth = options.shelfWidth ?? 140;

  // 1. Group stars that are horizontally close (within 140px)
  const sortedX = [...items].sort((a, b) => a.x - b.x);
  const clusters: CalloutInputItem[][] = [];
  let currentCluster: CalloutInputItem[] = [];

  for (const s of sortedX) {
    if (currentCluster.length === 0) {
      currentCluster.push(s);
    } else {
      const prev = currentCluster[currentCluster.length - 1];
      if (s.x - prev.x <= 140) {
        currentCluster.push(s);
      } else {
        clusters.push(currentCluster);
        currentCluster = [s];
      }
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  // 2. Assign side (left vs right)
  const leftItems: CalloutInputItem[] = [];
  const rightItems: CalloutInputItem[] = [];

  if (clusters.length === 1 && clusters[0].length > 1) {
    // Single compact cluster: split evenly into left and right wings
    const single = clusters[0];
    const half = Math.ceil(single.length / 2);
    for (let i = 0; i < single.length; i++) {
      if (i < half && single[i].x > options.bounds.minX + 220) {
        leftItems.push(single[i]);
      } else {
        rightItems.push(single[i]);
      }
    }
  } else {
    for (let cIdx = 0; cIdx < clusters.length; cIdx++) {
      const cl = clusters[cIdx];
      const clCenterX = cl.reduce((sum, s) => sum + s.x, 0) / cl.length;
      const isLeft =
        clusters.length > 1
          ? cIdx === 0 && clCenterX > options.bounds.minX + 240
          : clCenterX < options.originX;

      for (const s of cl) {
        if (isLeft) leftItems.push(s);
        else rightItems.push(s);
      }
    }
  }

  // 3. Deconflict vertical shelves for each side
  function deconflictGroup(group: CalloutInputItem[], isRight: boolean): ResolvedCalloutItem[] {
    if (group.length === 0) return [];

    const sortedY = [...group].sort((a, b) => a.y - b.y);
    const k = sortedY.length;

    const yCenter = sortedY.reduce((sum, s) => sum + s.y, 0) / k;
    const hTotal = (k - 1) * minGap;
    const yBase = yCenter - hTotal / 2 - 12;

    const shelves = sortedY.map((s, idx) => Math.round(yBase + idx * minGap));

    // Iterative relaxation passes to strictly prevent overlaps and respect bounds
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 0; i < k - 1; i++) {
        if (shelves[i + 1] - shelves[i] < minGap) {
          const push = (minGap - (shelves[i + 1] - shelves[i])) / 2;
          shelves[i] -= push;
          shelves[i + 1] += push;
        }
      }
      for (let i = 0; i < k; i++) {
        if (shelves[i] < options.bounds.minY) shelves[i] = options.bounds.minY;
        if (shelves[i] > options.bounds.maxY) shelves[i] = options.bounds.maxY;
      }
      for (let i = 0; i < k - 1; i++) {
        if (shelves[i + 1] < shelves[i] + minGap) shelves[i + 1] = shelves[i] + minGap;
      }
      for (let i = k - 1; i > 0; i--) {
        if (shelves[i - 1] > shelves[i] - minGap) shelves[i - 1] = shelves[i] - minGap;
      }
    }

    const minX = Math.min(...sortedY.map((s) => s.x));
    const maxX = Math.max(...sortedY.map((s) => s.x));
    const spanX = maxX - minX;
    const useUnifiedCol = spanX < 180;
    const unifiedColX = isRight ? maxX + 70 : minX - 70;

    return sortedY.map((s, idx) => {
      const shelfY = shelves[idx];
      const colX = useUnifiedCol ? unifiedColX : isRight ? s.x + 75 : s.x - 75;
      const leaderStartX = isRight ? s.x + 18 : s.x - 18;
      const leaderStartY = s.y;
      const elbowX = isRight ? colX - 16 : colX + 16;
      const shelfStartX = colX;
      const shelfEndX = isRight ? colX + shelfWidth : colX - shelfWidth;

      return {
        ...s,
        isRight,
        leaderStartX,
        leaderStartY,
        elbowX,
        shelfStartX,
        shelfEndX,
        shelfY,
        textX: shelfStartX + (isRight ? 8 : -8),
        nameY: shelfY - 6,
        subtitleY: shelfY + 18,
        textAlign: isRight ? 'left' : 'right',
      };
    });
  }

  const leftResolved = deconflictGroup(leftItems, false);
  const rightResolved = deconflictGroup(rightItems, true);

  return [...leftResolved, ...rightResolved];
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
  skyPlateImage?: CanvasImageSource | null;
}): void {
  const { ctx, width = 5400, height = 7200, bounds, stars, primaryPreset, skyPlateImage } = options;

  // 1. Pitch black background
  ctx.fillStyle = '#030509';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const preset = primaryPreset ?? TARGET_PRESETS[0];

  const distStr =
    preset.distancePcApprox >= 1000
      ? `${(preset.distancePcApprox / 1000).toFixed(1)} kpc`
      : `${preset.distancePcApprox} pc`;

  const isSolarVolume = preset.id === 'solar-50pc' || preset.category === 'Solar Volume';

  // Hero Title & Metadata at TOP of the poster
  ctx.textAlign = 'left';
  ctx.font = '800 120px "Inter", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(formatPosterTitle(preset), 650, 400);

  ctx.font = '500 32px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText(
    `${preset.category.toUpperCase()} · ${preset.constellation?.toUpperCase() ?? 'MILKY WAY'} · ~${distStr.toUpperCase()} · ~${preset.age.toUpperCase()}`,
    650,
    470
  );

  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.fillText(
    'NASA IPAC 2MASS ALL-SKY SURVEY · U.S. PUBLIC DOMAIN · 300 DPI FINE-ART EDITION',
    650,
    525
  );

  // Top Right: Catalog code & coordinates
  ctx.textAlign = 'right';
  ctx.font = '700 48px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText(preset.catalogCode ?? preset.shortName, width - 650, 400);

  ctx.font = '500 28px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  const rightCoord = isSolarVolume
    ? 'SOLAR BUBBLE · 50 PC SPHERE'
    : `RA ${preset.cone ? formatHms(preset.cone.ra) : ''} · DEC ${preset.cone ? formatDms(preset.cone.dec) : ''}`;
  ctx.fillText(rightCoord, width - 650, 460);

  // 2. Top Sky Disc ("WHERE THE STARS ARE")
  const skyCenter = { x: centerX, y: 1900 };
  const skyRadius = 1120;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(skyCenter.x, skyCenter.y, skyRadius, 0, Math.PI * 2);
  ctx.stroke();

  if (isSolarVolume) {
    // Concentric distance range rings from the Sun out to 50 pc
    const rings = [
      { r: skyRadius * 0.2, label: '10 pc (33 ly)' },
      { r: skyRadius * 0.5, label: '25 pc (82 ly)' },
      { r: skyRadius * 0.8, label: '40 pc (130 ly)' },
    ];
    ctx.font = '400 22px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.textAlign = 'left';
    for (const ring of rings) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(skyCenter.x, skyCenter.y, ring.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText(ring.label, skyCenter.x + ring.r + 12, skyCenter.y - 8);
    }

    // Glowing Sun anchor at center (0, 0)
    const sunGrad = ctx.createRadialGradient(skyCenter.x, skyCenter.y, 2, skyCenter.x, skyCenter.y, 32);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#fde047');
    sunGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.4)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(skyCenter.x, skyCenter.y, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(skyCenter.x, skyCenter.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 24px "Inter", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('☉ Sun (0 pc)', skyCenter.x, skyCenter.y + 36);
  } else {
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
  }

  // 3. Bottom H–R Diagram Box
  const hrBox: PlotBox = {
    left: 650,
    top: 3680,
    width: 4100,
    height: 2320,
  };

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(hrBox.left, hrBox.top, hrBox.width, hrBox.height);

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

      let skyX: number;
      let skyY: number;

      if (isSolarVolume) {
        // Heliocentric radial distance projection (Sun at center, physical distance 0..50 pc)
        const distPc =
          star.distancePc ??
          (star.parallaxMas && star.parallaxMas > 0 ? 1000 / star.parallaxMas : 25);
        const rNorm = Math.min(1, Math.max(0.02, distPc / 50));
        const rPixels = rNorm * (skyRadius - 45);
        const angle = (star.ra * Math.PI) / 180;
        skyX = skyCenter.x + Math.cos(angle) * rPixels;
        skyY = skyCenter.y - Math.sin(angle) * rPixels;
      } else {
        const dx = ((star.ra - baseRa) * cosDec) / radiusDeg;
        const dy = (star.dec - baseDec) / radiusDeg;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rClamped = dist <= 1 ? dist : 1 / (1 + (dist - 1) * 0.4);
        const angle = Math.atan2(dy, dx);
        skyX = skyCenter.x + Math.cos(angle) * rClamped * (skyRadius - 40);
        skyY = skyCenter.y - Math.sin(angle) * rClamped * (skyRadius - 40);
      }

      const xNorm = (bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
      const yNorm = (absMag - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag);
      const hrX = hrBox.left + xNorm * hrBox.width;
      const hrY = hrBox.top + yNorm * hrBox.height;

      const hex = bpRpToStarHexColor(bpRp, 'blackbody');
      const brightnessNorm = Math.max(0, Math.min(1, (12 - absMag) / 16));

      return { star, skyX, skyY, hrX, hrY, hex, brightnessNorm, absMag };
    })
    .sort((a, b) => b.absMag - a.absMag);

  // 5. Partition stars into standard background and highlighted bright/famous stars
  const brightestSorted = [...starData].sort((a, b) => a.absMag - b.absMag);
  const highlightCount = Math.min(6, brightestSorted.length);
  const brightestSlice = brightestSorted.slice(0, highlightCount);
  const highlightStarSet = new Set(brightestSlice.map((s) => s.star));

  const famousDefs = FAMOUS_CLUSTER_STARS[preset.id] ?? [];
  const highlightedItems = brightestSlice.map((item, idx) => {
    const famous = famousDefs[idx];
    const phys = getStarPhysicalDetails(item.star);
    const name = famous?.name ?? `${phys.evolutionaryStage} #${idx + 1}`;
    const spectralType = famous?.spectralType ?? phys.evolutionaryStage;
    const subtitle = famous?.designation
      ? `${famous.designation} · ${spectralType}`
      : `${spectralType} · MG ${item.absMag.toFixed(1)}`;
    return { ...item, name, subtitle };
  });

  // Standard connecting strands (gossamer threads)
  for (const item of starData) {
    if (highlightStarSet.has(item.star)) continue;
    const alpha = Math.min(0.22, 0.05 + item.brightnessNorm * 0.16);
    const lineWidth = Math.max(1.0, 0.8 + item.brightnessNorm * 1.6);

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

  // Highlighted luminous connecting strands (brilliant double glow!)
  for (const item of highlightedItems) {
    const cp1Y = item.skyY + (item.hrY - item.skyY) * 0.45;
    const cp2Y = item.hrY - (item.hrY - item.skyY) * 0.45;

    ctx.save();
    // Outer wide glow
    ctx.strokeStyle = item.hex;
    ctx.globalAlpha = 0.24;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(item.skyX, item.skyY);
    ctx.bezierCurveTo(item.skyX, cp1Y, item.hrX, cp2Y, item.hrX, item.hrY);
    ctx.stroke();

    // Medium glow
    ctx.globalAlpha = 0.58;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Sharp luminous white core
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.restore();
  }

  // Standard star dots
  for (const item of starData) {
    if (highlightStarSet.has(item.star)) continue;
    const dotRadius = Math.max(2.2, 1.8 + item.brightnessNorm * 4.2);

    ctx.fillStyle = item.hex;
    ctx.beginPath();
    ctx.arc(item.skyX, item.skyY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(item.hrX, item.hrY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Highlighted bright star dots (radial halos, reticle rings, and white cores)
  for (let i = 0; i < highlightedItems.length; i++) {
    const item = highlightedItems[i];

    // --- In Sky Disc ("THE SKY") ---
    const skyHalo = ctx.createRadialGradient(item.skyX, item.skyY, 2, item.skyX, item.skyY, 52);
    skyHalo.addColorStop(0, hexToRgba(item.hex, 0.95));
    skyHalo.addColorStop(0.25, hexToRgba(item.hex, 0.5));
    skyHalo.addColorStop(0.65, hexToRgba(item.hex, 0.15));
    skyHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = skyHalo;
    ctx.beginPath();
    ctx.arc(item.skyX, item.skyY, 52, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = item.hex;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(item.skyX, item.skyY, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(item.skyX, item.skyY, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- In Diagram ("THE DIAGRAM") ---
    const hrHalo = ctx.createRadialGradient(item.hrX, item.hrY, 2, item.hrX, item.hrY, 44);
    hrHalo.addColorStop(0, hexToRgba(item.hex, 0.95));
    hrHalo.addColorStop(0.25, hexToRgba(item.hex, 0.5));
    hrHalo.addColorStop(0.65, hexToRgba(item.hex, 0.15));
    hrHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = hrHalo;
    ctx.beginPath();
    ctx.arc(item.hrX, item.hrY, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = item.hex;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(item.hrX, item.hrY, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(item.hrX, item.hrY, 6.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Deconflicted leader lines & labels in Sky Disc
  const skyCallouts = layoutStarCallouts(
    highlightedItems.map((item) => ({
      star: item.star,
      name: item.name,
      subtitle: item.subtitle,
      x: item.skyX,
      y: item.skyY,
      hex: item.hex,
      absMag: item.absMag,
    })),
    {
      bounds: {
        minX: skyCenter.x - skyRadius + 60,
        maxX: skyCenter.x + skyRadius - 60,
        minY: skyCenter.y - skyRadius + 60,
        maxY: skyCenter.y + skyRadius - 60,
      },
      originX: skyCenter.x,
      minVerticalGap: 66,
      shelfWidth: 150,
      isSkyArea: true,
    }
  );

  for (const c of skyCallouts) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(c.leaderStartX, c.leaderStartY);
    ctx.bezierCurveTo(
      c.leaderStartX + (c.isRight ? 28 : -28),
      c.leaderStartY,
      c.elbowX - (c.isRight ? 20 : -20),
      c.shelfY,
      c.elbowX,
      c.shelfY
    );
    ctx.lineTo(c.shelfEndX, c.shelfY);
    ctx.stroke();

    ctx.textAlign = c.textAlign;
    ctx.font = '700 24px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(c.name, c.textX, c.nameY);

    ctx.font = '500 18px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(c.subtitle, c.textX, c.subtitleY);
    ctx.restore();
  }

  // Deconflicted leader lines & labels in Diagram
  const hrCallouts = layoutStarCallouts(
    highlightedItems.map((item) => ({
      star: item.star,
      name: item.name,
      subtitle: `MG ${item.absMag.toFixed(1)} · BP-RP ${(item.star.bpRp ?? 0.8).toFixed(2)}`,
      x: item.hrX,
      y: item.hrY,
      hex: item.hex,
      absMag: item.absMag,
    })),
    {
      bounds: {
        minX: hrBox.left + 40,
        maxX: hrBox.left + hrBox.width - 40,
        minY: hrBox.top + 60,
        maxY: hrBox.top + hrBox.height - 40,
      },
      originX: hrBox.left + hrBox.width * 0.5,
      minVerticalGap: 64,
      shelfWidth: 140,
      isSkyArea: false,
    }
  );

  for (const c of hrCallouts) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(c.leaderStartX, c.leaderStartY);
    ctx.bezierCurveTo(
      c.leaderStartX + (c.isRight ? 24 : -24),
      c.leaderStartY,
      c.elbowX - (c.isRight ? 18 : -18),
      c.shelfY,
      c.elbowX,
      c.shelfY
    );
    ctx.lineTo(c.shelfEndX, c.shelfY);
    ctx.stroke();

    ctx.textAlign = c.textAlign;
    ctx.font = '700 22px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(c.name, c.textX, c.nameY);

    ctx.font = '500 17px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(c.subtitle, c.textX, c.subtitleY);
    ctx.restore();
  }

  // Bottom Left: Series metadata & archive info
  ctx.textAlign = 'left';
  ctx.font = '600 26px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText('STARPLOT ASTRONOMICAL FINE-ART POSTER SERIES', hrBox.left, 6500);

  ctx.font = '400 22px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText(
    'ESA GAIA DR3 ASTROMETRY · STELLAR POPULATION ARCHIVE · 300 DPI',
    hrBox.left,
    6545
  );

  // Bottom Right: Explanation text
  ctx.textAlign = 'left';
  ctx.font = '400 29px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const rightX = centerX + 400;
  if (isSolarVolume) {
    ctx.fillText('Above, our local stellar neighborhood mapped from the', rightX, 6500);
    ctx.fillText('Sun at center out to 50 pc (163 ly). Below, the same', rightX, 6545);
    ctx.fillText('stars sorted by temperature and luminosity. Lines join brightest.', rightX, 6590);
  } else {
    ctx.fillText('Above, the stars as they sit in the sky. Below, the same', rightX, 6500);
    ctx.fillText('stars sorted by temperature (hot at left) and luminosity', rightX, 6545);
    ctx.fillText('(bright at top). Lines join the brightest stars.', rightX, 6590);
  }
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
  skyPlateImage?: CanvasImageSource | null;
}): void {
  const { ctx, width = 5400, height = 7200, bounds, stars, primaryPreset, skyPlateImage } = options;

  ctx.fillStyle = '#010306';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const preset = primaryPreset ?? TARGET_PRESETS[0];

  const distStr =
    preset.distancePcApprox >= 1000
      ? `${(preset.distancePcApprox / 1000).toFixed(1)} kpc`
      : `${preset.distancePcApprox} pc`;

  // Hero Title & Metadata at TOP of poster
  ctx.textAlign = 'left';
  ctx.font = '800 120px "Inter", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(formatPosterTitle(preset), 520, 400);

  ctx.font = '500 32px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText(
    `${preset.category.toUpperCase()} · ${preset.constellation?.toUpperCase() ?? 'MILKY WAY'} · ~${distStr.toUpperCase()} · ~${preset.age.toUpperCase()}`,
    520,
    470
  );

  // Top Right: SKY + DIAGRAM & Coordinates
  ctx.textAlign = 'right';
  ctx.font = '700 40px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('SKY + DIAGRAM', width - 520, 400);

  ctx.font = '500 26px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  const coordText = preset.cone
    ? `RA ${formatHms(preset.cone.ra)} · DEC ${formatDms(preset.cone.dec)}`
    : 'SOLAR BUBBLE · 50 PC SPHERE';
  ctx.fillText(coordText, width - 520, 460);

  // Wide sky band canopy pouring into the diagram below
  const skyField = {
    left: 520,
    top: 680,
    width: 4360,
    height: 2000,
  };

  const hrBox: PlotBox = {
    left: 650,
    top: 3650,
    width: 4100,
    height: 2400,
  };

  const isSolarVolume = preset.id === 'solar-50pc' || preset.category === 'Solar Volume';

  let starData: Array<{
    star: GaiaStar;
    skyX: number;
    skyY: number;
    hrX: number;
    hrY: number;
    hex: string;
    brightnessNorm: number;
    absMag: number;
    isRed: boolean;
  }>;

  if (isSolarVolume) {
    // ☀️ Local Bubble (50 pc sphere centered on the Sun)
    const bubbleCenterX = centerX;
    const bubbleCenterY = 1750;
    const bubbleRadius = 850;

    // Concentric range rings for the 50 pc Local Bubble
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(bubbleCenterX, bubbleCenterY, bubbleRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bubbleCenterX, bubbleCenterY, bubbleRadius * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Range ring labels
    ctx.font = '500 22px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.textAlign = 'left';
    ctx.fillText('50 PC LOCAL BUBBLE', bubbleCenterX + bubbleRadius + 18, bubbleCenterY - 8);
    ctx.fillText('25 PC', bubbleCenterX + bubbleRadius * 0.5 + 14, bubbleCenterY - 8);

    // Glowing Sun anchor at center (0, 0)
    const sunGrad = ctx.createRadialGradient(
      bubbleCenterX,
      bubbleCenterY,
      2,
      bubbleCenterX,
      bubbleCenterY,
      28
    );
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#fde047');
    sunGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.4)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(bubbleCenterX, bubbleCenterY, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 22px "Inter", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('☉ SUN', bubbleCenterX, bubbleCenterY + 44);
    ctx.restore();

    starData = stars
      .map(({ star }) => {
        const bpRp = star.bpRp ?? 0.8;
        const absMag = star.absoluteMagG ?? 4.5;
        const distPc =
          star.distancePc ??
          (star.parallaxMas && star.parallaxMas > 0 ? 1000 / star.parallaxMas : 25);

        // Radial distance from Sun out to 50 pc
        const rNorm = Math.min(1, Math.max(0.04, Math.pow(distPc / 50, 0.72)));
        const xNorm = (bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
        const yNorm = (absMag - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag);

        // Map star inside the Local Bubble sphere so streams radiate gracefully to H-R diagram
        const angleOffset = (xNorm - 0.5) * Math.PI * 0.75;
        const decAngle = ((star.dec ?? 0) / 90) * (Math.PI * 0.35);

        const skyX = bubbleCenterX + Math.sin(angleOffset) * (bubbleRadius * 0.90) * rNorm;
        const skyY =
          bubbleCenterY +
          Math.sin(decAngle) * (bubbleRadius * 0.65) * rNorm -
          (1 - rNorm) * 60;

        const hrX = hrBox.left + xNorm * hrBox.width;
        const hrY = hrBox.top + yNorm * hrBox.height;

        const hex = bpRpToStarHexColor(bpRp, 'blackbody');
        const brightnessNorm = Math.max(0, Math.min(1, (12 - absMag) / 16));
        const isRed = bpRp >= 1.0;

        return { star, skyX, skyY, hrX, hrY, hex, brightnessNorm, absMag, isRed };
      })
      .sort((a, b) => b.absMag - a.absMag);
  } else {
    // 🌌 Star Clusters: Wide sky band canopy pouring into the diagram below
    let raSum = 0;
    let decSum = 0;
    for (const { star } of stars) {
      raSum += star.ra;
      decSum += star.dec;
    }
    const avgRa = stars.length > 0 ? raSum / stars.length : (preset.cone?.ra ?? 56.75);
    const avgDec = stars.length > 0 ? decSum / stars.length : (preset.cone?.dec ?? 24.12);
    const cosDec = Math.max(0.15, Math.cos((avgDec * Math.PI) / 180));

    let maxDx = 0.001;
    let maxDy = 0.001;
    for (const { star } of stars) {
      let dRa = star.ra - avgRa;
      if (dRa > 180) dRa -= 360;
      if (dRa < -180) dRa += 360;
      const dx = Math.abs(dRa * cosDec);
      const dy = Math.abs(star.dec - avgDec);
      if (dx > maxDx) maxDx = dx;
      if (dy > maxDy) maxDy = dy;
    }

    starData = stars
      .map(({ star }) => {
        const bpRp = star.bpRp ?? 0.8;
        const absMag = star.absoluteMagG ?? 4.5;

        let dRa = star.ra - avgRa;
        if (dRa > 180) dRa -= 360;
        if (dRa < -180) dRa += 360;
        const normX = Math.max(-1, Math.min(1, (dRa * cosDec) / maxDx));
        const normY = Math.max(-1, Math.min(1, (star.dec - avgDec) / maxDy));

        const skyX = skyField.left + skyField.width * (0.5 + normX * 0.44);
        const skyY = skyField.top + skyField.height * (0.5 - normY * 0.40);

        const xNorm = (bpRp - bounds.minBpRp) / (bounds.maxBpRp - bounds.minBpRp);
        const yNorm = (absMag - bounds.minAbsMag) / (bounds.maxAbsMag - bounds.minAbsMag);
        const hrX = hrBox.left + xNorm * hrBox.width;
        const hrY = hrBox.top + yNorm * hrBox.height;

        const hex = bpRpToStarHexColor(bpRp, 'blackbody');
        const brightnessNorm = Math.max(0, Math.min(1, (12 - absMag) / 16));
        const isRed = bpRp >= 1.0;

        return { star, skyX, skyY, hrX, hrY, hex, brightnessNorm, absMag, isRed };
      })
      .sort((a, b) => b.absMag - a.absMag);
  }

  // Flowing cascade strands pouring down from sky to diagram
  for (const item of starData) {
    const redAlphaBoost = item.isRed ? 0.16 : 0;
    const redWidthBoost = item.isRed ? 1.0 : 0;
    const alpha = Math.min(0.58, 0.14 + item.brightnessNorm * 0.32 + redAlphaBoost);
    const lineWidth = Math.max(1.6, 1.2 + item.brightnessNorm * 3.8 + redWidthBoost);

    ctx.save();
    ctx.strokeStyle = item.hex;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(item.skyX, item.skyY);
    const cp1Y = item.skyY + (item.hrY - item.skyY) * 0.44;
    const cp2Y = item.hrY - (item.hrY - item.skyY) * 0.44;
    ctx.bezierCurveTo(item.skyX, cp1Y, item.hrX, cp2Y, item.hrX, item.hrY);
    ctx.stroke();
    ctx.restore();
  }

  // Subtle conceptual labels bridging the sky and diagram
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '600 28px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.fillText(
    isSolarVolume ? 'THE 50 PC SPHERE — WHERE THE STARS ARE' : 'THE SKY — WHERE THE STARS ARE',
    centerX,
    2850
  );
  ctx.fillText('THE DIAGRAM — WHAT THE STARS ARE', centerX, 3500);
  ctx.restore();

  // Pinpoint stars at sky position and diagram position
  for (const item of starData) {
    const dotRadius = Math.max(2.5, 2.0 + item.brightnessNorm * 5.5 + (item.isRed ? 1.2 : 0));

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

  // Bottom Left: Series metadata & conceptual explanation
  ctx.textAlign = 'left';
  ctx.font = '400 32px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
  if (isSolarVolume) {
    ctx.fillText('Our local stellar neighborhood within 50 pc (163 ly) of the Sun,', 520, 6420);
    ctx.fillText('poured into the H–R diagram below: hot at left, bright at top.', 520, 6475);
  } else {
    ctx.fillText('The cluster as it sits in the sky, poured into the H–R diagram below.', 520, 6420);
    ctx.fillText('Each strand is one star: hot at left, bright at top, ×10 per step.', 520, 6475);
  }

  ctx.font = '400 22px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText(
    'NASA IPAC 2MASS ALL-SKY SURVEY · U.S. PUBLIC DOMAIN · 300 DPI FINE-ART PRINT',
    520,
    6545
  );

  // Bottom Right: Star count & luminosity legend
  ctx.textAlign = 'right';
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText('ILLUSTRATIVE DATA AND SKY POSITIONS', width - 520, 6420);

  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
  ctx.fillText(`${starData.length} MODELED STARS — STRAND WIDTH = LOG LUMINOSITY`, width - 520, 6465);
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
  skyPlateImage?: CanvasImageSource | null;
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
 * and an editorial typography block at the bottom.
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
  options?: { showRadiusLines?: boolean; skyPlateImage?: CanvasImageSource | null }
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
      skyPlateImage: options?.skyPlateImage,
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

/**
 * Renders a lifestyle room mockup of the poster inside a framed gallery setting.
 * Perfect for Etsy listing cover photo (2400 × 2000 px, 6:5 ratio).
 */
export function renderFramedRoomMockup(options: {
  ctx: CanvasRenderingContext2D;
  posterCanvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  frameStyle?: 'natural-oak' | 'matte-black';
}): void {
  const {
    ctx,
    posterCanvas,
    width = 2400,
    height = 2000,
    frameStyle = 'natural-oak',
  } = options;

  // 1. Ambient wall background with warm gallery lighting
  const wallGrad = ctx.createRadialGradient(width * 0.35, height * 0.3, 100, width * 0.5, height * 0.5, width * 0.85);
  wallGrad.addColorStop(0, '#f5f3ee');
  wallGrad.addColorStop(0.5, '#eae6de');
  wallGrad.addColorStop(1, '#dad5cb');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Minimalist oak credenza / console surface at bottom
  const tableY = height - 160;
  const tableGrad = ctx.createLinearGradient(0, tableY, 0, height);
  tableGrad.addColorStop(0, '#cca87c');
  tableGrad.addColorStop(0.08, '#be9869');
  tableGrad.addColorStop(1, '#93724a');
  ctx.fillStyle = tableGrad;
  ctx.fillRect(0, tableY, width, 160);

  // Table surface top highlight bevel
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, tableY);
  ctx.lineTo(width, tableY);
  ctx.stroke();

  // Subtle contact shadow below the wall / above the credenza
  const edgeShadow = ctx.createLinearGradient(0, tableY - 30, 0, tableY);
  edgeShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edgeShadow.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
  ctx.fillStyle = edgeShadow;
  ctx.fillRect(0, tableY - 30, width, 30);

  // 3. Frame geometry (exact 3:4 aspect ratio artwork)
  const artW = 900;
  const artH = 1200;
  const matBorder = 48;
  const frameBorder = 36;
  const totalW = artW + (matBorder + frameBorder) * 2; // 1068
  const totalH = artH + (matBorder + frameBorder) * 2; // 1368
  const frameX = (width - totalW) / 2;
  const frameY = 240;

  // 4. Multi-layer realistic frame drop shadows
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetX = 18;
  ctx.shadowOffsetY = 36;
  ctx.fillStyle = '#000000';
  ctx.fillRect(frameX, frameY, totalW, totalH);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#000000';
  ctx.fillRect(frameX, frameY, totalW, totalH);
  ctx.restore();

  // 5. Outer wooden / metallic frame
  if (frameStyle === 'natural-oak') {
    const oakGrad = ctx.createLinearGradient(frameX, frameY, frameX + totalW, frameY + totalH);
    oakGrad.addColorStop(0, '#c79d6b');
    oakGrad.addColorStop(0.4, '#d8b283');
    oakGrad.addColorStop(0.7, '#ba905e');
    oakGrad.addColorStop(1, '#a67d4f');
    ctx.fillStyle = oakGrad;
  } else {
    const blackGrad = ctx.createLinearGradient(frameX, frameY, frameX + totalW, frameY + totalH);
    blackGrad.addColorStop(0, '#27272a');
    blackGrad.addColorStop(0.5, '#18181b');
    blackGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = blackGrad;
  }
  ctx.fillRect(frameX, frameY, totalW, totalH);

  // Frame bevel highlight & shadow
  ctx.strokeStyle = frameStyle === 'natural-oak' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frameX + 1, frameY + 1, totalW - 2, totalH - 2);

  // 6. Archival off-white mat border (passe-partout)
  const matX = frameX + frameBorder;
  const matY = frameY + frameBorder;
  const matW = totalW - frameBorder * 2;
  const matH = totalH - frameBorder * 2;

  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(matX, matY, matW, matH);

  // Mat inner bevel shadow
  ctx.strokeStyle = '#dfd9cc';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(matX, matY, matW, matH);

  // 7. Render artwork inside frame opening
  const innerArtX = matX + matBorder;
  const innerArtY = matY + matBorder;

  ctx.drawImage(posterCanvas, innerArtX, innerArtY, artW, artH);

  // Inner art opening drop shadow from mat
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(innerArtX, innerArtY, artW, artH);

  // 8. Subtle glass reflection
  const glassGrad = ctx.createLinearGradient(innerArtX, innerArtY, innerArtX + artW, innerArtY + artH);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  glassGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.02)');
  glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
  glassGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.02)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(innerArtX, innerArtY, artW, artH);
}

/**
 * Renders a 2000 × 2000 macro crop highlighting the glowing bezier strands,
 * famous star callouts, and typography for Etsy secondary gallery photos.
 */
export function renderDetailCropMockup(options: {
  ctx: CanvasRenderingContext2D;
  posterCanvas: HTMLCanvasElement;
  width?: number;
  height?: number;
}): void {
  const { ctx, posterCanvas, width = 2000, height = 2000 } = options;

  // Source crop area centered around the middle transition (threads & stars)
  // Poster is 5400 × 7200
  const srcX = 1400;
  const srcY = 2200;
  const srcSize = 2600;

  ctx.drawImage(posterCanvas, srcX, srcY, srcSize, srcSize, 0, 0, width, height);

  // Corner pill: "300 DPI VECTOR CRISPNESS · DETAIL PREVIEW"
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  const pillW = 460;
  const pillH = 50;
  const pillX = width - pillW - 60;
  const pillY = height - pillH - 60;

  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(pillX, pillY, pillW, pillH, 25) : ctx.rect(pillX, pillY, pillW, pillH);
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 19px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText('300 DPI VECTOR CRISPNESS · DETAIL PREVIEW', pillX + pillW / 2, pillY + 32);
}

/**
 * Generates ready-to-paste Etsy listing metadata, SEO title, 13 search tags, and description.
 */
export function getEtsyListingCopy(
  preset: TargetPreset,
  themeId: PosterThemeId = 'two-maps'
): {
  title: string;
  tags: string[];
  description: string;
  suggestedPriceDigital: string;
  suggestedPricePhysical: string;
} {
  const formattedTitle = formatPosterTitle(preset);
  const constellation = preset.constellation ?? 'Milky Way';
  const isSolar = preset.id === 'solar-50pc';

  const title = isSolar
    ? 'Solar Neighborhood Star Map Poster, Astronomy Wall Art, 50 Parsec 3D Sphere Centered on the Sun & H-R Diagram, Minimalist Space Art Print'
    : `${formattedTitle} Star Cluster Poster, Astronomy Wall Art, ${constellation} Star Map & Hertzsprung Russell Diagram, Minimalist Space Art Print`;

  const tags = [
    'astronomy wall art',
    'star cluster poster',
    `${preset.shortName.toLowerCase()} poster`,
    'space poster vintage',
    'minimalist star map',
    'hertzsprung diagram',
    'celestial wall decor',
    'astrophysics print',
    'stargazing gift',
    'astronomy teacher',
    'space nursery art',
    'scientific poster',
    'dark academia space',
  ].slice(0, 13);

  const description = `✨ ${formattedTitle.toUpperCase()} (${preset.catalogCode ?? preset.shortName}) — DUAL-MAP ASTRONOMICAL FINE-ART PRINT

Where celestial position meets stellar physics.

This astronomical chart presents two interconnected perspectives of ${isSolar ? 'our local solar neighborhood out to 50 pc (163 ly)' : `${formattedTitle} (${preset.category.toLowerCase()} in ${constellation})`}:
• Top: True celestial sky coordinates showing where the stars sit in the night sky.
• Bottom: Hertzsprung–Russell diagram sorting cluster stars by true surface temperature (hot blue at left) and luminosity (brilliant at top).
• Delicate luminous threads join the brightest iconic stars directly between their sky location and their physical astrophysical state.

Synthesized from authentic Gaia DR3 and NASA 2MASS infrared astronomical survey archives.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 WHAT YOU RECEIVE (INSTANT DIGITAL DOWNLOAD)

You will receive an ultra-high-resolution 300 DPI print-ready file formatted in standard 3:4 aspect ratio:
• 18" × 24" (5,400 × 7,200 px) — Standard frame size (Target, IKEA, Amazon)

Easily scales down with razor-sharp fidelity to:
• 12" × 16"
• 9" × 12"
• 6" × 8"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖨️ HOW TO PRINT

1. Home Printer: Use heavy archival matte cardstock or fine-art watercolor paper.
2. Local Print Shop: Staples, Walgreens, Costco, Office Depot, or your local professional print shop.
3. Online Print Services: Gelato, Printify, Shutterfly, Mpix, Printique, or FinerWorks.
*For best results, request heavyweight smooth archival matte paper (200–250 gsm).*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLEASE NOTE
This is an INSTANT DIGITAL DOWNLOAD. No physical print or frame will be shipped. Colors may vary slightly due to monitor calibration and printer profiles.`;

  return {
    title: title.slice(0, 140),
    tags,
    description,
    suggestedPriceDigital: '$8.90',
    suggestedPricePhysical: '$34.00',
  };
}




