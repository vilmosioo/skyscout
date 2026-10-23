/**
 * Astronomical photometry and flux conversion utilities.
 * Supports AB magnitude calculations from physical fluxes (nanoJanskys) and flux error propagation.
 */

/** AB magnitude zero-point flux in nanoJanskys (3631 Jy = 3.631e12 nJy) */
export const AB_ZERO_POINT_NJY = 3.631e12;

/** Standard Rubin / LSST zero-point magnitude constant (31.4 mag corresponding to 1 nJy) */
export const AB_MAG_ZERO_POINT = 31.4;

/** Constant 2.5 / ln(10) for error propagation from linear flux to magnitude */
export const MAG_ERROR_FACTOR = 1.0857362;

/**
 * Converts Point Spread Function (PSF) flux in nanoJanskys (nJy) to standard AB magnitude.
 * Formula: m_AB = 31.4 - 2.5 * log10(flux_nJy)
 *
 * @param fluxNjy - Flux in nanoJanskys
 * @returns AB magnitude, or null if flux is zero, negative, or non-finite (non-detection)
 */
export function fluxToAbMag(fluxNjy: number): number | null {
  if (fluxNjy <= 0 || !Number.isFinite(fluxNjy)) return null;
  return AB_MAG_ZERO_POINT - 2.5 * Math.log10(fluxNjy);
}

/**
 * Converts standard AB magnitude to PSF flux in nanoJanskys (nJy).
 * Formula: flux_nJy = 10^((31.4 - m_AB) / 2.5)
 *
 * @param abMag - AB magnitude
 * @returns Flux in nanoJanskys (nJy)
 */
export function abMagToFlux(abMag: number): number {
  return Math.pow(10, (AB_MAG_ZERO_POINT - abMag) / 2.5);
}

/**
 * Propagates symmetric linear flux error (fluxErr) to magnitude error (magErr).
 * Uses first-order Taylor expansion: sigma_m = (2.5 / ln 10) * (sigma_f / f) ~= 1.0857 * (sigma_f / f)
 *
 * @param flux - Measured flux
 * @param fluxErr - Uncertainty on measured flux (1-sigma)
 * @returns Magnitude uncertainty, or null if flux <= 0, fluxErr <= 0, or non-finite
 */
export function fluxErrorToMagError(flux: number, fluxErr: number): number | null {
  if (flux <= 0 || fluxErr <= 0 || !Number.isFinite(flux) || !Number.isFinite(fluxErr)) {
    return null;
  }
  return MAG_ERROR_FACTOR * (fluxErr / flux);
}

/**
 * Propagates magnitude error (magErr) to symmetric linear flux error (fluxErr) in nanoJanskys.
 * Inversion of Taylor expansion: sigma_f = f * (sigma_m / 1.0857362)
 *
 * @param abMag - Measured AB magnitude
 * @param magErr - Uncertainty on AB magnitude (1-sigma)
 * @returns Linear flux uncertainty in nanoJanskys, or null if magErr <= 0 or non-finite
 */
export function magErrorToFluxError(abMag: number, magErr: number): number | null {
  if (magErr <= 0 || !Number.isFinite(magErr) || !Number.isFinite(abMag)) {
    return null;
  }
  const flux = abMagToFlux(abMag);
  return flux * (magErr / MAG_ERROR_FACTOR);
}

/**
 * Calculates the signal-to-noise ratio (SNR) for a flux measurement.
 * SNR = flux / fluxErr
 *
 * @param flux - Measured flux
 * @param fluxErr - Flux uncertainty
 * @returns Signal-to-noise ratio, or null if fluxErr <= 0 or inputs are non-finite
 */
export function signalToNoise(flux: number, fluxErr: number): number | null {
  if (fluxErr <= 0 || !Number.isFinite(flux) || !Number.isFinite(fluxErr)) {
    return null;
  }
  return flux / fluxErr;
}
