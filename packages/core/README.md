# @skyscout/core

[![npm version](https://img.shields.io/npm/v/@skyscout/core.svg?style=flat-square)](https://www.npmjs.com/package/@skyscout/core)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/vilmosioo/skyscout/ci.yml?branch=develop&style=flat-square&label=CI)](https://github.com/vilmosioo/skyscout/actions)

Telescope-agnostic astronomical mathematics, celestial coordinate conversions, time transformations, and photometry calculations for **SkyScout**.

## Features

- ⏱ **Astronomical Time Conversions**:
  - Modified Julian Date (MJD) ↔ JavaScript `Date` ↔ Julian Date (JD).
  - High-precision handling of astronomical epochs including J2000.0 and Unix epoch.
- 📐 **Coordinates & Spherical Geometry**:
  - Right Ascension (RA) and Declination (Dec) formatting.
  - Decimal degrees ↔ Sexagesimal conversions (HMS for RA, DMS for Dec).
  - Great-circle angular separation via the numerically stable spherical Vincenty formula in degrees and arcseconds.
  - Robust handling of edge cases (negative zero declination `-0°`, degree rollover, clamping).
- 💡 **Photometry, Distance & Stellar Math**:
  - Point Spread Function (PSF) flux in nanoJanskys (nJy) ↔ standard AB magnitude.
  - First-order error propagation between linear flux uncertainty (`σ_f`) and magnitude uncertainty (`σ_m`).
  - Signal-to-noise ratio (SNR) calculation.
  - Stellar parallax (`ϖ` in mas) ↔ distance in parsecs and light-years, plus distance modulus (`μ = m - M`).
  - Absolute magnitude calculation (`M_G = G + 5 + 5 * log10(ϖ / 1000) - A_G`) with optional extinction.
  - Stellar luminosity (`log10(L / L☉)` and `L / L☉`), Gaia `G_BP - G_RP` color index, effective temperature (`T_eff`), and MK spectral class (`O`–`M`).
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
