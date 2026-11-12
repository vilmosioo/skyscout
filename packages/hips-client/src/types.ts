/**
 * Well-known astronomical HiPS surveys available through CDS and partner archives.
 */
export type HipsSurveyId =
  | 'CDS/P/DSS2/color'
  | 'CDS/P/DSS2/red'
  | 'CDS/P/DSS2/blue'
  | 'CDS/P/2MASS/color'
  | 'CDS/P/PanSTARRS/DR1/color-z-zg-g'
  | 'CDS/P/unWISE/color-W1-W2'
  | 'CDS/P/SDSS9/color'
  | 'CDS/P/Gaia/DR3/flux-mean-G'
  | (string & {});

/**
 * Spherical map projections supported by IVOA hips2fits.
 */
export type HipsProjection = 'TAN' | 'STG' | 'CAR' | 'SIN' | 'AIT';

/**
 * Coordinate reference frames.
 */
export type HipsCoordinateSystem = 'icrs' | 'galactic';

/**
 * Output image formats.
 */
export type HipsImageFormat = 'jpg' | 'png' | 'fits';

/**
 * Options for generating a HiPS image cutout.
 */
export interface HipsCutoutOptions {
  /**
   * HiPS survey identifier (e.g. 'CDS/P/DSS2/color', 'CDS/P/2MASS/color').
   * Defaults to 'CDS/P/DSS2/color'.
   */
  hips?: HipsSurveyId;

  /**
   * Target Right Ascension in degrees (J2000 / ICRS).
   */
  ra: number;

  /**
   * Target Declination in degrees (J2000 / ICRS).
   */
  dec: number;

  /**
   * Angular field of view in degrees (e.g. 1.0 for 1° × 1°).
   * Defaults to 0.5° (30 arcminutes).
   */
  fovDeg?: number;

  /**
   * Output width in pixels.
   * Defaults to 600.
   */
  width?: number;

  /**
   * Output height in pixels.
   * Defaults to 600.
   */
  height?: number;

  /**
   * Map projection (TAN = gnomonic/tangent, STG = stereographic, CAR = Cartesian, SIN = orthographic).
   * Defaults to 'TAN'.
   */
  projection?: HipsProjection;

  /**
   * Coordinate system ('icrs' or 'galactic').
   * Defaults to 'icrs'.
   */
  coordsys?: HipsCoordinateSystem;

  /**
   * Image rotation angle in degrees (counter-clockwise from North).
   * Defaults to 0.
   */
  rotationAngleDeg?: number;

  /**
   * Output file format ('jpg', 'png', or 'fits').
   * Defaults to 'jpg'.
   */
  format?: HipsImageFormat;

  /**
   * Per-request timeout in milliseconds.
   */
  timeoutMs?: number;
}

/**
 * Configuration for the HipsClient.
 */
export interface HipsClientConfig {
  /**
   * Base hips2fits endpoint URL.
   * Defaults to 'https://alasky.cds.unistra.fr/hips-image-services/hips2fits'.
   */
  endpoint?: string;

  /**
   * Default timeout in milliseconds (defaults to 30,000ms).
   */
  timeoutMs?: number;

  /**
   * Custom fetch function.
   */
  fetch?: typeof fetch;
}
