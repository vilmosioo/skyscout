# StarPlot (`apps/starplot`)

Minimal, live Hertzsprung–Russell (H–R) diagram web application powered by [`@skyscout/gaia-client`](../../packages/gaia-client) and [`@skyscout/core`](../../packages/core).

## Features

- **Live ESA Gaia DR3 Queries**: Fetches up to 1,000 real stars directly from the ESA Gaia Archive TAP API (`gaiadr3.gaia_source`) with zero API keys required.
- **Three Curated Astrophysical Targets**:
  - **Solar Neighborhood (`< 25 pc`)**: Volume-limited nearby stars showing the full Main Sequence and the White Dwarf cooling sequence.
  - **Pleiades (`M45`)**: Young open cluster (~115 Myr) with luminous blue B-type stars.
  - **Messier 67 (`M67`)**: Old open cluster (~4 Gyr) with a clear Main Sequence turnoff and Red Giant Branch.
- **Fast HTML5 Canvas Rendering**: Plots $(G_{\text{BP}} - G_{\text{RP}})$ vs. Absolute Magnitude ($M_G$) with blackbody stellar colors, a Solar reference marker (`☉ Sun`), and hover inspection.

## Development

```bash
# Run the StarPlot dev server (http://localhost:3001)
npm run dev --workspace=starplot

# Run unit tests
npm run test --workspace=starplot

# Build for production
npm run build --workspace=starplot
```
