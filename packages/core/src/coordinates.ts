/**
 * Astronomical coordinate systems, sexagesimal conversions, and spherical geometry.
 * Standard conventions:
 * - Right Ascension (RA): degrees [0, 360) or Hours [0, 24)
 * - Declination (Dec): degrees [-90, +90]
 */

export interface HmsCoordinates {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface DmsCoordinates {
  sign: '+' | '-';
  degrees: number;
  minutes: number;
  seconds: number;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Normalizes Right Ascension (RA) in degrees to the standard [0, 360) range.
 */
export function normalizeRa(ra: number): number {
  let normalized = ra % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized === 360 ? 0 : normalized;
}

/**
 * Clamps Declination (Dec) in degrees to the valid [-90, +90] range.
 */
export function clampDec(dec: number): number {
  return Math.max(-90, Math.min(90, dec));
}

/**
 * Formats Right Ascension and Declination to standard decimal degree strings.
 *
 * @param ra - Right Ascension in decimal degrees
 * @param dec - Declination in decimal degrees
 * @param precision - Decimal places to display (default: 4)
 */
export function formatCoordinates(
  ra: number,
  dec: number,
  precision: number = 4
): { raStr: string; decStr: string } {
  const normRa = normalizeRa(ra);
  const clampedDec = clampDec(dec);

  const decFixed = clampedDec.toFixed(precision);
  // Ensure -0.0000 becomes 0.0000 if clampedDec is 0
  const isZero = parseFloat(decFixed) === 0;
  const decStr = isZero
    ? `+${Math.abs(parseFloat(decFixed)).toFixed(precision)}`
    : clampedDec >= 0
    ? `+${decFixed}`
    : decFixed;

  return {
    raStr: normRa.toFixed(precision),
    decStr,
  };
}

/**
 * Converts Right Ascension from decimal degrees to Hours, Minutes, Seconds (HMS).
 *
 * @param raDeg - Right Ascension in degrees [0, 360)
 */
export function degreesToHms(raDeg: number): HmsCoordinates {
  const normRa = normalizeRa(raDeg);
  const totalHours = normRa / 15;

  let hours = Math.floor(totalHours);
  let remMinutes = (totalHours - hours) * 60;
  let minutes = Math.floor(remMinutes);
  let seconds = (remMinutes - minutes) * 60;

  // Handle rounding edge case (e.g. 59.9999999999)
  if (seconds >= 59.9999999) {
    seconds = 0;
    minutes += 1;
    if (minutes >= 60) {
      minutes = 0;
      hours = (hours + 1) % 24;
    }
  }

  return { hours, minutes, seconds };
}

/**
 * Converts Right Ascension from Hours, Minutes, Seconds to decimal degrees.
 */
export function hmsToDegrees(
  hoursOrHms: number | HmsCoordinates,
  minutes?: number,
  seconds?: number
): number {
  let h: number;
  let m: number;
  let s: number;

  if (typeof hoursOrHms === 'object') {
    h = hoursOrHms.hours;
    m = hoursOrHms.minutes;
    s = hoursOrHms.seconds;
  } else {
    h = hoursOrHms;
    m = minutes ?? 0;
    s = seconds ?? 0;
  }

  const totalHours = h + m / 60 + s / 3600;
  return normalizeRa(totalHours * 15);
}

/**
 * Converts Declination from decimal degrees to Sign, Degrees, Minutes, Seconds (DMS).
 *
 * @param decDeg - Declination in degrees [-90, +90]
 */
export function degreesToDms(decDeg: number): DmsCoordinates {
  const clamped = clampDec(decDeg);
  const sign: '+' | '-' = Object.is(clamped, -0) || clamped < 0 ? '-' : '+';
  const absDec = Math.abs(clamped);

  let degrees = Math.floor(absDec);
  let remMinutes = (absDec - degrees) * 60;
  let minutes = Math.floor(remMinutes);
  let seconds = (remMinutes - minutes) * 60;

  // Handle rounding edge case
  if (seconds >= 59.9999999) {
    seconds = 0;
    minutes += 1;
    if (minutes >= 60) {
      minutes = 0;
      degrees = Math.min(90, degrees + 1);
    }
  }

  return { sign, degrees, minutes, seconds };
}

/**
 * Converts Declination from Sign, Degrees, Minutes, Seconds to decimal degrees.
 */
export function dmsToDegrees(
  degreesOrDms: number | DmsCoordinates,
  minutes?: number,
  seconds?: number,
  sign?: '+' | '-'
): number {
  let d: number;
  let m: number;
  let s: number;
  let sgn: '+' | '-' = '+';

  if (typeof degreesOrDms === 'object') {
    d = Math.abs(degreesOrDms.degrees);
    m = degreesOrDms.minutes;
    s = degreesOrDms.seconds;
    sgn = degreesOrDms.sign;
  } else {
    d = Math.abs(degreesOrDms);
    m = minutes ?? 0;
    s = seconds ?? 0;
    if (sign) {
      sgn = sign;
    } else if (Object.is(degreesOrDms, -0) || degreesOrDms < 0) {
      sgn = '-';
    }
  }

  const absVal = d + m / 60 + s / 3600;
  const result = sgn === '-' ? -absVal : absVal;
  return clampDec(result);
}

/**
 * Formats Right Ascension in degrees to standard sexagesimal string (e.g. "12:34:56.78").
 *
 * @param raDeg - Right Ascension in degrees
 * @param precision - Decimal places for seconds (default: 2)
 * @param delimiter - Separator format ('colon' e.g. "12:34:56.78", or 'units' e.g. "12h 34m 56.78s")
 */
export function formatHms(
  raDeg: number,
  precision: number = 2,
  delimiter: 'colon' | 'units' = 'colon'
): string {
  const { hours, minutes, seconds } = degreesToHms(raDeg);

  // Re-check rounding after fixed precision formatting
  let s = parseFloat(seconds.toFixed(precision));
  let m = minutes;
  let h = hours;

  if (s >= 60) {
    s = 0;
    m += 1;
    if (m >= 60) {
      m = 0;
      h = (h + 1) % 24;
    }
  }

  const hStr = h.toString().padStart(2, '0');
  const mStr = m.toString().padStart(2, '0');
  const sStr = (precision > 0 ? s.toFixed(precision) : Math.round(s).toString()).padStart(
    precision > 0 ? precision + 3 : 2,
    '0'
  );

  if (delimiter === 'units') {
    return `${hStr}h ${mStr}m ${sStr}s`;
  }
  return `${hStr}:${mStr}:${sStr}`;
}

/**
 * Formats Declination in degrees to standard sexagesimal string (e.g. "+12:34:56.78").
 *
 * @param decDeg - Declination in degrees
 * @param precision - Decimal places for arcseconds (default: 2)
 * @param delimiter - Separator format ('colon' e.g. "+12:34:56.78", or 'units' e.g. "+12d 34m 56.78s")
 */
export function formatDms(
  decDeg: number,
  precision: number = 2,
  delimiter: 'colon' | 'units' = 'colon'
): string {
  const { sign, degrees, minutes, seconds } = degreesToDms(decDeg);

  let s = parseFloat(seconds.toFixed(precision));
  let m = minutes;
  let d = degrees;

  if (s >= 60) {
    s = 0;
    m += 1;
    if (m >= 60) {
      m = 0;
      d = Math.min(90, d + 1);
    }
  }

  const dStr = d.toString().padStart(2, '0');
  const mStr = m.toString().padStart(2, '0');
  const sStr = (precision > 0 ? s.toFixed(precision) : Math.round(s).toString()).padStart(
    precision > 0 ? precision + 3 : 2,
    '0'
  );

  if (delimiter === 'units') {
    return `${sign}${dStr}d ${mStr}m ${sStr}s`;
  }
  return `${sign}${dStr}:${mStr}:${sStr}`;
}

/**
 * Parses a sexagesimal Right Ascension string into decimal degrees.
 * Supported formats: "12:34:56.78", "12h 34m 56.78s", "12 34 56.78", "12h34m56.78s".
 */
export function parseSexagesimalRa(str: string): number {
  const cleaned = str.trim();
  const match = cleaned.match(
    /^(\d{1,2})(?:[h\s:]|\s*h\s*)\s*(\d{1,2})(?:[m\s:]|\s*m\s*)\s*(\d{1,2}(?:\.\d+)?)\s*(?:s|\s*s\s*)?$/i
  );
  if (!match) {
    throw new Error(`Invalid sexagesimal RA string format: "${str}"`);
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseFloat(match[3]);

  if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error(`Sexagesimal RA value out of range: "${str}"`);
  }

  return hmsToDegrees(hours, minutes, seconds);
}

/**
 * Parses a sexagesimal Declination string into decimal degrees.
 * Supported formats: "+12:34:56.78", "-12 34 56.78", "+12d 34m 56.78s", "-12° 34' 56.78\"".
 */
export function parseSexagesimalDec(str: string): number {
  const cleaned = str.trim();
  const match = cleaned.match(
    /^([+-])?\s*(\d{1,2})(?:[°d\s:]|\s*°\s*|\s*d\s*)\s*(\d{1,2})(?:['m\s:]|\s*'\s*|\s*m\s*)\s*(\d{1,2}(?:\.\d+)?)\s*(?:["'s]|\s*"\s*|\s*''\s*|\s*s\s*)?$/i
  );
  if (!match) {
    throw new Error(`Invalid sexagesimal Dec string format: "${str}"`);
  }
  const sign: '+' | '-' = match[1] === '-' ? '-' : '+';
  const degrees = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  const seconds = parseFloat(match[4]);

  if (degrees < 0 || degrees > 90 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error(`Sexagesimal Dec value out of range: "${str}"`);
  }

  return dmsToDegrees({ sign, degrees, minutes, seconds });
}

/**
 * Calculates the great-circle angular separation between two celestial points in decimal degrees.
 * Uses the spherical Vincenty formula, which is numerically stable and accurate across all angular separations.
 *
 * @param ra1 - RA of point 1 in degrees
 * @param dec1 - Dec of point 1 in degrees
 * @param ra2 - RA of point 2 in degrees
 * @param dec2 - Dec of point 2 in degrees
 * @returns Angular separation in decimal degrees
 */
export function angularSeparation(
  ra1: number,
  dec1: number,
  ra2: number,
  dec2: number
): number {
  const phi1 = dec1 * DEG_TO_RAD;
  const phi2 = dec2 * DEG_TO_RAD;
  const deltaLambda = (ra2 - ra1) * DEG_TO_RAD;

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const sinPhi2 = Math.sin(phi2);
  const cosPhi2 = Math.cos(phi2);
  const sinDeltaLambda = Math.sin(deltaLambda);
  const cosDeltaLambda = Math.cos(deltaLambda);

  const y = Math.sqrt(
    Math.pow(cosPhi2 * sinDeltaLambda, 2) +
    Math.pow(cosPhi1 * sinPhi2 - sinPhi1 * cosPhi2 * cosDeltaLambda, 2)
  );
  const x = sinPhi1 * sinPhi2 + cosPhi1 * cosPhi2 * cosDeltaLambda;

  return Math.atan2(y, x) * RAD_TO_DEG;
}

/**
 * Calculates the great-circle angular separation between two celestial points in arcseconds.
 * Useful for astronomical cone searches and cross-matching.
 *
 * @param ra1 - RA of point 1 in degrees
 * @param dec1 - Dec of point 1 in degrees
 * @param ra2 - RA of point 2 in degrees
 * @param dec2 - Dec of point 2 in degrees
 * @returns Angular separation in arcseconds
 */
export function angularSeparationArcsec(
  ra1: number,
  dec1: number,
  ra2: number,
  dec2: number
): number {
  return angularSeparation(ra1, dec1, ra2, dec2) * 3600;
}

/** Horizontal spherical coordinates (Altitude and Azimuth) */
export interface AltAzCoordinates {
  /** Altitude above horizon in degrees [-90, +90] */
  altitude: number;
  /** Azimuth angle in degrees [0, 360) measured East from North */
  azimuth: number;
  /** Optical airmass (approximate relative path length through Earth atmosphere) */
  airmass: number;
}

/**
 * Calculates Greenwich Mean Sidereal Time (GMST) in degrees for a given Date.
 */
export function getGmstDegrees(date: Date): number {
  const jd = date.getTime() / 86_400_000 + 2440587.5;
  const d = jd - 2451545.0;
  let gmst = 280.46061837 + 360.98564736629 * d;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

/**
 * Calculates topocentric Altitude and Azimuth (Alt/Az) for a celestial object (RA, Dec)
 * as observed from an Earth location (latitude, longitude) at a specific time.
 *
 * @param ra - Right Ascension in decimal degrees
 * @param dec - Declination in decimal degrees
 * @param lat - Observer latitude in decimal degrees (-90 to +90, positive North)
 * @param lon - Observer longitude in decimal degrees (-180 to +180, positive East)
 * @param date - Observation timestamp (default: current Date)
 */
export function calculateAltAz(
  ra: number,
  dec: number,
  lat: number,
  lon: number,
  date: Date = new Date()
): AltAzCoordinates {
  const gmst = getGmstDegrees(date);
  const lst = ((gmst + lon) % 360 + 360) % 360;

  let ha = lst - ra;
  ha = ((ha % 360) + 360) % 360;
  if (ha > 180) ha -= 360;

  const latRad = lat * DEG_TO_RAD;
  const decRad = dec * DEG_TO_RAD;
  const haRad = ha * DEG_TO_RAD;

  const sinAlt =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altDeg = altRad * RAD_TO_DEG;

  const cosAz =
    (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altRad)) /
    (Math.cos(latRad) * Math.cos(altRad));
  let azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(haRad) > 0) {
    azRad = 2 * Math.PI - azRad;
  }
  const azDeg = azRad * RAD_TO_DEG;

  let airmass = 99.0;
  if (altDeg > 2) {
    const zenithRad = (90 - altDeg) * DEG_TO_RAD;
    airmass = 1.0 / Math.cos(zenithRad);
  }

  return {
    altitude: altDeg,
    azimuth: azDeg,
    airmass: Math.min(15.0, Math.max(1.0, airmass)),
  };
}

/**
 * Returns the 16-point compass cardinal direction string (e.g. 'SSE', 'NW')
 * for a given azimuth angle in degrees.
 */
export function getCardinalDirection(azimuthDeg: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(((azimuthDeg % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}
