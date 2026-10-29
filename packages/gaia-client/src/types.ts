import type { SpectralClass } from '@skyscout/core';

/**
 * Configuration options for initializing GaiaClient.
 * Pure, environment-agnostic: no API key is required for public ESA Gaia TAP queries.
 */
export interface GaiaClientConfig {
  /**
   * Base TAP endpoint URL (default: 'https://gea.esac.esa.int/tap-server/tap').
   * Can be set to a local proxy path (e.g. '/gaia-tap') in browser environments if needed.
   */
  endpoint?: string;
  /**
   * Request timeout in milliseconds (default: 45000).
   */
  timeoutMs?: number;
  /**
   * Optional custom `fetch` implementation for testing or custom runtimes.
   */
  fetch?: typeof fetch;
}

/**
 * Column metadata descriptor returned by the ESA Gaia TAP JSON format.
 */
export interface GaiaTapColumnMeta {
  name: string;
  datatype: string;
  description?: string;
  unit?: string;
  ucd?: string;
}

/**
 * Raw tabular JSON payload returned by the ESA Gaia Archive TAP `/sync` endpoint
 * when `FORMAT=json` is requested.
 */
export interface GaiaTapJsonResponse {
  metadata: GaiaTapColumnMeta[];
  data: Array<Array<string | number | null>>;
}

/**
 * Clean, strongly-typed stellar astrometry & photometry record from Gaia DR3 (`gaiadr3.gaia_source`),
 * enriched with derived physical quantities (distance, absolute magnitude, luminosity, spectral class).
 */
export interface GaiaStar {
  /** Gaia DR3 unique 64-bit source identifier (preserved as string to avoid float64 truncation) */
  sourceId: string;
  /** Right Ascension in decimal degrees (ICRS / J2016.0) */
  ra: number;
  /** Declination in decimal degrees (ICRS / J2016.0) */
  dec: number;
  /** Stellar parallax in milliarcseconds (mas), or null if unmeasured */
  parallaxMas: number | null;
  /** Parallax uncertainty (standard error) in milliarcseconds (mas) */
  parallaxErrorMas: number | null;
  /** Parallax signal-to-noise ratio (parallax / parallax_error) */
  parallaxSnr: number | null;
  /** Proper motion in Right Ascension (mas/yr) */
  pmRaMasYr: number | null;
  /** Proper motion in Declination (mas/yr) */
  pmDecMasYr: number | null;
  /** Heliocentric radial velocity (km/s) */
  radialVelocityKmS: number | null;
  /** Apparent Gaia G-band mean magnitude */
  magG: number;
  /** Apparent Gaia blue photometer (G_BP) mean magnitude */
  magBp: number | null;
  /** Apparent Gaia red photometer (G_RP) mean magnitude */
  magRp: number | null;
  /** Observed Gaia color index (G_BP - G_RP) in magnitudes */
  bpRp: number | null;
  /** Effective surface temperature (K) from GSP-Phot (or empirical fallback from color) */
  teffK: number | null;
  /** Line-of-sight extinction in G band (A_G in magnitudes) from GSP-Phot */
  extinctionAg: number | null;
  /** Color reddening E(G_BP - G_RP) in magnitudes from GSP-Phot */
  reddeningBpRp: number | null;

  // Derived Physical Quantities (computed automatically via @skyscout/core when parallax > 0):
  /** Distance in parsecs (1000 / parallaxMas), or null if parallax <= 0 */
  distancePc: number | null;
  /** Distance in light-years, or null if parallax <= 0 */
  distanceLy: number | null;
  /** Absolute G-band magnitude (M_G), corrected for extinction if available */
  absoluteMagG: number | null;
  /** Logarithmic bolometric luminosity relative to the Sun: log10(L / L☉) */
  logLuminositySolar: number | null;
  /** Approximate Morgan-Keenan spectral classification ('O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M') */
  spectralClass: SpectralClass | null;
}

/**
 * Sort order options for high-level Gaia star queries.
 */
export type GaiaSortField =
  | 'brightest'
  | 'faintest'
  | 'nearest'
  | 'farthest'
  | 'hottest'
  | 'coolest';

/**
 * Common photometric, astrometric, and quality filters for Gaia star searches.
 */
export interface GaiaStarFilterOptions {
  /** Minimum apparent G-band magnitude (bright limit) */
  minMagG?: number;
  /** Maximum apparent G-band magnitude (faint limit, e.g. 17) */
  maxMagG?: number;
  /** Minimum parallax in milliarcseconds (mas) */
  minParallaxMas?: number;
  /** Maximum parallax in milliarcseconds (mas) */
  maxParallaxMas?: number;
  /** Minimum distance in parsecs (automatically converted to maxParallaxMas) */
  minDistancePc?: number;
  /** Maximum distance in parsecs (automatically converted to minParallaxMas) */
  maxDistancePc?: number;
  /** Minimum parallax signal-to-noise ratio (parallax_over_error, e.g. 10) */
  minParallaxSnr?: number;
  /** Minimum (G_BP - G_RP) color index */
  minBpRp?: number;
  /** Maximum (G_BP - G_RP) color index */
  maxBpRp?: number;
  /** Minimum effective temperature in Kelvin */
  minTeffK?: number;
  /** Maximum effective temperature in Kelvin */
  maxTeffK?: number;
  /** Require valid (G_BP - G_RP) color photometry (default: true) */
  requireColor?: boolean;
  /** Require positive parallax measurement (default: true) */
  requirePositiveParallax?: boolean;
  /** Sort results by physical property (default: 'brightest') */
  sortBy?: GaiaSortField;
  /** Maximum number of stars to return (default: 500, max: 5000) */
  limit?: number;
}

/**
 * Options for performing a sky cone search around celestial coordinates (RA, Dec).
 */
export interface GaiaConeSearchOptions extends GaiaStarFilterOptions {
  /** Central Right Ascension in decimal degrees [0, 360) */
  ra: number;
  /** Central Declination in decimal degrees [-90, +90] */
  dec: number;
  /** Search radius in decimal degrees (provide either `radiusDeg`, `radiusArcmin`, or `radiusArcsec`) */
  radiusDeg?: number;
  /** Search radius in arcminutes (1 deg = 60 arcmin) */
  radiusArcmin?: number;
  /** Search radius in arcseconds (1 deg = 3600 arcsec) */
  radiusArcsec?: number;
}

/**
 * Options for querying stars within a distance volume around the Solar System.
 */
export interface GaiaDistanceSearchOptions extends Omit<GaiaStarFilterOptions, 'maxDistancePc'> {
  /** Maximum distance from the Sun in parsecs (e.g. 25 for stars within 25 pc) */
  maxDistancePc: number;
}
