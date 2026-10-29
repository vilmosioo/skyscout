import { describe, expect, it } from 'vitest';
import {
  AB_MAG_ZERO_POINT,
  AB_ZERO_POINT_NJY,
  abMagToFlux,
  absoluteMagToLogLuminosity,
  absoluteMagToLuminositySolar,
  apparentToAbsoluteMag,
  bpRpToEffectiveTempK,
  bpRpToSpectralClass,
  calculateBpRpColor,
  distanceModulus,
  distanceParsecsToModulus,
  fluxErrorToMagError,
  fluxToAbMag,
  MAG_ERROR_FACTOR,
  magErrorToFluxError,
  parallaxToDistanceLightYears,
  parallaxToDistanceParsecs,
  PARSEC_TO_LIGHT_YEAR,
  signalToNoise,
  SOLAR_BOLOMETRIC_MAG,
  SOLAR_GAIA_G_ABS_MAG,
} from './photometry';

describe('Photometry Utilities', () => {
  it('converts PSF flux in nJy to AB magnitude', () => {
    // Zero-point flux: 1 nJy -> m = 31.4
    expect(fluxToAbMag(1)).toBeCloseTo(31.4, 5);

    // 3631 Jy = 3.631e12 nJy -> m = 0
    expect(fluxToAbMag(AB_ZERO_POINT_NJY)).toBeCloseTo(0.0, 1);

    // Typical Rubin transient flux: 10,000 nJy -> ~21.4 mag
    // 31.4 - 2.5 * log10(10000) = 31.4 - 2.5 * 4 = 21.4
    expect(fluxToAbMag(10_000)).toBeCloseTo(21.4, 4);
  });

  it('handles negative, zero, and invalid flux values gracefully', () => {
    expect(fluxToAbMag(0)).toBeNull();
    expect(fluxToAbMag(-500)).toBeNull();
    expect(fluxToAbMag(NaN)).toBeNull();
    expect(fluxToAbMag(Infinity)).toBeNull();
  });

  it('converts AB magnitude to flux in nJy', () => {
    expect(abMagToFlux(31.4)).toBeCloseTo(1, 2);
    expect(abMagToFlux(21.4)).toBeCloseTo(10_000, 0);

    // Roundtrip conversion: flux -> mag -> flux
    const originalFlux = 25_000;
    const mag = fluxToAbMag(originalFlux)!;
    expect(abMagToFlux(mag)).toBeCloseTo(originalFlux, 3);
  });

  it('propagates flux error to magnitude error accurately', () => {
    // For 10% flux error (flux = 1000, fluxErr = 100, SNR = 10):
    // magErr ~= 1.0857362 * (100 / 1000) = 0.10857 mag
    const magErr = fluxErrorToMagError(1000, 100);
    expect(magErr).toBeCloseTo(0.10857, 4);

    // Invalid or negative inputs return null
    expect(fluxErrorToMagError(0, 10)).toBeNull();
    expect(fluxErrorToMagError(-100, 10)).toBeNull();
    expect(fluxErrorToMagError(1000, 0)).toBeNull();
    expect(fluxErrorToMagError(1000, -5)).toBeNull();
    expect(fluxErrorToMagError(NaN, 10)).toBeNull();
  });

  it('propagates magnitude error back to flux error', () => {
    const mag = 21.4;
    const magErr = 0.10857362;
    const fluxErr = magErrorToFluxError(mag, magErr);
    // Flux is 10,000 nJy, 10% error should be 1,000 nJy
    expect(fluxErr).toBeCloseTo(1000, 0);

    // Roundtrip: flux & fluxErr -> mag & magErr -> fluxErr
    const initialFlux = 50_000;
    const initialFluxErr = 2_500;
    const m = fluxToAbMag(initialFlux)!;
    const mErr = fluxErrorToMagError(initialFlux, initialFluxErr)!;
    const reconstructedFluxErr = magErrorToFluxError(m, mErr)!;
    expect(reconstructedFluxErr).toBeCloseTo(initialFluxErr, 1);
  });

  it('calculates signal-to-noise ratio', () => {
    expect(signalToNoise(1000, 50)).toBe(20);
    expect(signalToNoise(500, 0)).toBeNull();
    expect(signalToNoise(500, -10)).toBeNull();
    expect(signalToNoise(NaN, 10)).toBeNull();
  });

  it('verifies constant definitions', () => {
    expect(AB_MAG_ZERO_POINT).toBe(31.4);
    expect(MAG_ERROR_FACTOR).toBeCloseTo(2.5 / Math.log(10), 6);
    expect(SOLAR_BOLOMETRIC_MAG).toBe(4.74);
    expect(SOLAR_GAIA_G_ABS_MAG).toBe(4.67);
  });

  describe('H-R Diagram Stellar Distance & Absolute Magnitude Math', () => {
    it('converts parallax in mas to distance in parsecs and light-years', () => {
      // 100 mas = 10 pc
      expect(parallaxToDistanceParsecs(100)).toBeCloseTo(10, 5);
      expect(parallaxToDistanceLightYears(100)).toBeCloseTo(10 * PARSEC_TO_LIGHT_YEAR, 5);

      // Proxima Centauri (~768.07 mas -> ~1.3019 pc / ~4.246 ly)
      expect(parallaxToDistanceParsecs(768.07)).toBeCloseTo(1.30196, 4);
      expect(parallaxToDistanceLightYears(768.07)).toBeCloseTo(4.246, 2);

      // Invalid or negative parallax returns null
      expect(parallaxToDistanceParsecs(0)).toBeNull();
      expect(parallaxToDistanceParsecs(-5.2)).toBeNull();
      expect(parallaxToDistanceParsecs(NaN)).toBeNull();
      expect(parallaxToDistanceLightYears(0)).toBeNull();
    });

    it('calculates distance modulus from parallax and parsecs', () => {
      // At d = 10 pc (parallax = 100 mas), distance modulus mu = 0
      expect(distanceModulus(100)).toBeCloseTo(0, 6);
      expect(distanceParsecsToModulus(10)).toBeCloseTo(0, 6);

      // At d = 100 pc (parallax = 10 mas), distance modulus mu = 5
      expect(distanceModulus(10)).toBeCloseTo(5, 6);
      expect(distanceParsecsToModulus(100)).toBeCloseTo(5, 6);

      // Pleiades cluster (~7.35 mas -> d ~= 136 pc -> mu ~= 5.668 mag)
      expect(distanceModulus(7.35)).toBeCloseTo(5.668, 2);

      // Invalid inputs
      expect(distanceModulus(0)).toBeNull();
      expect(distanceModulus(-1)).toBeNull();
      expect(distanceParsecsToModulus(0)).toBeNull();
      expect(distanceParsecsToModulus(-10)).toBeNull();
    });

    it('calculates absolute magnitude M_G from apparent magnitude G, parallax, and extinction', () => {
      // At 10 pc (parallax = 100 mas), M_G === G (when extinction = 0)
      expect(apparentToAbsoluteMag(4.67, 100)).toBeCloseTo(4.67, 5);

      // At 100 pc (parallax = 10 mas), M_G = G - 5
      expect(apparentToAbsoluteMag(9.67, 10)).toBeCloseTo(4.67, 5);

      // With extinction A_G = 0.25 mag
      expect(apparentToAbsoluteMag(9.92, 10, 0.25)).toBeCloseTo(4.67, 5);

      // Sirius A: G ~= -1.46, parallax ~= 379.21 mas -> M_G ~= +1.43
      expect(apparentToAbsoluteMag(-1.46, 379.21)).toBeCloseTo(1.43, 1);

      // Invalid inputs return null
      expect(apparentToAbsoluteMag(10, 0)).toBeNull();
      expect(apparentToAbsoluteMag(10, -2)).toBeNull();
      expect(apparentToAbsoluteMag(NaN, 50)).toBeNull();
      expect(apparentToAbsoluteMag(10, 50, NaN)).toBeNull();
    });

    it('calculates stellar luminosity log(L/L_sun) and linear L/L_sun', () => {
      // Solar reference: M_bol = 4.74 -> log(L/L_sun) = 0, L/L_sun = 1
      expect(absoluteMagToLogLuminosity(4.74)).toBeCloseTo(0, 6);
      expect(absoluteMagToLuminositySolar(4.74)).toBeCloseTo(1, 6);

      // 5 magnitudes brighter than Sun (M = -0.26) -> 100x solar luminosity (log L = 2)
      expect(absoluteMagToLogLuminosity(-0.26)).toBeCloseTo(2, 5);
      expect(absoluteMagToLuminositySolar(-0.26)).toBeCloseTo(100, 3);

      // 5 magnitudes fainter than Sun (M = 9.74) -> 0.01x solar luminosity (log L = -2)
      expect(absoluteMagToLogLuminosity(9.74)).toBeCloseTo(-2, 5);
      expect(absoluteMagToLuminositySolar(9.74)).toBeCloseTo(0.01, 5);

      // Invalid inputs
      expect(absoluteMagToLogLuminosity(NaN)).toBeNull();
      expect(absoluteMagToLuminositySolar(Infinity)).toBeNull();
    });

    it('computes intrinsic Gaia (BP - RP) color, effective temperature, and spectral class', () => {
      expect(calculateBpRpColor(5.5, 4.7)).toBeCloseTo(0.8, 5);
      expect(calculateBpRpColor(5.5, 4.7, 0.1)).toBeCloseTo(0.7, 5);
      expect(calculateBpRpColor(NaN, 4.7)).toBeNull();

      // Solar-like star: BP - RP ~= 0.82 -> G-type, ~5700-5900 K
      const sunTemp = bpRpToEffectiveTempK(0.82)!;
      expect(sunTemp).toBeGreaterThan(5500);
      expect(sunTemp).toBeLessThan(6100);
      expect(bpRpToSpectralClass(0.82)).toBe('G');

      // Vega / Sirius A: BP - RP ~= -0.01 -> B/A boundary, ~9500-10000 K
      const vegaTemp = bpRpToEffectiveTempK(0.0)!;
      expect(vegaTemp).toBeGreaterThan(9000);
      expect(vegaTemp).toBeLessThan(10500);
      expect(bpRpToSpectralClass(0.05)).toBe('A');

      // Red M-dwarf / Red supergiant: BP - RP = 2.2 -> M-type, < 4000 K
      const mTemp = bpRpToEffectiveTempK(2.2)!;
      expect(mTemp).toBeLessThan(4000);
      expect(bpRpToSpectralClass(2.2)).toBe('M');

      // Spectral class sequence coverage
      expect(bpRpToSpectralClass(-0.45)).toBe('O');
      expect(bpRpToSpectralClass(-0.15)).toBe('B');
      expect(bpRpToSpectralClass(0.15)).toBe('A');
      expect(bpRpToSpectralClass(0.55)).toBe('F');
      expect(bpRpToSpectralClass(0.82)).toBe('G');
      expect(bpRpToSpectralClass(1.25)).toBe('K');
      expect(bpRpToSpectralClass(2.5)).toBe('M');

      expect(bpRpToEffectiveTempK(NaN)).toBeNull();
    });
  });
});

