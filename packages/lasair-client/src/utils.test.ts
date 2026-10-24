import { describe, expect, it } from 'vitest';
import {
  dateToMjd,
  fluxToAbMag,
  formatCoordinates,
  getLasairCutoutUrl,
  getLasairObjectUrl,
  getLasairSourceUrl,
  mjdToDate,
} from './utils';

describe('Astro Utilities', () => {
  it('formats coordinates correctly', () => {
    const formatted = formatCoordinates(52.82384, -29.69162, 3);
    expect(formatted.raStr).toBe('52.824');
    expect(formatted.decStr).toBe('-29.692');

    const positiveDec = formatCoordinates(10.123, 15.456, 2);
    expect(positiveDec.decStr).toBe('+15.46');
  });

  it('generates correct Lasair web links', () => {
    expect(getLasairObjectUrl('170019695992242795')).toBe(
      'https://lasair.lsst.ac.uk/object/170019695992242795/'
    );
  });

  it('generates correct Lasair source detection links', () => {
    expect(getLasairSourceUrl('220019695992242899')).toBe(
      'https://lasair.lsst.ac.uk/source/220019695992242899/'
    );
  });

  it('generates correct Lasair FITS cutout links for triplets', () => {
    expect(getLasairCutoutUrl('220019695992242899', 'Difference')).toBe(
      'https://lasair.lsst.ac.uk/fits/220019695992242899_cutoutDifference'
    );
    expect(getLasairCutoutUrl('220019695992242899', 'Template')).toBe(
      'https://lasair.lsst.ac.uk/fits/220019695992242899_cutoutTemplate'
    );
    expect(getLasairCutoutUrl('220019695992242899', 'Science')).toBe(
      'https://lasair.lsst.ac.uk/fits/220019695992242899_cutoutScience'
    );
    // Defaults to Difference cutout
    expect(getLasairCutoutUrl('220019695992242899')).toBe(
      'https://lasair.lsst.ac.uk/fits/220019695992242899_cutoutDifference'
    );
  });

  it('converts MJD to Date and back', () => {
    // MJD 59000 is 2020-05-31
    const date = mjdToDate(59000);
    expect(date.getUTCFullYear()).toBe(2020);
    expect(date.getUTCMonth()).toBe(4); // 0-indexed May

    const mjd = dateToMjd(date);
    expect(Math.abs(mjd - 59000)).toBeLessThan(0.0001);
  });

  it('converts PSF flux in nJy to AB magnitude', () => {
    // 3631 * 10^9 nJy is 0 AB mag
    const zeroMag = fluxToAbMag(3631e9);
    expect(zeroMag).toBeCloseTo(0.0, 2);

    // Negative or zero flux returns null
    expect(fluxToAbMag(0)).toBeNull();
    expect(fluxToAbMag(-10)).toBeNull();
  });
});
