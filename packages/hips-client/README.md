# @skyscout/hips-client

[![npm version](https://img.shields.io/npm/v/@skyscout/hips-client.svg)](https://www.npmjs.com/package/@skyscout/hips-client)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![IVOA Standard](https://img.shields.io/badge/IVOA-HiPS-orange.svg)](https://www.ivoa.net/documents/HiPS/)

Fully-typed TypeScript client for **IVOA HiPS** (Hierarchical Progressive Surveys) and the CDS **`hips2fits`** astronomical image cutout service.

Enables instant generation of true-color and multiwavelength astronomical image cutouts from global all-sky surveys including **DSS2 Color**, **NASA 2MASS**, **Pan-STARRS**, and **unWISE**.

---

## 🌟 Features

- **Direct Cutout URLs**: Generates instant image URLs without server-side proxying, ready for HTML `<img src="...">` and Canvas `drawImage()`.
- **IVOA Standards**: Fully compliant with the International Virtual Observatory Alliance (IVOA) HiPS specification.
- **Multiwavelength Surveys**: Optical (DSS2 Color, Pan-STARRS DR1, SDSS9), Infrared (2MASS Color, unWISE W1+W2), and Gaia DR3 flux maps.
- **Flexible Projections**: Gnomonic (`TAN`), Stereographic (`STG`), Cartesian (`CAR`), and Orthographic (`SIN`).
- **Zero Heavy Dependencies**: Pure TypeScript built with standard `fetch` and `AbortController`.
- **Dual ESM & CommonJS**: Full TypeScript declaration maps (`.d.ts`).

---

## 📦 Installation

```bash
npm install @skyscout/hips-client
```

---

## 🚀 Quick Start

### 1. Direct Cutout URL (Zero Latency)

```typescript
import { HipsClient } from '@skyscout/hips-client';

const hips = new HipsClient();

// Get a true-color Digitized Sky Survey (DSS2) cutout URL for Pleiades (M45)
const imageUrl = hips.getCutoutUrl({
  ra: 56.75,
  dec: 24.12,
  fovDeg: 1.5,
  width: 800,
  height: 800,
  hips: 'CDS/P/DSS2/color',
  format: 'jpg',
});

console.log(imageUrl);
// https://alasky.cds.unistra.fr/hips-image-services/hips2fits?hips=CDS%2FP%2FDSS2%2Fcolor&ra=56.750000&dec=24.120000&fov=1.5&width=800&height=800&projection=TAN&coordsys=icrs&rotation_angle=0&format=jpg
```

### 2. Fetch Image Blob for Canvas or Poster Printing

```typescript
const blob = await hips.fetchCutoutBlob({
  ra: 253.53,
  dec: -41.83, // NGC 6231
  fovDeg: 0.8,
  width: 1200,
  height: 1200,
  hips: 'CDS/P/2MASS/color',
});

const objectUrl = URL.createObjectURL(blob);
```

### 3. Fetch Raw FITS File for Scientific Photometry

```typescript
const fitsBuffer = await hips.fetchFits({
  ra: 250.42,
  dec: 36.46, // M13
  fovDeg: 0.5,
  width: 600,
  height: 600,
  hips: 'CDS/P/DSS2/red',
});
```

---

## 🛰️ Common Surveys

| HiPS Survey Identifier | Band | Description |
|---|---|---|
| `'CDS/P/DSS2/color'` | Optical | True-color composite from POSS-II / UK Schmidt optical plates |
| `'CDS/P/2MASS/color'` | Near-Infrared | False-color RGB composite from 2MASS J, H, Ks (U.S. Public Domain) |
| `'CDS/P/PanSTARRS/DR1/color-z-zg-g'` | Optical | Deep modern 1.8m telescope imaging from Haleakalā, Hawaii |
| `'CDS/P/unWISE/color-W1-W2'` | Mid-Infrared | Deep coadds of NASA WISE spacecraft mission |
| `'CDS/P/Gaia/DR3/flux-mean-G'` | Optical | ESA Gaia DR3 all-sky stellar flux map |

---

## ⚖️ Licensing & Attribution

- **Code**: Licensed under the open-source [BSD-3-Clause License](./LICENSE).
- **Survey Data**:
  - **NASA 2MASS & unWISE**: In the **United States Public Domain** (17 U.S.C. § 105), unrestricted for commercial and physical art print usage.
  - **DSS2 Color**: Based on photographic data obtained using The UK Schmidt Telescope and Palomar Observatory, digitized by the Space Telescope Science Institute (STScI).
  - **Pan-STARRS**: Open astronomical data hosted by STScI and CDS.

### Attribution Helper

```typescript
console.log(hips.getSurveyAttribution('CDS/P/2MASS/color'));
// "NASA 2MASS survey. U.S. Public Domain."
```

---

## 🤝 Part of SkyScout

Developed by the **SkyScout** astronomy team.
