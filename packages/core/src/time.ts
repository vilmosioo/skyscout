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

/**
 * Formatted astronomical observation time information.
 */
export interface FormattedObservationDate {
  /** UTC Calendar date in ISO format (YYYY-MM-DD) */
  dateUtc: string;
  /** UTC Time in HH:mm:ss format */
  timeUtc: string;
  /** Combined human-readable UTC string, e.g. "2024-05-15 06:48 UTC" */
  fullUtc: string;
  /** Full ISO 8601 UTC timestamp string, e.g. "2024-05-15T06:48:12.000Z" */
  iso: string;
  /** Formatted MJD with unit label, e.g. "MJD 60445.283" */
  mjdStr: string;
  /** Raw numeric MJD value */
  mjdValue: number;
  /** Human-readable relative elapsed time, e.g. "2d ago", "5h ago", "1.4y ago" */
  relativeTime: string;
  /** Whether the observation occurred within recent days (default <= 7 days) */
  isRecent: boolean;
}

/**
 * Formats a Modified Julian Date (MJD) into a comprehensive astronomical observation date structure.
 *
 * @param mjd - Modified Julian Date in decimal days, or null/undefined
 * @param referenceTime - Optional reference time (Date or timestamp ms) for relative calculation (defaults to Date.now())
 * @param precision - Decimal precision for the MJD string (defaults to 3 decimals, ~86 seconds)
 * @returns {@link FormattedObservationDate} or null if MJD is invalid or non-positive
 */
export function formatObservationDate(
  mjd: number | null | undefined,
  referenceTime?: Date | number,
  precision = 3
): FormattedObservationDate | null {
  if (mjd === null || mjd === undefined || typeof mjd !== 'number' || isNaN(mjd) || mjd <= 0) {
    return null;
  }

  const date = mjdToDate(mjd);
  const timeMs = date.getTime();
  if (isNaN(timeMs)) {
    return null;
  }

  const iso = date.toISOString();
  const dateUtc = iso.slice(0, 10);
  const timeUtc = iso.slice(11, 19);
  const fullUtc = `${dateUtc} ${timeUtc.slice(0, 5)} UTC`;
  const mjdStr = `MJD ${mjd.toFixed(precision)}`;

  const nowMs =
    referenceTime !== undefined
      ? typeof referenceTime === 'number'
        ? referenceTime
        : referenceTime.getTime()
      : Date.now();

  const diffMs = nowMs - timeMs;
  let relativeTime = 'Just now';
  let isRecent = false;

  if (diffMs > 0) {
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    isRecent = diffDays <= 7;

    if (diffDays >= 365) {
      const years = (diffDays / 365.25).toFixed(1);
      relativeTime = `${years}y ago`;
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      relativeTime = `${months}mo ago`;
    } else if (diffDays >= 1) {
      relativeTime = `${diffDays}d ago`;
    } else if (diffHours >= 1) {
      relativeTime = `${diffHours}h ago`;
    } else if (diffMin >= 1) {
      relativeTime = `${diffMin}m ago`;
    } else {
      relativeTime = 'Just now';
    }
  } else {
    // Current or future due to slight clock drift
    relativeTime = 'Just now';
    isRecent = true;
  }

  return {
    dateUtc,
    timeUtc,
    fullUtc,
    iso,
    mjdStr,
    mjdValue: mjd,
    relativeTime,
    isRecent,
  };
}
