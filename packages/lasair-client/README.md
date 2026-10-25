# @skyscout/lasair-client

[![npm version](https://img.shields.io/npm/v/@skyscout/lasair-client.svg?style=flat-square)](https://www.npmjs.com/package/@skyscout/lasair-client)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/vilmosioo/skyscout/ci.yml?branch=develop&style=flat-square&label=CI)](https://github.com/vilmosioo/skyscout/actions)

A lightweight, fully-typed TypeScript client for the **Lasair** community alert broker for the **Vera C. Rubin Observatory / Legacy Survey of Space and Time (LSST)**. Part of the **SkyScout** astrophysics ecosystem.

---

## About Lasair

[Lasair](https://lasair.lsst.ac.uk) is the UK community alert broker for the **Vera C. Rubin Observatory**, developed in partnership between the **University of Edinburgh**, **Queen's University Belfast**, and the **University of Oxford**. 

As wide-field survey telescopes scan the night sky, Rubin detects millions of celestial changes (transients, supernovae, variable stars, solar system objects, and active galactic nuclei) every night. Lasair ingests this massive alert stream in real time, performs astronomical cross-matching through the **Sherlock** contextual mining engine, filters alerts against user-defined queries, and delivers machine-actionable notifications.

### Official Lasair Resources
* 🌐 **Web Portal**: [lasair.lsst.ac.uk](https://lasair.lsst.ac.uk)
* 📖 **Official Documentation**: [lasair-lsst.readthedocs.io](https://lasair-lsst.readthedocs.io)
* 🔌 **Official REST API Guide**: [lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html](https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html)
* 📓 **Official Example Notebooks**: [lsst-uk/lasair-examples](https://github.com/lsst-uk/lasair-examples)
* 🔑 **Account Registration & API Tokens**: [lasair.lsst.ac.uk/users/register](https://lasair.lsst.ac.uk/users/register/) and [lasair.lsst.ac.uk/users/profile](https://lasair.lsst.ac.uk/users/profile/)

---

## Features

* **Universal Runtime Compatibility**: Built strictly on standard `fetch`, compatible with Node 18+, Bun, Deno, Cloudflare Workers, modern browsers, and React Native.
* **Lossless 64-bit ID Preservation**: Rubin DIA object and source IDs are 18-digit integers (e.g. `170657504701711053`) that exceed JavaScript's `Number.MAX_SAFE_INTEGER` ($2^{53}-1$). `@skyscout/lasair-client` automatically prevents floating-point rounding corruption.
* **Complete Lasair Broker API**:
  * SQL Queries (`query`) on Rubin alert tables and Sherlock classifications.
  * Fast Cone Search (`cone`) by sky coordinates ($\text{RA}, \text{Dec}$).
  * Difference Image Analysis (DIA) Object & Photometry Light Curves (`object`).
  * Sherlock Context & Galaxy Cross-Matching (`sherlockObject`, `sherlockPosition`).
  * Citizen & Machine Annotations (`annotate`, `annotateList`).
* **Astronomical Utilities**: Modified Julian Date (MJD) $\leftrightarrow$ Date conversions, PSF nanoJansky flux to AB magnitude calculations, and sky coordinate formatting (re-exported from `@skyscout/core`).
* **Dual ESM / CommonJS**: Pre-bundled with full TypeScript declaration maps and source maps via `tsup`.

---

## Installation

```bash
npm install @skyscout/lasair-client
```

```bash
pnpm add @skyscout/lasair-client
# or
yarn add @skyscout/lasair-client
```

---

## Authentication & API Token

To access Lasair's API, you need an authentication token:

1. Register an account at [lasair.lsst.ac.uk/users/register](https://lasair.lsst.ac.uk/users/register/).
2. Log in and navigate to your [My Profile](https://lasair.lsst.ac.uk/users/profile/) page.
3. Copy your API token.

To keep `@skyscout/lasair-client` 100% pure, portable, and runtime-agnostic, the library does not read or depend on any global environment variables. Pass your token explicitly when constructing `LasairClient`.

---

## Quickstart

```typescript
import { LasairClient } from '@skyscout/lasair-client';

// Pass your token explicitly from your application's config, secrets, or env
const client = new LasairClient({
  token: process.env.LASAIR_TOKEN!,
});

// Query latest Supernovae candidates from the Rubin stream
const results = await client.query({
  selected: 'objects.diaObjectId, objects.ra, objects.decl, sherlock_classifications.classification',
  tables: 'objects, sherlock_classifications',
  conditions:
    "objects.diaObjectId = sherlock_classifications.diaObjectId " +
    "AND sherlock_classifications.classification IN ('SN', 'NT', 'CV')",
  limit: 10,
});

console.log(`Found ${results.length} candidates:`);
for (const obj of results) {
  console.log(`- ${obj.diaObjectId} [${obj.classification}]: RA=${obj.ra}, Dec=${obj.decl}`);
}
```

---

## Database Tables & Schema Overview

Lasair exposes relational SQL queries over several core tables derived from the Rubin Data Management (DM) pipeline and the Sherlock contextual classifier:

| Table | Description | Common Columns |
| :--- | :--- | :--- |
| **`objects`** | Aggregated Difference Image Analysis (DIA) objects | `diaObjectId`, `ra`, `decl`, `nDiaSources`, `g_psfFluxMean`, `r_psfFluxMean` |
| **`diaSources`** | Single-epoch transient detections | `diaSourceId`, `diaObjectId`, `midpointMjdTai`, `filterName` (`u`, `g`, `r`, `i`, `z`, `y`), `psfFlux`, `psfFluxErr` |
| **`diaForcedSources`** | Forced aperture/PSF photometry at candidate sky positions | `diaObjectId`, `midpointMjdTai`, `band`, `psfFlux`, `psfFluxErr` |
| **`sherlock_classifications`** | Automated contextual mining results | `diaObjectId`, `classification`, `catalogue_table_name`, `separationArcsec`, `z` |

### Sherlock Classification Codes

The [Sherlock engine](https://lasair-lsst.readthedocs.io/en/latest/core_functions/sherlock.html) matches sky positions against major astronomical catalogs (Gaia, Pan-STARRS, SDSS, NED, 2MASS, Milliquas) to assign candidate types:

- **`SN`**: Supernova candidate (associated with a host galaxy)
- **`NT`**: Nuclear Transient / Tidal Disruption Event (TDE candidate at galaxy nucleus)
- **`CV`**: Cataclysmic Variable (associated with a stellar counterpart)
- **`AGN`**: Active Galactic Nucleus / Quasar variable
- **`VS`**: Variable Star (Galactic variable)
- **`BS`**: Bright Star artifact
- **`UNCLEAR`**: Ambiguous or unclassified cross-match

---

## API Reference

### 1. `client.query(options)`

Runs a SQL query against the Lasair database.

📖 **Official Docs**: [Lasair REST API — `query`](https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#query)

```typescript
const candidates = await client.query({
  selected: 'objects.diaObjectId, objects.ra, objects.decl',
  tables: 'objects',
  conditions: 'objects.ra BETWEEN 50.0 AND 60.0',
  limit: 50,
  offset: 0,
});
```

### 2. `client.cone(options)`

Runs a cone search around a specific coordinate ($\text{RA}, \text{Dec}$ in decimal degrees).

📖 **Official Docs**: [Lasair REST API — `cone`](https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#cone)

```typescript
const search = await client.cone({
  ra: 52.8238,
  dec: -29.6916,
  radius: 10, // arcseconds (default: 5)
  requestType: 'nearest', // 'all' | 'nearest' | 'count'
});

console.log('Nearest transient:', search.nearest?.object, 'separation:', search.nearest?.separation);
```

### 3. `client.object(objectId, options?)`

Retrieves the complete Rubin DIA record, including multi-band Difference Image Analysis photometry points (light curves).

📖 **Official Docs**: [Lasair REST API — `object`](https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#object)

```typescript
import { fluxToAbMag, mjdToDate } from '@skyscout/lasair-client';

const record = await client.object('170019695992242795');

console.log('Detections count:', record.diaSourcesList.length);

for (const detection of record.diaSourcesList) {
  const date = mjdToDate(detection.midpointMjdTai);
  const mag = fluxToAbMag(detection.psfFlux);
  console.log(`[${detection.band} band] ${date.toISOString()}: mag = ${mag?.toFixed(2) ?? 'N/A'}`);
}
```

### 4. `client.sherlockObject(objectId)` & `client.sherlockPosition(ra, dec)`

Fetches catalog cross-matches and host galaxy classification from the Sherlock engine.

📖 **Official Docs**: [Lasair REST API — `sherlock`](https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#sherlock) | [Sherlock Context Engine Guide](https://lasair-lsst.readthedocs.io/en/latest/core_functions/sherlock.html)

```typescript
const sherlock = await client.sherlockObject('170019695992242795');

const match = sherlock.crossmatches?.[0];
if (match) {
  console.log(`Host Catalog: ${match.catalogue_table_name} (${match.catalogue_object_id})`);
  console.log(`Separation: ${match.separationArcsec} arcsec (${match.physical_separation_kpc} kpc)`);
  console.log(`Redshift (z): ${match.z}`);
}
```

### 5. `client.annotate(options)` & `client.annotateList(annotations)`

Post citizen-science or automated machine-learning classifications back to Lasair:

📖 **Official Docs**: [Lasair REST API — `annotate`](https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#annotate)

```typescript
await client.annotate({
  objectId: '170019695992242795',
  topic: 'my_survey_topic',
  classification: 'SN Ia',
  version: '1.0',
  explanation: 'Fast rise time consistent with Type Ia supernova',
});
```

---

## 64-bit ID Precision Preservation

Rubin alert identifiers (`diaObjectId`, `diaSourceId`) are 64-bit unsigned integers up to 18 digits long. Under standard JavaScript `JSON.parse`, integers above $2^{53} - 1$ (`9007199254740991`) silently suffer IEEE-754 precision truncation:

```javascript
// Native JSON.parse rounds 18-digit IDs:
JSON.parse('{"diaObjectId": 170657504701711053}').diaObjectId;
// => 170657504701711040  <-- CORRUPTED! Last 2 digits altered!
```

`@skyscout/lasair-client` includes a lossless parser (`parseLosslessJson`) that automatically serializes large numeric IDs into exact strings before parsing:

```typescript
import { parseLosslessJson } from '@skyscout/lasair-client';

const data = parseLosslessJson<{ diaObjectId: string }>(rawJsonString);
console.log(data.diaObjectId); // "170657504701711053" (Exact string preserved)
```

---

## Astronomical Utilities

`@skyscout/lasair-client` re-exports astronomical helpers from `@skyscout/core` alongside Lasair URL generators:

```typescript
import {
  fluxToAbMag,
  formatCoordinates,
  getLasairObjectUrl,
  mjdToDate,
  dateToMjd,
} from '@skyscout/lasair-client';

// Generate official Lasair portal URL
getLasairObjectUrl('170019695992242795');
// => "https://lasair.lsst.ac.uk/object/170019695992242795/"

// Format RA / Dec
formatCoordinates(52.82384, -29.69162, 4);
// => { raStr: "52.8238", decStr: "-29.6916" }

// Modified Julian Date conversions
const date = mjdToDate(59000); // 2020-05-31
const mjd = dateToMjd(date);    // 59000

// Rubin PSF Flux (nanoJanskys) to AB Magnitude
fluxToAbMag(15000); // => ~20.96 AB mag
```

---

## Error Handling

All client errors inherit from `LasairError`:

* `LasairAuthError` (401): Missing or invalid Lasair authentication token.
* `LasairRateLimitError` (429): Lasair query quota exceeded.
* `LasairRequestError`: General HTTP error from Lasair with status code and server response body.
* `LasairTimeoutError` (408): Request timed out (configurable via `timeoutMs`).

```typescript
import { LasairAuthError, LasairRateLimitError } from '@skyscout/lasair-client';

try {
  await client.query({ ... });
} catch (err) {
  if (err instanceof LasairAuthError) {
    console.error('Invalid token! Please check your Lasair API token.');
  } else if (err instanceof LasairRateLimitError) {
    console.error('Hit Lasair rate limit; back off before retrying.');
  }
}
```

---

## Official Documentation & Useful Links

| Resource | URL |
| :--- | :--- |
| **Lasair Portal** | [https://lasair.lsst.ac.uk](https://lasair.lsst.ac.uk) |
| **Lasair Documentation** | [https://lasair-lsst.readthedocs.io](https://lasair-lsst.readthedocs.io) |
| **REST API Guide** | [https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html](https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html) |
| **Sherlock Classifier** | [https://lasair-lsst.readthedocs.io/en/latest/core_functions/sherlock.html](https://lasair-lsst.readthedocs.io/en/latest/core_functions/sherlock.html) |
| **Example Jupyter Notebooks** | [https://github.com/lsst-uk/lasair-examples](https://github.com/lsst-uk/lasair-examples) |
| **Vera C. Rubin Observatory** | [https://www.lsst.org](https://www.lsst.org) |

---

## License

[BSD-3-Clause](./LICENSE) &copy; 2026 SkyScout Contributors. Aligns with Rubin Observatory (LSST) and Astropy licensing standards.
