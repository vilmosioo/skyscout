/**
 * Configuration options for initializing the `NasaClient`.
 * All endpoints, timeouts, and retry policies are explicitly injectable.
 */
export interface NasaClientConfig {
  /**
   * NASA IPAC/IRSA TAP endpoint URL for 2MASS and AllWISE queries.
   * Defaults to standard production endpoint: `https://irsa.ipac.caltech.edu/TAP`
   */
  ipacTapEndpoint?: string;

  /**
   * STScI MAST TAP endpoint URL for TESS Input Catalog (TIC) and Hubble queries.
   * Defaults to standard production endpoint: `https://mast.stsci.edu/api/v0/tap`
   */
  mastTapEndpoint?: string;

  /**
   * Timeout in milliseconds for each HTTP request before aborting.
   * Defaults to 45,000 ms (45 seconds).
   */
  timeoutMs?: number;

  /**
   * Number of automatic retries on transient network failures or 5xx server errors.
   * Defaults to 2 retries.
   */
  retries?: number;

  /**
   * Base delay in milliseconds before exponential backoff retry attempts.
   * Defaults to 1,000 ms.
   */
  retryDelayMs?: number;

  /**
   * Optional custom `fetch` implementation for testing or polyfilling.
   */
  fetch?: typeof fetch;
}

/**
 * Standard celestial cone search parameters.
 */
export interface NasaConeSearchOptions {
  /** Right Ascension in decimal degrees (J2000 / ICRS: [0, 360]) */
  ra: number;
  /** Declination in decimal degrees (J2000 / ICRS: [-90, +90]) */
  dec: number;
  /** Cone search radius in decimal degrees (e.g. 0.5 for 30 arcminutes) */
  radiusDeg: number;
  /** Maximum number of records to return (defaults to 1000) */
  limit?: number;
  /** Optional minimum K-band or T-band brightness constraint */
  maxMag?: number;
}

/**
 * An infrared point source from the NASA 2MASS All-Sky Point Source Catalog (`fp_psc`).
 * Ideal for near-infrared Color–Magnitude Diagrams ($J - K_s$ vs $K_s$) that penetrate interstellar dust.
 */
export interface TwoMassStar {
  /** 2MASS source designation (e.g. `03472911+2406184`) */
  designation: string;
  /** Right Ascension in decimal degrees (J2000) */
  ra: number;
  /** Declination in decimal degrees (J2000) */
  dec: number;
  /** 2MASS J-band apparent magnitude (1.25 µm) */
  jMag: number | null;
  /** 2MASS H-band apparent magnitude (1.65 µm) */
  hMag: number | null;
  /** 2MASS Ks-band apparent magnitude (2.17 µm) */
  kMag: number | null;
  /** Near-infrared color index: $J - K_s$ (key axis for infrared H–R / CMD diagrams) */
  jMinusK: number | null;
  /** Total photometric uncertainty in J-band */
  jError: number | null;
  /** Total photometric uncertainty in H-band */
  hError: number | null;
  /** Total photometric uncertainty in Ks-band */
  kError: number | null;
  /** Photometric quality flags for J, H, Ks (e.g. `AAA`, `EAA`) */
  qualityFlag: string;
  /** Estimated distance in parsecs if computed or cross-matched */
  distancePcApprox?: number | null;
}

/**
 * A star from the NASA / STScI TESS Input Catalog (TIC v8.2).
 * Contains directly calibrated stellar physical properties (Teff, radius, mass, luminosity).
 */
export interface TicStar {
  /** TESS Input Catalog ID (numeric string) */
  ticId: string;
  /** Right Ascension in decimal degrees (ICRS) */
  ra: number;
  /** Declination in decimal degrees (ICRS) */
  dec: number;
  /** TESS optical magnitude */
  tessMag: number | null;
  /** Cross-matched Gaia DR2/DR3 source ID */
  gaiaSourceId: string | null;
  /** Trigonometric parallax in milliarcseconds (mas) */
  parallax: number | null;
  /** Parallax error in milliarcseconds (mas) */
  parallaxError: number | null;
  /** Distance in parsecs derived from parallax or Gaia geometric priors */
  distancePc: number | null;
  /** Stellar effective temperature in Kelvin */
  teffK: number | null;
  /** Stellar radius in Solar units ($R / R_\odot$) */
  radiusSolar: number | null;
  /** Stellar mass in Solar units ($M / M_\odot$) */
  massSolar: number | null;
  /** Stellar luminosity in Solar units ($L / L_\odot$) */
  luminositySolar: number | null;
  /** Johnson B magnitude */
  bMag: number | null;
  /** Johnson V magnitude */
  vMag: number | null;
  /** Optical color index $B - V$ */
  bMinusV: number | null;
  /** Spectral class estimate (e.g. `G2V`, `K5`) */
  spectralType?: string | null;
}

/**
 * Raw TAP response structure (standard IVOA TAP JSON schema).
 */
export interface TapJsonTabularResponse {
  metadata?: Array<{ name: string; datatype?: string }>;
  data?: unknown[][];
}
