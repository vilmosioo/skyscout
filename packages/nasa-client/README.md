# @skyscout/nasa-client

Fully-typed TypeScript client for NASA Public Domain astronomical archives:
- **NASA IPAC / IRSA**: 2MASS All-Sky Point Source Catalog (`fp_psc`), AllWISE.
- **STScI MAST**: TESS Input Catalog (TIC v8.2), Hubble Source Catalog.

All data is released into the **U.S. Public Domain (17 U.S.C. § 105)**, enabling unrestricted commercial use, fine-art poster printing, and scientific research.

## Features

- **Zero Heavy Dependencies**: Uses web-standard `fetch`, `AbortController`, and pure TypeScript types.
- **Dual Build**: Ships dual ESM (`.js`) and CommonJS (`.cjs`) with declaration maps (`.d.ts`).
- **Near-Infrared CMDs**: Automatically calculates $J - K_s$ color index for penetrating interstellar dust clouds.
- **Physical Stellar Parameters**: Directly extracts $T_{\rm eff}$, radius ($R_\odot$), mass ($M_\odot$), and luminosity ($L_\odot$) from the TESS Input Catalog.
- **Hermetic & Resilient**: Configurable timeouts, exponential backoff retries, and comprehensive error hierarchy.

## Installation

```bash
npm install @skyscout/nasa-client
```

## Quick Start

```typescript
import { NasaClient } from '@skyscout/nasa-client';

const client = new NasaClient();

// 1. 2MASS Near-Infrared Cone Search (Pleiades M45)
const infraredStars = await client.coneSearch2Mass({
  ra: 56.75,
  dec: 24.116,
  radiusDeg: 0.5,
  limit: 500,
});

console.log(`Found ${infraredStars.length} 2MASS stars`);
console.log(`First star J-K: ${infraredStars[0].jMinusK}`);

// 2. TESS Input Catalog (TIC) with direct physical parameters
const ticStars = await client.coneSearchTic({
  ra: 56.75,
  dec: 24.116,
  radiusDeg: 0.5,
  limit: 500,
});

console.log(`First star Teff: ${ticStars[0].teffK} K, Radius: ${ticStars[0].radiusSolar} R_sun`);
```

## License

BSD-3-Clause. Data provided by NASA / IPAC / STScI under U.S. Public Domain.
