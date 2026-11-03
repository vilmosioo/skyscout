# StarPlot (`apps/starplot`)

Interactive, live Hertzsprung–Russell (H–R) diagram web application powered by [`@skyscout/gaia-client`](../../packages/gaia-client) and [`@skyscout/core`](../../packages/core).

## Features

- **`wouter` Multi-Route Architecture**:
  - **`/` (Home Cluster Catalog Grid)**: Browse and filter **33 curated Messier, NGC & Caldwell star clusters** (`Solar Neighborhood (< 50 pc)`, 20 Open Clusters spanning `~12 Myr` to `~6.8 Gyr`, and 12 ancient Globular Clusters) with instant mini H–R diagram thumbnail canvases and a **Custom Sky Cone Search** form.
  - **`/chart/:id` (Interactive H–R Diagram)**: Deep-dive into any cluster (or `/chart/custom?...` coordinate cone) and layer multiple clusters together for stellar evolution comparison.
- **Astrophysical Overlays**:
  - **📏 Constant Stellar Radius Lines (`R☉`)**: Plot Stefan–Boltzmann constant-radius curves from `0.01 R☉` (White Dwarfs) up to `1000 R☉` (Red Supergiants).
- **Pinpoint Stardust HTML5 Canvas Rendering**:
  - Plots `G_BP - G_RP` vs. Absolute Magnitude (`M_G`) & Solar Luminosity (`Sun = 1`) with fine `0.55px–1.20px` stardust points, additive glow, and 5 color themes (`Classic H–R (Wikipedia / Powell)`, `Cosmic Ultraviolet`, `Aurora Borealis`, `JWST Infrared Gold`, and `Archival Print`).
  - Interactive mouse-wheel zoom, click-drag pan, star inspector card (`ESASky`, `VizieR Gaia DR3`, `SIMBAD`), and **3000×2100 px Print Poster PNG Export**.

## Development

```bash
# Run the StarPlot dev server (http://localhost:3001)
npm run dev --workspace=starplot

# Run unit tests
npm run test --workspace=starplot

# Build for production
npm run build --workspace=starplot
```
