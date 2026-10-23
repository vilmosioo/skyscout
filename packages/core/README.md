# @skyscout/core

Telescope-agnostic astronomical mathematics, celestial coordinate conversions, time transformations, and photometry calculations for **SkyScout**.

[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)

## Features

- ⏱ **Astronomical Time Conversions**:
  - Modified Julian Date (MJD) $\leftrightarrow$ JavaScript `Date` $\leftrightarrow$ Julian Date (JD).
  - High-precision handling of astronomical epochs including J2000.0 and Unix epoch.
- 📐 **Coordinates & Spherical Geometry**:
  - Right Ascension (RA) and Declination (Dec) formatting.
  - Decimal degrees $\leftrightarrow$ Sexagesimal conversions (HMS for RA, DMS for Dec).
  - Great-circle angular separation via the numerically stable spherical Vincenty formula in degrees and arcseconds.
  - Robust handling of edge cases (negative zero declination $-0^\circ$, degree rollover, clamping).
- 💡 **Photometry & Flux Math**:
  - Point Spread Function (PSF) flux in nanoJanskys (nJy) $\leftrightarrow$ standard AB magnitude.
  - First-order error propagation between linear flux uncertainty ($\sigma_f$) and magnitude uncertainty ($\sigma_m$).
  - Signal-to-noise ratio (SNR) calculation.
- 📦 **Modern Multi-Format Distribution**: Dual ESM and CommonJS bundle with TypeScript type definitions generated via `tsup`.
- ⚡ **Hermetic & Fast**: Pure mathematical algorithms and celestial transforms.

## Installation

```bash
npm install @skyscout/core
```

## Quick Start

### Astronomical Time

```typescript
import { mjdToDate, dateToMjd, julianDateToMjd, mjdToJulianDate } from '@skyscout/core';

// Convert MJD to Date
const date = mjdToDate(60456.28);
console.log(date.toISOString());

// Convert Date to MJD
const mjd = dateToMjd(new Date());

// JD <-> MJD
const jd = mjdToJulianDate(60000); // 2460000.5
```

### Coordinates and Angular Separation

```typescript
import {
  degreesToHms,
  degreesToDms,
  formatCoordinates,
  angularSeparationArcsec,
} from '@skyscout/core';

// Format RA / Dec
const coords = formatCoordinates(52.82384, -29.69162, 4);
console.log(`${coords.raStr}, ${coords.decStr}`); // "52.8238, -29.6916"

// Great-circle separation in arcseconds (e.g. for cross-matching)
const sepArcsec = angularSeparationArcsec(52.8238, -29.6916, 52.8241, -29.6914);
console.log(`Separation: ${sepArcsec.toFixed(2)} arcsec`);

// Sexagesimal conversions
const hms = degreesToHms(180); // { hours: 12, minutes: 0, seconds: 0 }
const dms = degreesToDms(-0.5); // { sign: '-', degrees: 0, minutes: 30, seconds: 0 }
```

### Photometry & Error Propagation

```typescript
import { fluxToAbMag, abMagToFlux, fluxErrorToMagError } from '@skyscout/core';

// Convert Rubin PSF flux (nanoJanskys) to AB magnitude
const mag = fluxToAbMag(10_000); // ~21.40 mag

// Propagate 10% flux error to magnitude error
const magErr = fluxErrorToMagError(10_000, 1_000); // ~0.1086 mag
```

## License

[BSD-3-Clause](LICENSE)
