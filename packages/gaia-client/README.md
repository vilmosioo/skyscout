# @skyscout/gaia-client

[![npm version](https://img.shields.io/npm/v/@skyscout/gaia-client.svg?style=flat-square)](https://www.npmjs.com/package/@skyscout/gaia-client)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/vilmosioo/skyscout/ci.yml?branch=develop&style=flat-square&label=CI)](https://github.com/vilmosioo/skyscout/actions)

A lightweight, fully-typed TypeScript client for the **European Space Agency (ESA) Gaia Archive** (`gaiadr3.gaia_source`). Abstracts away IVOA Table Access Protocol (TAP) mechanics, Astronomical Data Query Language (ADQL) syntax, and raw catalog column names into clean TypeScript methods. Part of the **SkyScout** astrophysics ecosystem.

---

## About the ESA Gaia Archive

The [ESA Gaia mission](https://www.cosmos.esa.int/web/gaia) has charted a three-dimensional map of nearly two billion stars across the Milky Way and beyond, providing high-precision astrometry (positions, parallaxes `ϖ`, proper motions, radial velocities) and three-band spectrophotometry (`G`, `G_BP`, `G_RP`).

### Official ESA Gaia & IVOA Resources
* 🌐 **ESA Gaia Archive Web Portal**: [gea.esac.esa.int/archive](https://gea.esac.esa.int/archive/)
* 🔌 **Programmatic & TAP API Guide**: [cosmos.esa.int/web/gaia-users/archive/programmatic-access](https://www.cosmos.esa.int/web/gaia-users/archive/programmatic-access)
* 📝 **Writing ADQL Queries for Gaia**: [cosmos.esa.int/web/gaia-users/archive/writing-queries](https://www.cosmos.esa.int/web/gaia-users/archive/writing-queries)
* 📖 **Gaia DR3 `gaia_source` Data Model & Column Reference**: [gea.esac.esa.int/archive/documentation/GDR3 — `gaia_source`](https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html)
* 🛰️ **TAP Capabilities Endpoint**: [gea.esac.esa.int/tap-server/tap/capabilities](https://gea.esac.esa.int/tap-server/tap/capabilities)
* 📐 **IVOA TAP & ADQL Specifications**: [IVOA TAP v1.1](https://www.ivoa.net/documents/TAP/) · [IVOA ADQL v2.1](https://www.ivoa.net/documents/ADQL/)

---

## Features

- 🎯 **High-Level, Zero-ADQL API**: Query stars by sky cone (`coneSearch`), distance in parsecs (`searchByDistance`), structured physical filters (`searchStars`), or `sourceId` (`getStarById`) without writing raw ADQL or learning TAP column names.
- 🔓 **Zero API Keys Required**: Queries the public ESA Gaia Archive synchronous TAP endpoint (`https://gea.esac.esa.int/tap-server/tap/sync`) directly over standard `fetch`.
- 🛡️ **Lossless 64-bit `sourceId` Precision**: Preserves 19-digit Gaia DR3 `source_id` identifiers (e.g. `5853498713190525696`) as exact strings without IEEE-754 float64 truncation (`2^53 - 1`).
- 🌟 **Automatic Physical Enrichment**: Automatically maps raw TAP rows into clean camelCase `GaiaStar` objects with computed distance (`distancePc`, `distanceLy`), absolute magnitude (`absoluteMagG`), relative solar luminosity (`logLuminositySolar`), effective temperature (`teffK`), and Morgan–Keenan spectral class (`O`–`M`) via `@skyscout/core`.

---

## Installation

```bash
npm install @skyscout/gaia-client @skyscout/core
```

---

## Quick Start

```typescript
import { GaiaClient } from '@skyscout/gaia-client';

const client = new GaiaClient();

// 1. Cone Search: Find stars around the Pleiades (RA=56.75, Dec=24.12)
// between 120 and 155 parsecs without writing ADQL
const clusterStars = await client.coneSearch({
  ra: 56.75,
  dec: 24.12,
  radiusDeg: 2.0,       // or use radiusArcmin / radiusArcsec
  minDistancePc: 120,   // automatically converted to parallax bounds
  maxDistancePc: 155,
  minParallaxSnr: 10,
  maxMagG: 16.5,
  sortBy: 'brightest',
  limit: 500,
});

// 2. Volume Search: Find the nearest stars within 20 parsecs of the Sun
const nearbyStars = await client.searchByDistance({
  maxDistancePc: 20,
  minParallaxSnr: 20,
  sortBy: 'nearest',
  limit: 200,
});

// 3. Lookup a single star by its 64-bit Gaia DR3 source_id
const alcyone = await client.getStarById('64995134679307264');
console.log(alcyone?.distancePc, alcyone?.absoluteMagG, alcyone?.spectralClass);

// 4. Escape Hatch: Execute raw ADQL when custom joins or tables are needed
const rawRows = await client.queryAdql(`
  SELECT TOP 10 source_id, ra, dec, parallax, phot_g_mean_mag
  FROM gaiadr3.gaia_source
  WHERE parallax > 100
`);
```

## License

[BSD-3-Clause](LICENSE)
