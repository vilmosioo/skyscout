# @skyscout/skyview-client

[![npm version](https://img.shields.io/npm/v/@skyscout/skyview-client.svg)](https://www.npmjs.com/package/@skyscout/skyview-client)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Public Domain Imagery](https://img.shields.io/badge/NASA%20Imagery-Public%20Domain-green.svg)](https://www.nasa.gov/multimedia/guidelines/index.html)

TypeScript client for **NASA Goddard Space Flight Center's SkyView Image Service**.

SkyView generates astronomical image cutouts across 100+ space mission and ground-based surveys, including **2MASS (Infrared)**, **WISE (Mid-Infrared)**, **DSS/DSS2 (Optical)**, **GALEX (Ultraviolet)**, **SDSS**, and **Fermi (Gamma-Ray)**.

---

## 🌟 Features

- **Direct Image URLs**: Instant URL generation for `<img src="...">`, CSS backgrounds, or HTML5 Canvas `drawImage()` without server-side buffering.
- **100% NASA Public Domain**: Images produced by NASA SkyView are works of the U.S. Federal Government under 17 U.S.C. § 105 and are in the **Public Domain**, making them unencumbered for commercial prints, museum posters, and web applications.
- **Multiple Survey Bands**: Near-IR (2MASS J, H, K, Color), Mid-IR (WISE 3.4µm, 4.6µm, 12µm, 22µm), Optical (DSS2 Color, Red, Blue, SDSS), UV (GALEX).
- **Zero Heavy Dependencies**: Pure TypeScript built with standard `fetch` and `AbortController`.
- **Dual ESM & CommonJS**: Full TypeScript declaration maps (`.d.ts`).

---

## 📦 Installation

```bash
npm install @skyscout/skyview-client
```

---

## 🚀 Quick Start

### 1. Direct Image URL (Zero Network Latency)

```typescript
import { SkyviewClient } from '@skyscout/skyview-client';

const skyview = new SkyviewClient();

// Get an immediate 2MASS infrared cutout URL
const imageUrl = skyview.getImageUrl({
  position: { ra: 56.75, dec: 24.12 }, // Pleiades (M45)
  survey: '2MASS Color',
  pixels: 1000,
  sizeDeg: 1.5,
});

console.log(imageUrl);
// https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl?Position=56.750000%2C+24.120000&Survey=2MASS+Color&Pixels=1000&Size=1.5&Return=JPEG
```

### 2. Fetch Image Blob for Canvas or Download

```typescript
const blob = await skyview.fetchImageBlob({
  position: 'NGC 6231',
  survey: 'DSS2 Color',
  pixels: 1200,
  sizeDeg: 0.8,
});

// Create object URL for rendering in an HTML5 canvas or 300 DPI poster
const objectUrl = URL.createObjectURL(blob);
```

### 3. Fetch Raw FITS File

```typescript
const fitsBuffer = await skyview.fetchFits({
  position: { ra: 88.07, dec: 32.55 },
  survey: '2MASS-K',
  pixels: 500,
  sizeDeg: 0.5,
});
```

---

## 🛰️ Common Surveys

| Survey Key | Waveband | Description |
|---|---|---|
| `'2MASS Color'` | Near-Infrared | False-color RGB composite from 2MASS J, H, and Ks bands |
| `'2MASS-J'`, `'2MASS-H'`, `'2MASS-K'` | Near-Infrared | Individual 2MASS infrared bands |
| `'DSS2 Color'` | Optical | Digitized Sky Survey color optical plates |
| `'DSS2 Red'`, `'DSS2 Blue'` | Optical | High-resolution optical photographic survey |
| `'AllWISE Color'` | Mid-Infrared | Wide-field Infrared Survey Explorer color composite |
| `'WISE 3.4'`, `'WISE 12'` | Mid-Infrared | Thermal dust and cool stellar emission |
| `'GALEX Near UV'` | Ultraviolet | Galaxy Evolution Explorer UV star-forming regions |
| `'SDSSg'`, `'SDSSr'`, `'SDSSi'` | Optical | Sloan Digital Sky Survey multiband photometry |

---

## ⚖️ Licensing & Attribution

- **Code**: Licensed under the open-source [BSD-3-Clause License](./LICENSE).
- **Imagery**: Under United States law (17 U.S.C. § 105), works created by the U.S. Federal Government (including NASA) are in the **Public Domain**.
- **Commercial Use**: NASA public-domain imagery may be used freely for commercial purposes, including art prints, physical posters, educational products, and digital media, without royalty or permission fees.

### Attribution Helper

```typescript
console.log(skyview.getAttribution('2MASS Color'));
// "Image courtesy of NASA / IPAC / 2MASS (U.S. Public Domain)."
```

---

## 🤝 Part of SkyScout

Developed by the **SkyScout** astronomy team.
