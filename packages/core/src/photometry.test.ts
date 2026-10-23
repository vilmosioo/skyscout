import { describe, expect, it } from 'vitest';
import {
  AB_MAG_ZERO_POINT,
  AB_ZERO_POINT_NJY,
  abMagToFlux,
  fluxErrorToMagError,
  fluxToAbMag,
  MAG_ERROR_FACTOR,
  magErrorToFluxError,
  signalToNoise,
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
  });
});
