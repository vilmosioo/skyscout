import { describe, expect, it } from 'vitest';
import {
  angularSeparation,
  angularSeparationArcsec,
  clampDec,
  degreesToDms,
  degreesToHms,
  dmsToDegrees,
  formatCoordinates,
  formatDms,
  formatHms,
  hmsToDegrees,
  normalizeRa,
  parseSexagesimalDec,
  parseSexagesimalRa,
} from './coordinates';

describe('Coordinates Utilities', () => {
  describe('RA and Dec normalization and formatting', () => {
    it('normalizes RA to [0, 360) degrees', () => {
      expect(normalizeRa(0)).toBe(0);
      expect(normalizeRa(360)).toBe(0);
      expect(normalizeRa(370)).toBe(10);
      expect(normalizeRa(-10)).toBe(350);
      expect(normalizeRa(720)).toBe(0);
    });

    it('clamps Dec to [-90, +90] degrees', () => {
      expect(clampDec(45)).toBe(45);
      expect(clampDec(100)).toBe(90);
      expect(clampDec(-110)).toBe(-90);
    });

    it('formats coordinates to signed decimal degrees', () => {
      const { raStr, decStr } = formatCoordinates(52.82384, -29.69162, 3);
      expect(raStr).toBe('52.824');
      expect(decStr).toBe('-29.692');

      const pos = formatCoordinates(10.123, 15.456, 2);
      expect(pos.raStr).toBe('10.12');
      expect(pos.decStr).toBe('+15.46');

      const zero = formatCoordinates(0, 0, 4);
      expect(zero.raStr).toBe('0.0000');
      expect(zero.decStr).toBe('+0.0000');
    });
  });

  describe('Sexagesimal HMS conversions (Right Ascension)', () => {
    it('converts degrees to HMS and back', () => {
      // 0 deg = 0h 0m 0s
      expect(degreesToHms(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });

      // 180 deg = 12h 0m 0s
      expect(degreesToHms(180)).toEqual({ hours: 12, minutes: 0, seconds: 0 });

      // 15 deg = 1h 0m 0s
      expect(degreesToHms(15)).toEqual({ hours: 1, minutes: 0, seconds: 0 });

      // 15.25 deg = 1h 1m 0s (0.25 deg = 1 min)
      const hms = degreesToHms(15.25);
      expect(hms.hours).toBe(1);
      expect(hms.minutes).toBe(1);
      expect(hms.seconds).toBeCloseTo(0, 5);

      // Roundtrip test
      const originalDeg = 142.5328;
      const converted = degreesToHms(originalDeg);
      expect(hmsToDegrees(converted)).toBeCloseTo(originalDeg, 8);
      expect(hmsToDegrees(converted.hours, converted.minutes, converted.seconds)).toBeCloseTo(originalDeg, 8);
    });

    it('formats HMS strings properly', () => {
      // 180 deg = 12h 00m 00.00s
      expect(formatHms(180, 2, 'colon')).toBe('12:00:00.00');
      expect(formatHms(180, 2, 'units')).toBe('12h 00m 00.00s');

      // Check rollover prevention
      // A fraction that rounds up seconds to 60.00
      const degNearMinute = 15 * (1 + 29 / 60 + 59.999 / 3600);
      expect(formatHms(degNearMinute, 2)).toBe('01:30:00.00');
    });

    it('parses sexagesimal RA strings correctly', () => {
      expect(parseSexagesimalRa('12:00:00')).toBe(180);
      expect(parseSexagesimalRa('12h 00m 00s')).toBe(180);
      expect(parseSexagesimalRa('01:01:00')).toBeCloseTo(15.25, 4);
      expect(parseSexagesimalRa('01 01 00')).toBeCloseTo(15.25, 4);

      expect(() => parseSexagesimalRa('25:00:00')).toThrow();
      expect(() => parseSexagesimalRa('invalid')).toThrow();
    });
  });

  describe('Sexagesimal DMS conversions (Declination)', () => {
    it('converts degrees to DMS and back', () => {
      expect(degreesToDms(0)).toEqual({ sign: '+', degrees: 0, minutes: 0, seconds: 0 });
      expect(degreesToDms(45)).toEqual({ sign: '+', degrees: 45, minutes: 0, seconds: 0 });
      expect(degreesToDms(-45)).toEqual({ sign: '-', degrees: 45, minutes: 0, seconds: 0 });

      // Crucial edge case: negative dec between 0 and -1 degree
      const negSmall = degreesToDms(-0.5);
      expect(negSmall.sign).toBe('-');
      expect(negSmall.degrees).toBe(0);
      expect(negSmall.minutes).toBe(30);
      expect(negSmall.seconds).toBeCloseTo(0, 5);

      expect(dmsToDegrees(negSmall)).toBeCloseTo(-0.5, 8);
      expect(dmsToDegrees(0, 30, 0, '-')).toBeCloseTo(-0.5, 8);

      // Roundtrip test
      const originalDec = -29.69162;
      const dms = degreesToDms(originalDec);
      expect(dmsToDegrees(dms)).toBeCloseTo(originalDec, 8);
    });

    it('formats DMS strings properly', () => {
      expect(formatDms(45.5, 2, 'colon')).toBe('+45:30:00.00');
      expect(formatDms(-45.5, 2, 'colon')).toBe('-45:30:00.00');
      expect(formatDms(-0.25, 2, 'units')).toBe('-00d 15m 00.00s');

      // Check rollover
      const decNearDeg = 44 + 59 / 60 + 59.999 / 3600;
      expect(formatDms(decNearDeg, 2)).toBe('+45:00:00.00');
    });

    it('parses sexagesimal Dec strings correctly', () => {
      expect(parseSexagesimalDec('+45:30:00')).toBe(45.5);
      expect(parseSexagesimalDec('-45:30:00')).toBe(-45.5);
      expect(parseSexagesimalDec('+45° 30\' 00"')).toBe(45.5);
      expect(parseSexagesimalDec('-00d 30m 00s')).toBe(-0.5);
      expect(parseSexagesimalDec('-00 30 00')).toBe(-0.5);

      expect(() => parseSexagesimalDec('+95:00:00')).toThrow();
      expect(() => parseSexagesimalDec('invalid')).toThrow();
    });
  });

  describe('Angular Separation (Vincenty Formula)', () => {
    it('calculates 0 separation for identical positions', () => {
      expect(angularSeparation(100, 25, 100, 25)).toBeCloseTo(0, 10);
      expect(angularSeparationArcsec(100, 25, 100, 25)).toBeCloseTo(0, 10);
    });

    it('calculates 90 degrees separation on the celestial equator', () => {
      expect(angularSeparation(0, 0, 90, 0)).toBeCloseTo(90, 8);
    });

    it('calculates 180 degrees separation for antipodal points', () => {
      expect(angularSeparation(0, 0, 180, 0)).toBeCloseTo(180, 8);
      expect(angularSeparation(0, 90, 0, -90)).toBeCloseTo(180, 8);
    });

    it('calculates 1 degree / 3600 arcseconds along declination', () => {
      const sep = angularSeparation(45, 10, 45, 11);
      expect(sep).toBeCloseTo(1.0, 8);
      expect(angularSeparationArcsec(45, 10, 45, 11)).toBeCloseTo(3600, 6);
    });

    it('calculates small arcsecond separation accurately without floating point breakdown', () => {
      // 1 arcsecond separation in Dec: 1 / 3600 = 0.0002777777777777778 deg
      const oneArcsecDeg = 1 / 3600;
      const sepArcsec = angularSeparationArcsec(0, 0, 0, oneArcsecDeg);
      expect(sepArcsec).toBeCloseTo(1.0, 6);
    });
  });
});
