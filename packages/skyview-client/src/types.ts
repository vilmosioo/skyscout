/**
 * Standard NASA SkyView surveys across Optical, Infrared, Ultraviolet, X-Ray, and Radio bands.
 */
export type SkyviewSurvey =
  | '2MASS-J'
  | '2MASS-H'
  | '2MASS-K'
  | '2MASS Color'
  | 'DSS'
  | 'DSS2 Color'
  | 'DSS2 Red'
  | 'DSS2 Blue'
  | 'WISE 3.4'
  | 'WISE 4.6'
  | 'WISE 12'
  | 'WISE 22'
  | 'AllWISE Color'
  | 'GALEX Near UV'
  | 'GALEX Far UV'
  | 'SDSSg'
  | 'SDSSr'
  | 'SDSSi'
  | 'SDSSz'
  | 'SDSSu'
  | 'ROSAT WFI'
  | 'Fermi 5'
  | (string & {});

/**
 * SkyView map projections.
 */
export type SkyviewProjection = 'Tan' | 'Car' | 'Sin' | 'Aitoff' | 'Arc' | 'Zea';

/**
 * Image intensity scaling function.
 */
export type SkyviewScaling = 'Log' | 'Linear' | 'HistEq' | 'Sqrt';

/**
 * False-color lookup table for single-band surveys.
 */
export type SkyviewLut = 'Heat' | 'Rainbow' | 'Greyscale' | 'Invert' | 'Standard';

/**
 * Celestial coordinates specified either as `{ ra, dec }` in degrees or as a string.
 */
export type SkyviewPosition =
  | { ra: number; dec: number }
  | string;

/**
 * Options for generating a NASA SkyView image cutout.
 */
export interface SkyviewCutoutOptions {
  /**
   * Target position as `{ ra, dec }` (degrees) or string (e.g. "56.75, 24.12" or "M45").
   */
  position: SkyviewPosition;

  /**
   * SkyView astronomical survey (e.g. 'DSS2 Color', '2MASS Color', 'AllWISE Color').
   * Defaults to 'DSS2 Color'.
   */
  survey?: SkyviewSurvey | SkyviewSurvey[];

  /**
   * Angular field of view size in degrees.
   * Defaults to 0.5° (30 arcminutes).
   */
  sizeDeg?: number;

  /**
   * Output image pixel dimensions (square: pixels × pixels).
   * Defaults to 500.
   */
  pixels?: number;

  /**
   * Map projection. Defaults to 'Tan' (gnomonic/tangent).
   */
  projection?: SkyviewProjection;

  /**
   * Intensity scaling function (Log, Linear, HistEq, Sqrt).
   * Defaults to 'Linear' for color composite surveys, 'Log' for single-band.
   */
  scaling?: SkyviewScaling;

  /**
   * False color lookup table (Heat, Rainbow, Greyscale, Invert).
   */
  lut?: SkyviewLut;

  /**
   * Coordinate system (e.g. 'J2000', 'B1950', 'Galactic').
   * Defaults to 'J2000'.
   */
  coordinates?: string;

  /**
   * Per-request timeout in milliseconds.
   */
  timeoutMs?: number;
}

/**
 * Configuration options for the NASA SkyviewClient.
 */
export interface SkyviewClientConfig {
  /**
   * Base endpoint for NASA SkyView.
   * Defaults to 'https://skyview.gsfc.nasa.gov'.
   */
  baseUrl?: string;

  /**
   * Default timeout in milliseconds.
   * Defaults to 30,000ms (30s).
   */
  timeoutMs?: number;

  /**
   * Custom fetch implementation (defaults to global `fetch`).
   */
  fetch?: typeof fetch;
}
