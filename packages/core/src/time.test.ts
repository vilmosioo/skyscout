import { describe, expect, it } from 'vitest';
import {
  dateToJulianDate,
  dateToMjd,
  JD_J2000,
  JD_MJD_OFFSET,
  julianDateToDate,
  julianDateToMjd,
  MJD_J2000,
  MJD_UNIX_EPOCH,
  mjdToDate,
  mjdToJulianDate,
  MS_PER_DAY,
} from './time';

describe('Astronomical Time Utilities', () => {
  it('converts MJD to Date accurately', () => {
    // MJD 59000.0 is 2020-05-31T00:00:00.000Z
    const date = mjdToDate(59000);
    expect(date.toISOString()).toBe('2020-05-31T00:00:00.000Z');
  });

  it('converts Date to MJD accurately', () => {
    const date = new Date('2020-05-31T00:00:00.000Z');
    const mjd = dateToMjd(date);
    expect(mjd).toBeCloseTo(59000, 5);
  });

  it('handles numeric timestamps for dateToMjd', () => {
    const millis = Date.UTC(2020, 4, 31, 0, 0, 0);
    const mjd = dateToMjd(millis);
    expect(mjd).toBeCloseTo(59000, 5);
  });

  it('converts between JD and MJD', () => {
    const mjd = 60000;
    const jd = mjdToJulianDate(mjd);
    expect(jd).toBe(2460000.5);
    expect(julianDateToMjd(jd)).toBe(mjd);
  });

  it('converts between Date and Julian Date directly', () => {
    const date = new Date('2000-01-01T12:00:00.000Z');
    const jd = dateToJulianDate(date);
    expect(jd).toBeCloseTo(JD_J2000, 4);

    const convertedDate = julianDateToDate(jd);
    expect(convertedDate.toISOString()).toBe('2000-01-01T12:00:00.000Z');
  });

  it('verifies standard astronomical constants', () => {
    expect(MJD_UNIX_EPOCH).toBe(40587);
    expect(MS_PER_DAY).toBe(86400000);
    expect(JD_MJD_OFFSET).toBe(2400000.5);
    expect(JD_J2000 - MJD_J2000).toBe(JD_MJD_OFFSET);
  });
});
