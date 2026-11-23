# StarPlot (`apps/starplot`)

Interactive, live Hertzsprung–Russell (H–R) diagram catalog and 18×24" 300 DPI fine-art poster generator powered by [`@skyscout/gaia-client`](../../packages/gaia-client), [`@skyscout/nasa-client`](../../packages/nasa-client), [`@skyscout/hips-client`](../../packages/hips-client), [`@skyscout/skyview-client`](../../packages/skyview-client), and [`@skyscout/core`](../../packages/core).

Live deployment: [starplot.vilmosioo.dev](https://starplot.vilmosioo.dev)

## Features

- **`wouter` Multi-Route Architecture**:
  - **`/` (Home Cluster Catalog Grid)**: Browse and filter **33 curated Messier, NGC & Caldwell star clusters** (`Solar Neighborhood (< 50 pc)`, 20 Open Clusters spanning `~12 Myr` to `~6.8 Gyr`, and 12 ancient Globular Clusters) with instant mini H–R diagram thumbnail canvases and a **Custom Sky Cone Search** form.
  - **`/cluster/:id` & `/chart/:id` (Interactive Chart & Poster View)**: Deep-dive into any cluster (or `/chart/custom?...` coordinate cone) and layer multiple clusters together for stellar evolution comparison.
- **Astrophysical Overlays**:
  - **📏 Constant Stellar Radius Lines (`R☉`)**: Plot Stefan–Boltzmann constant-radius curves from `0.01 R☉` (White Dwarfs) up to `1000 R☉` (Red Supergiants).
- **Pinpoint Stardust HTML5 Canvas Rendering**:
  - Plots `G_BP - G_RP` vs. Absolute Magnitude (`M_G`) & Solar Luminosity (`Sun = 1`) with fine `0.55px–1.20px` stardust points, additive glow, and multiple color schemes (`Classic H–R (Wikipedia / Powell)`, `Cosmic Ultraviolet`, `Aurora Borealis`, `JWST Infrared Gold`, and `Archival Print`).
  - Interactive mouse-wheel zoom, click-drag pan, and star inspector card (`ESASky`, `VizieR Gaia DR3`, `SIMBAD`).
- **18" × 24" at 300 DPI Fine-Art Poster Export**:
  - One-click high-resolution $5,400 \times 7,200\text{ px}$ lossless PNG export.
  - Features an editorial Clean Museum Edition typographic plaque block: J2000 coordinates, classification, distance, cluster age, and ESA Gaia DR3 / NASA IPAC 2MASS provenance.
- **Resilient Edge Caching & Proxies**:
  - **`/api/gaia/*`**: High-performance proxy for ESA Gaia DR3 TAP queries with deterministic SHA-256 body-keyed edge caching (7-day TTL via `caches.default`).
  - **`/api/nasa/*`**: High-performance proxy for NASA IPAC/IRSA 2MASS and STScI MAST TAP queries with deterministic SHA-256 body-keyed edge caching.
  - **`/api/skyview/*`**: NASA Goddard SkyView cutout proxy with CORS injection and 30-day edge caching, preventing canvas-tainting during 300 DPI exports.
  - **`/api/hips/*`**: IVOA CDS hips2fits cutout proxy with CORS injection and 30-day edge caching.
  - Client-side in-memory and `localStorage` quota-evicted caching.

## Development

```bash
# Run the StarPlot dev server (http://localhost:3001)
npm run dev --workspace=starplot

# Run unit tests
npm run test --workspace=starplot

# Build for production
npm run build --workspace=starplot
```
