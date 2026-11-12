---
"starplot": minor
---

Significantly simplify StarPlot into a dedicated Fine-Art Poster Studio powered by NASA 2MASS data with 3 museum poster themes:
- Home Grid View (`/`): Direct, distraction-free grid of all 33 star clusters featuring real-time thumbnail previews matching the selected theme and metadata (distance, constellation, age).
- Dedicated Cluster Poster Page (`/cluster/:id`): Single-cluster view rendering high-resolution 3:4 canvas posters across 3 curated themes:
  1. **Two Maps** (`two-maps`): Celestial sky disc above, boxed H–R diagram below, joined by delicate luminous Bézier threads connecting each star's sky position to its physical state.
  2. **Star Quilt** (`star-quilt`): Archival cream background (`#f7f4ed`) with binned patchwork tiles along the H–R sequence featuring authentic inset dashed stitching (`[8, 6]`) color-coded by spectral class.
  3. **Night Fall / Cascade** (`night-fall`): Frameless pitch-black cosmic canvas with luminous streaming S-curves cascading from the celestial cluster directly into the H–R sequence.
- NASA 2MASS Integration with Heavy Caching: Powered by `@skyscout/nasa-client`, fetching near-infrared 2MASS cluster data with in-memory deduplication and persistent `localStorage` caching. Instant synthesized fallback ensures 0ms render latency.
- Direct 300 DPI Poster Download: 1-click `📥 Download 18×24"` button generating full 5,400 × 7,200 px lossless PNGs (Gelato & Printify production-ready) customized to the active theme.
- Clutter Removed: Stripped complex multi-cluster selection drawers, 6-field coordinate search forms, star inspection hover tooltips, and non-essential UI controls.
