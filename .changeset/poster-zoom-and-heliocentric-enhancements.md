---
"starplot": minor
---

Enhance StarPlot with interactive poster zoom/pan, authentic Solar Neighborhood heliocentric mapping, and famous star callouts:

- **Interactive Zoom & Pan**:
  - Added smooth cursor-centered mouse wheel zooming (1× to 6×) and click-and-drag panning on the poster canvas stage.
  - Added double-click to toggle between 1× overview and 2.5× detailed inspection.
  - Added touch gesture support for mobile/tablet devices (pinch-to-zoom and one-finger drag).
  - Added floating glassmorphic zoom toolbar featuring `+` / `−` controls, live zoom percentage indicator, and one-click `⟲ Reset` view action.
- **Solar Neighborhood Heliocentric Mapping**:
  - Tailored `solar-50pc` preset to render an authentic 3D heliocentric distance projection centered on `☉ Sun (0 pc)` with concentric range rings at 10 pc (33 ly), 25 pc (82 ly), and 40 pc (130 ly).
  - Added iconic nearby stars (Sirius, Alpha Centauri, Vega, Arcturus, Procyon, Altair) with true astrophysical properties and distances.
- **Famous Cluster Stars & Bright Member Highlights**:
  - Added `FAMOUS_CLUSTER_STARS` catalog mapping iconic named stars across presets (e.g. Alcyone, Atlas, and Electra in Pleiades; Mirfak in Alpha Persei; κ Crucis in Jewel Box).
  - Rendered multi-layer glowing bezier strands, radial halos, reticle brackets, and typographic callouts connecting celestial coordinates to the H–R diagram.
- **Header Layout & Typography**:
  - Elevated poster titles, constellation, distance, and age metadata to the top of all poster themes (`Two Maps`, `Night Fall`, `Star Quilt`).
  - Added top-right header featuring catalog code and celestial coordinates (or solar bubble indicator).
  - Removed survey image cutout preloading to eliminate 404 network requests and maintain pure vector rendering at 300 DPI.
