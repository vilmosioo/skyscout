# StarPlot (`apps/starplot`)

Interactive, live Hertzsprung–Russell (H–R) diagram web application powered by [`@skyscout/gaia-client`](../../packages/gaia-client) and [`@skyscout/core`](../../packages/core).

## Features

- **Live ESA Gaia DR3 Queries**: Fetches up to 1,000 real stars per target directly from the ESA Gaia Archive TAP API (`gaiadr3.gaia_source`) with zero API keys required, caching responses in `localStorage`.
- **16 Curated Astrophysical Targets**:
  - **Solar Volume**: `Solar Neighborhood (< 50 pc)`.
  - **Open Clusters (9 targets)**: Double Cluster (`h & χ Per`), `α Persei`, `M45 Pleiades`, `M35`, `M11 Wild Duck`, `M37`, `Hyades`, `M44 Beehive`, and `M67`.
  - **Globular Clusters (6 targets)**: `M4`, `47 Tucanae`, `ω Centauri`, `M13 Hercules`, `M5`, and `M3`.
- **Pinpoint Stardust HTML5 Canvas Rendering**:
  - Plots `G_BP - G_RP` vs. Absolute Magnitude (`M_G`) & Solar Luminosity (`Sun = 1`) with fine `0.55px–1.20px` stardust points, additive glow, and smoothly interpolated colors across 5 themes (`Classic H–R (Wikipedia / Powell)`, `Cosmic Ultraviolet`, `Aurora Borealis`, `JWST Infrared Gold`, and `Archival Print`).
  - Interactive mouse-wheel zoom, click-drag pan, and a **3000×2100 px Print Poster PNG Export**.
  - Star inspector card with evolutionary stage, luminosity (`L☉`), estimated radius (`R☉`), and direct links to **ESASky**, **VizieR Gaia DR3**, and **SIMBAD**.

## Development

```bash
# Run the StarPlot dev server (http://localhost:3001)
npm run dev --workspace=starplot

# Run unit tests
npm run test --workspace=starplot

# Build for production
npm run build --workspace=starplot
```
