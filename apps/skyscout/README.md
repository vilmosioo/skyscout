# SkyScout Web Dashboard (`skyscout`)

The interactive web dashboard and research console for **SkyScout**, engineered for real-time transient alert scouting, light curve exploration, and Difference Image Analysis (DIA) inspection across the Vera C. Rubin Observatory (LSST) alert stream.

Built with **Vite 6**, **React 18**, **Wouter** (lightweight routing), and isolated **CSS Modules** (`*.module.css`).

---

## Key Features

1. **Discovery Cards (`/` or `/cards`)**:
   - Visual candidate feed with category filters (**SN**, **NT**, **CV**, **AGN**).
   - Real-time search by Object ID, host galaxy, or classification.
   - Dynamic sorting by Discovery Epoch (MJD), Peak Magnitude ($m_{AB}$), or Host Separation.
   - Canvas-rendered DIA Difference stamp previews for instant visual triage.
   - 1-click **Scout Target** button jumping straight into the Deep Console.

2. **Deep Research Console (`/console`)**:
   - **Transient SQL Stream (`client.query`)**: Live SQL query builder with real-time filtering and MJD descending sort.
   - **Sky Cone Search (`client.cone`)**: Spatial search with presets for Rubin Deep Drilling Fields (e.g. COSMOS).
   - **Photometry & Light Curve Table (`client.object`)**: Multi-band difference flux and calibrated AB magnitude table powered by `@skyscout/core`.
   - **CCD Stamp Viewer (`StampViewer`)**: Synchronized astronomical triplet inspection.
   - **Sherlock Contextual Classifier (`client.sherlock`)**: AI crossmatch against NED, SIMBAD, Pan-STARRS, SDSS, and Gaia.

---

## Component Deep Dive: `StampViewer`

[`StampViewer`](./src/StampViewer.tsx) is a specialized astronomical visualization component for inspecting CCD difference imaging cutouts.

### The Astronomical Triplet

In time-domain astrophysics and Difference Image Analysis (DIA), every transient candidate detection is characterized by three synchronized cutouts:

```
+--------------------+   +--------------------+   +--------------------+
|     TEMPLATE       |   |      SCIENCE       |   |  DIFFERENCE (DIFF) |
|                    |   |                    |   |                    |
|  * Field Star      | - |  * Field Star      | = |                    |
|   ( ) Host Galaxy  |   |   ( ) Host Galaxy  |   |                    |
|                    |   |    * Transient     |   |    * Transient     |
+--------------------+   +--------------------+   +--------------------+
 (Historical Sky)          (Current Visit)          (Residual Point Flux)
```

1. **Template**:
   - Co-added historical reference image of the sky patch taken before the transient appeared.
   - Contains static field stars and the quiescent host galaxy morphology.
2. **Science**:
   - The new survey exposure taken during the current observation visit.
   - Contains the host galaxy, field stars, plus the new erupting transient source.
3. **Difference (Diff)**:
   - The result of Point Spread Function (PSF) matching and pixel-by-pixel subtraction:
     $$\text{Difference} = \text{Science} - \text{Template}$$
   - Static flux (host galaxy and field stars) cancels out, leaving only the residual variable flux of the transient.

---

### Colormaps & Visual Features

`StampViewer` includes an astronomical false-color rendering engine running directly on HTML5 Canvas:

* **Invert (`invert`)**:
  - Negative grayscale (white sky background, dark stars and galaxies).
  - Matches traditional astronomical photographic plates.
  - Recommended for detecting faint host galaxy halos and low surface-brightness features due to the human eye's superior optical contrast on bright backgrounds.
* **Grayscale (`gray`)**:
  - Direct linear intensity map (black sky background, bright celestial sources).
* **Plasma (`plasma`)**:
  - Perceptually uniform, viridis-family colormap ($\text{blue} \rightarrow \text{violet} \rightarrow \text{orange} \rightarrow \text{yellow}$).
  - Ideal for evaluating core Point Spread Function (PSF) flux gradients and saturation levels.
* **Astrometric Reticle Crosshair**:
  - Toggleable crosshair reticle marking the exact sub-pixel astrometric centroid $(\text{RA}, \text{Dec})$ of the DIA source detection.
* **Direct FITS Download Links**:
  - Deep links (`Diff FITS ↗`, `FITS ↗`) generated via `getLasairCutoutUrl()`, allowing researchers to download the raw multi-extension FITS files for local aperture photometry in DS9, Astropy, or SExtractor.

---

### Component Props & Interface

```typescript
import { StampViewer, type StampViewerProps } from './StampViewer';

interface StampViewerProps {
  /** The Rubin DIA source detection record (containing psfFlux, band, errors) */
  source: RubinDiaSource;
  /** 64-bit Rubin DIA Object ID */
  objectId: string | number;
  /** Whether the viewer is operating in offline demo mode */
  isDemoMode: boolean;
}
```

### Usage Example

```tsx
import React from 'react';
import { StampViewer } from './StampViewer';
import type { RubinDiaSource } from '@skyscout/lasair-client';

export function TransientInspector({ source, objectId }: { source: RubinDiaSource; objectId: string }) {
  return (
    <section>
      <h3>CCD Image Cutouts</h3>
      <StampViewer
        source={source}
        objectId={objectId}
        isDemoMode={false}
      />
    </section>
  );
}
```

---

## Configuration & Environment

The web app requires a single environment variable configured in `.env` at the monorepo root:

```env
VITE_LASAIR_TOKEN=your_lasair_token_here
```

* Obtain a free token at [lasair.lsst.ac.uk/users/register](https://lasair.lsst.ac.uk/users/register/).
* In browser runtime, requests are seamlessly proxied through the local Vite reverse proxy (`/api` $\rightarrow$ `https://api.lasair.lsst.ac.uk`) to eliminate browser CORS preflight `401` errors.

---

## Development

Run from monorepo root:

```bash
# Start Vite development server
npm run dev --filter=skyscout

# Typecheck TypeScript
npm run typecheck --filter=skyscout

# Build production bundle
npm run build --filter=skyscout
```
