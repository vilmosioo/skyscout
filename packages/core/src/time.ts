/**
 * Astronomical time conversion utilities.
 * Handles Modified Julian Date (MJD), Julian Date (JD), and standard JavaScript Date conversions.
 */

/** MJD offset for Unix epoch (1970-01-01T00:00:00Z) */
export const MJD_UNIX_EPOCH = 40587;

/** Milliseconds in one standard Julian day (86,400 seconds) */
export const MS_PER_DAY = 86_400_000;

/** Difference between Julian Date (JD) and Modified Julian Date (MJD): JD = MJD + 2400000.5 */
export const JD_MJD_OFFSET = 2400000.5;

/** Standard astronomical epoch J2000.0 in Modified Julian Date (2000-01-01 12:00:00 TT) */
export const MJD_J2000 = 51544.5;

/** Standard astronomical epoch J2000.0 in Julian Date */
export const JD_J2000 = 2451545.0;

/**
 * Converts Modified Julian Date (MJD) to a standard JavaScript Date object.
 *
 * @param mjd - Modified Julian Date in decimal days (e.g. 60456.28)
 * @returns Date object in UTC
 */
export function mjdToDate(mjd: number): Date {
  const millis = (mjd - MJD_UNIX_EPOCH) * MS_PER_DAY;
  return new Date(millis);
}

/**
 * Converts a JavaScript Date object (or Unix timestamp in milliseconds) to Modified Julian Date (MJD).
 *
 * @param date - Date object or timestamp in milliseconds
 * @returns Modified Julian Date in decimal days
 */
export function dateToMjd(date: Date | number): number {
  const millis = typeof date === 'number' ? date : date.getTime();
  return millis / MS_PER_DAY + MJD_UNIX_EPOCH;
}

/**
 * Converts Julian Date (JD) to Modified Julian Date (MJD).
 * Formula: MJD = JD - 2400000.5
 *
 * @param jd - Julian Date in decimal days
 * @returns Modified Julian Date in decimal days
 */
export function julianDateToMjd(jd: number): number {
  return jd - JD_MJD_OFFSET;
}

/**
 * Converts Modified Julian Date (MJD) to Julian Date (JD).
 * Formula: JD = MJD + 2400000.5
 *
 * @param mjd - Modified Julian Date in decimal days
 * @returns Julian Date in decimal days
 */
export function mjdToJulianDate(mjd: number): number {
  return mjd + JD_MJD_OFFSET;
}

/**
 * Converts a JavaScript Date object (or Unix timestamp in milliseconds) directly to Julian Date (JD).
 *
 * @param date - Date object or timestamp in milliseconds
 * @returns Julian Date in decimal days
 */
export function dateToJulianDate(date: Date | number): number {
  return mjdToJulianDate(dateToMjd(date));
}

/**
 * Converts Julian Date (JD) directly to a standard JavaScript Date object.
 *
 * @param jd - Julian Date in decimal days
 * @returns Date object in UTC
 */
export function julianDateToDate(jd: number): Date {
  return mjdToDate(julianDateToMjd(jd));
}
