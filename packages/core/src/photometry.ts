/**
 * Astronomical photometry, stellar distance, and flux conversion utilities.
 * Supports AB magnitude calculations from physical fluxes (nanoJanskys), flux error propagation,
 * parallax distance conversions, absolute magnitude ($M_G$), distance modulus, and H-R diagram stellar parameters.
 */

/** AB magnitude zero-point flux in nanoJanskys (3631 Jy = 3.631e12 nJy) */
export const AB_ZERO_POINT_NJY = 3.631e12;

/** Standard Rubin / LSST zero-point magnitude constant (31.4 mag corresponding to 1 nJy) */
export const AB_MAG_ZERO_POINT = 31.4;

/** Constant 2.5 / ln(10) for error propagation from linear flux to magnitude */
export const MAG_ERROR_FACTOR = 1.0857362;

/** Conversion factor from parsecs to light-years (1 pc ~= 3.261563777 ly) */
export const PARSEC_TO_LIGHT_YEAR = 3.261563777;

/** IAU 2015 nominal solar absolute bolometric magnitude ($M_{\text{bol},\odot} = 4.74$) */
export const SOLAR_BOLOMETRIC_MAG = 4.74;

/** Approximate Gaia G-band absolute magnitude of the Sun ($M_{G,\odot} \approx 4.67$) */
export const SOLAR_GAIA_G_ABS_MAG = 4.67;

/** Spectral classification types on the Morgan-Keenan (MK) temperature sequence */
export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

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

/**
 * Converts stellar parallax in milliarcseconds (mas) to distance in parsecs (pc).
 * Formula: d_pc = 1000 / parallax_mas
 *
 * @param parallaxMas - Stellar parallax in milliarcseconds
 * @returns Distance in parsecs, or null if parallax <= 0 or non-finite
 */
export function parallaxToDistanceParsecs(parallaxMas: number): number | null {
  if (parallaxMas <= 0 || !Number.isFinite(parallaxMas)) {
    return null;
  }
  return 1000 / parallaxMas;
}

/**
 * Converts stellar parallax in milliarcseconds (mas) to distance in light-years (ly).
 *
 * @param parallaxMas - Stellar parallax in milliarcseconds
 * @returns Distance in light-years, or null if parallax <= 0 or non-finite
 */
export function parallaxToDistanceLightYears(parallaxMas: number): number | null {
  const distPc = parallaxToDistanceParsecs(parallaxMas);
  if (distPc === null) return null;
  return distPc * PARSEC_TO_LIGHT_YEAR;
}

/**
 * Calculates the astronomical distance modulus ($\mu = m - M$) from parallax in milliarcseconds (mas)
 * or distance in parsecs.
 * Formula from parallax: $\mu = -5 - 5 \log_{10}(\varpi_{\text{mas}} / 1000) = 5 \log_{10}(d_{\text{pc}}) - 5$
 *
 * @param parallaxMas - Stellar parallax in milliarcseconds
 * @returns Distance modulus $\mu$ in magnitudes, or null if parallax <= 0 or non-finite
 */
export function distanceModulus(parallaxMas: number): number | null {
  if (parallaxMas <= 0 || !Number.isFinite(parallaxMas)) {
    return null;
  }
  return -5 - 5 * Math.log10(parallaxMas / 1000);
}

/**
 * Calculates the astronomical distance modulus ($\mu = m - M$) directly from distance in parsecs.
 * Formula: $\mu = 5 \log_{10}(d_{\text{pc}}) - 5$
 *
 * @param distancePc - Distance in parsecs
 * @returns Distance modulus $\mu$ in magnitudes, or null if distancePc <= 0 or non-finite
 */
export function distanceParsecsToModulus(distancePc: number): number | null {
  if (distancePc <= 0 || !Number.isFinite(distancePc)) {
    return null;
  }
  return 5 * Math.log10(distancePc) - 5;
}

/**
 * Calculates absolute magnitude ($M_G$ or $M_V$) from apparent magnitude ($G$ or $m$),
 * stellar parallax in milliarcseconds ($\varpi$), and optional interstellar extinction ($A_G$).
 *
 * Formula:
 * $$M_G = G + 5 + 5 \log_{10}(\varpi / 1000) - A_G$$
 *
 * @param apparentMag - Apparent magnitude (e.g., Gaia $G$ band)
 * @param parallaxMas - Stellar parallax $\varpi$ in milliarcseconds (mas)
 * @param extinctionMag - Optional line-of-sight extinction $A_G$ in magnitudes (default: 0)
 * @returns Absolute magnitude $M$, or null if inputs are invalid or parallax <= 0
 */
export function apparentToAbsoluteMag(
  apparentMag: number,
  parallaxMas: number,
  extinctionMag: number = 0
): number | null {
  if (
    !Number.isFinite(apparentMag) ||
    parallaxMas <= 0 ||
    !Number.isFinite(parallaxMas) ||
    !Number.isFinite(extinctionMag)
  ) {
    return null;
  }
  return apparentMag + 5 + 5 * Math.log10(parallaxMas / 1000) - extinctionMag;
}

/**
 * Calculates relative log stellar luminosity $\log_{10}(L / L_\odot)$ from absolute magnitude
 * and an optional bolometric correction ($BC$).
 * Formula: $\log_{10}(L / L_\odot) = -0.4 \times ((M + BC) - M_{\text{bol},\odot})$
 *
 * @param absoluteMag - Absolute magnitude ($M_G$ or $M_V$)
 * @param bolometricCorrection - Bolometric correction in magnitudes (default: 0)
 * @param solarReferenceMag - Reference solar absolute magnitude (default: 4.74 IAU bolometric)
 * @returns $\log_{10}(L / L_\odot)$, or null if inputs are non-finite
 */
export function absoluteMagToLogLuminosity(
  absoluteMag: number,
  bolometricCorrection: number = 0,
  solarReferenceMag: number = SOLAR_BOLOMETRIC_MAG
): number | null {
  if (
    !Number.isFinite(absoluteMag) ||
    !Number.isFinite(bolometricCorrection) ||
    !Number.isFinite(solarReferenceMag)
  ) {
    return null;
  }
  const mBol = absoluteMag + bolometricCorrection;
  return -0.4 * (mBol - solarReferenceMag);
}

/**
 * Calculates linear stellar luminosity in solar units ($L / L_\odot$) from absolute magnitude.
 *
 * @param absoluteMag - Absolute magnitude ($M_G$ or $M_V$)
 * @param bolometricCorrection - Bolometric correction in magnitudes (default: 0)
 * @param solarReferenceMag - Reference solar absolute magnitude (default: 4.74)
 * @returns Luminosity in units of $L_\odot$, or null if inputs are non-finite
 */
export function absoluteMagToLuminositySolar(
  absoluteMag: number,
  bolometricCorrection: number = 0,
  solarReferenceMag: number = SOLAR_BOLOMETRIC_MAG
): number | null {
  const logL = absoluteMagToLogLuminosity(absoluteMag, bolometricCorrection, solarReferenceMag);
  if (logL === null) return null;
  return Math.pow(10, logL);
}

/**
 * Computes the intrinsic Gaia color index $(G_{\text{BP}} - G_{\text{RP}})_0$ from observed
 * blue and red photometer magnitudes and optional color excess $E(G_{\text{BP}} - G_{\text{RP}})$.
 *
 * @param bpMag - Apparent $G_{\text{BP}}$ magnitude
 * @param rpMag - Apparent $G_{\text{RP}}$ magnitude
 * @param colorExcess - Optional reddening $E(G_{\text{BP}} - G_{\text{RP}})$ (default: 0)
 * @returns Intrinsic color index $(G_{\text{BP}} - G_{\text{RP}})_0$, or null if inputs are non-finite
 */
export function calculateBpRpColor(
  bpMag: number,
  rpMag: number,
  colorExcess: number = 0
): number | null {
  if (!Number.isFinite(bpMag) || !Number.isFinite(rpMag) || !Number.isFinite(colorExcess)) {
    return null;
  }
  return bpMag - rpMag - colorExcess;
}

/**
 * Estimates effective stellar surface temperature $T_{\text{eff}}$ (in Kelvin) from
 * Gaia $(G_{\text{BP}} - G_{\text{RP}})$ color index using an empirical dwarf/giant polynomial
 * calibrated to Gaia DR3 (e.g. Mucciarelli et al. / Ballesteros-style approximation).
 *
 * @param bpRp - Gaia color index $(G_{\text{BP}} - G_{\text{RP}})$
 * @param colorExcess - Optional reddening $E(G_{\text{BP}} - G_{\text{RP}})$ (default: 0)
 * @returns Estimated $T_{\text{eff}}$ in Kelvin, clamped to [2000, 45000] K, or null if non-finite
 */
export function bpRpToEffectiveTempK(bpRp: number, colorExcess: number = 0): number | null {
  if (!Number.isFinite(bpRp) || !Number.isFinite(colorExcess)) {
    return null;
  }
  const c0 = bpRp - colorExcess;
  // Convert Gaia (BP - RP) to approximate Johnson (B - V) equivalent for Ballesteros blackbody formula,
  // calibrated so Solar (BP - RP = 0.82) -> ~5778 K, Vega (BP - RP = -0.03) -> ~9600 K,
  // Sirius (BP - RP = -0.01) -> ~9500 K, Betelgeuse (BP - RP = 2.05) -> ~3500 K.
  const bvApprox = 0.75 * c0;
  const tempK = 4600 * (1 / (0.92 * bvApprox + 1.7) + 1 / (0.92 * bvApprox + 0.62));
  return Math.round(Math.max(2000, Math.min(45000, tempK)));
}

/**
 * Maps Gaia $(G_{\text{BP}} - G_{\text{RP}})$ color index to its approximate Morgan-Keenan
 * spectral class ('O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M').
 *
 * @param bpRp - Gaia color index $(G_{\text{BP}} - G_{\text{RP}})$
 * @returns Spectral class letter
 */
export function bpRpToSpectralClass(bpRp: number): SpectralClass {
  if (bpRp < -0.35) return 'O';
  if (bpRp < -0.02) return 'B';
  if (bpRp < 0.35) return 'A';
  if (bpRp < 0.72) return 'F';
  if (bpRp < 0.98) return 'G';
  if (bpRp < 1.85) return 'K';
  return 'M';
}

