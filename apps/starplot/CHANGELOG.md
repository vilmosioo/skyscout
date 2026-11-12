# starplot

## 0.5.0

### Minor Changes

- d17d498: Introduce dedicated image cutout clients for astronomical survey imagery and embed photographic plates into fine-art posters:
  - **`@skyscout/skyview-client`**: Fully-typed TypeScript client for NASA Goddard SkyView image service (2MASS, WISE, DSS, GALEX, SDSS). All imagery generated is in the United States Public Domain (17 U.S.C. § 105), unencumbered for physical art prints and commercial posters.
  - **`@skyscout/hips-client`**: Fully-typed TypeScript client for IVOA HiPS and CDS `hips2fits` astronomical image cutouts (DSS2 Color, 2MASS Color, Pan-STARRS, unWISE).
  - **Photographic Sky Plate & Highlighted Stars in StarPlot**:
    - Embedded real telescope imagery (NASA 2MASS / DSS2) directly inside the top celestial disc of the _Two Maps_ theme (`THE SKY — WHERE THE STARS ARE`).
    - Highlighted famous and brightest stars (e.g. Alcyone, Mirfak, κ Crucis, BM Scorpii, Sirius, Vega) in both the top celestial sky disc and bottom H–R diagram with multi-layer radial glowing halos, target reticle rings, white pinpoint cores, and architectural leader callout labels.
    - Rendered prominent glowing dual-beam connecting strands linking the brightest stars from their real sky position directly into the H–R diagram curve (`Lines join the brightest stars`).
    - Added interactive toggle in the poster view to switch between 2MASS Infrared (NASA), DSS2 Optical Color, and pure vector mode.
    - Included the real space telescope plate in full 300 DPI 18×24" master exports with official public domain credit lines.
- bf537cd: Significantly simplify StarPlot into a dedicated Fine-Art Poster Studio powered by NASA 2MASS data with 3 museum poster themes:
  - Home Grid View (`/`): Direct, distraction-free grid of all 33 star clusters featuring real-time thumbnail previews matching the selected theme and metadata (distance, constellation, age).
  - Dedicated Cluster Poster Page (`/cluster/:id`): Single-cluster view rendering high-resolution 3:4 canvas posters across 3 curated themes:
    1. **Two Maps** (`two-maps`): Celestial sky disc above, boxed H–R diagram below, joined by delicate luminous Bézier threads connecting each star's sky position to its physical state.
    2. **Star Quilt** (`star-quilt`): Archival cream background (`#f7f4ed`) with binned patchwork tiles along the H–R sequence featuring authentic inset dashed stitching (`[8, 6]`) color-coded by spectral class.
    3. **Night Fall / Cascade** (`night-fall`): Frameless pitch-black cosmic canvas with luminous streaming S-curves cascading from the celestial cluster directly into the H–R sequence.
  - NASA 2MASS Integration with Heavy Caching: Powered by `@skyscout/nasa-client`, fetching near-infrared 2MASS cluster data with in-memory deduplication and persistent `localStorage` caching. Instant synthesized fallback ensures 0ms render latency.
  - Direct 300 DPI Poster Download: 1-click `📥 Download 18×24"` button generating full 5,400 × 7,200 px lossless PNGs (Gelato & Printify production-ready) customized to the active theme.
  - Clutter Removed: Stripped complex multi-cluster selection drawers, 6-field coordinate search forms, star inspection hover tooltips, and non-essential UI controls.

### Patch Changes

- Updated dependencies [d17d498]
  - @skyscout/skyview-client@1.1.0
  - @skyscout/hips-client@1.1.0

## 0.4.0

### Minor Changes

- 1314f56: Add 18" × 24" (300 DPI) Gallery Poster Generator and Museum Plaque Layout for fine-art printing:
  - `renderGalleryPosterCanvas`: Renders a high-resolution 5400 × 7200 px (3:4 portrait) print canvas at true 300 DPI for physical printing and Etsy sales.
  - Clean Museum Edition Plaque Block: Displays uppercase cluster title, subtitle, horizontal divider rules, 5 metadata columns (Catalog ID, Classification, Coordinates J2000, Distance, and Cluster Age), and ESA Gaia DR3 provenance accreditation without promotional branding.
  - One-Click High-Res Export: Wired `handleExportPoster` in `ChartView` with off-screen canvas rendering, memory-safe `canvas.toBlob(...)` export, and an interactive rendering indicator button (`🖼️ Export 18×24" Poster (300 DPI)`).
  - Visual Polish: Cleaned up chart labels and removed cached tags for a minimal presentation.

### Patch Changes

- 1314f56: Improve ESA Gaia TAP resilience, error sanitization, and offline cluster fallbacks:
  - `@skyscout/gaia-client`:
    - `extractTapErrorMessage`: Strips raw HTML markup, CSS styles, and server debug boilerplate from TAP HTTP error responses (e.g. 503 Service Overloaded, 500, 502, 504), providing clean human-readable descriptions.
    - Automatic exponential backoff retries: Added `retries` and `retryDelayMs` options (default 2 retries) on transient 500/502/503/504, 429, and network/timeout failures.
  - `starplot`:
    - `generateClusterFallbackStars`: Provides high-precision, physics-accurate synthesized fallback star datasets for all curated cluster presets whenever live Gaia TAP queries fail or time out.
    - Cloudflare Edge Cache API (`functions/gaia-tap/[[path]].ts`): Added deterministic SHA-256 body-hashed edge caching for TAP `POST` requests via Cloudflare `caches.default` (7-day TTL), preventing repetitive upstream hits to ESA.
    - Resilient UI: Displays an informative service banner with a one-click `🔄 Retry Live Query` action instead of dumping raw HTML or failing with zero stars, ensuring uninterrupted exploration and poster generation.
- Updated dependencies [1314f56]
  - @skyscout/gaia-client@2.0.2

## 0.3.0

### Minor Changes

- b36d808: Add `wouter` routing (`/` cluster grid & `/chart/:id`), 33-cluster Messier/NGC/Caldwell catalog, Constant Radius (`R☉`) overlays, and Custom Sky Cone Search:
  - `/` Home Page (`HomeCatalogView`): Searchable, filterable grid of 33 star clusters (Solar Neighborhood `< 50 pc`, 20 Open Clusters spanning `~12 Myr` to `~6.8 Gyr`, and 12 ancient Globular Clusters) with instant procedural H–R thumbnail canvases (`generateClusterPreviewPoints`) and `✓ Live Cached` indicators.
  - `/chart/:id` Interactive Chart Page (`ChartView`): Multi-cluster layering, Stefan–Boltzmann Constant Stellar Radius curves (`computeConstantRadiusCurve`, `0.01 R☉` to `1000 R☉`), and polished high-res print poster layout preventing title/spectral header collision.
  - `/chart/custom` Custom Sky Cone Search: Direct coordinate query interface (`fetchCustomConeStars`) for querying any `(RA, Dec, Radius, Distance)` field from ESA Gaia DR3.

## 0.2.1

### Patch Changes

- 248ed7b: Refine H–R diagram stardust rendering, Classic Powell color scheme, and request caching:
  - Reduce star dot radius (`computeStarCanvasRadius`, `0.55px–1.20px`) with additive blending and a `12px` hover hit-testing radius (`findClosestStarAtPoint`).
  - Update default `blackbody` theme to the Classic Wikipedia / Richard Powell palette on a `#000000` background with top Spectral Class (`O B A F G K M`) and Surface Temperature (`30000K–3000K`) ticks, left Solar Luminosity (`Sun = 1`) axis, and right Absolute Magnitude (`M_G`) axis.
  - Deduplicate concurrent in-flight TAP requests (`inFlightRequests`) under React `StrictMode` and evict older `localStorage` entries on `QuotaExceededError`.

## 0.2.0

### Minor Changes

- 04d5ccd: Initial release of the StarPlot web application (`apps/starplot`, private):
  - Minimal, live HTML5 Canvas Hertzsprung-Russell (H-R) diagram powered by `@skyscout/gaia-client` and `@skyscout/core`.
  - Live presets for the Solar Neighborhood (`< 50 pc`), Pleiades (`M45`), and Messier 67 (`M67`).
  - Tested coordinate projection, blackbody color mapping, and preset query dispatch.

### Patch Changes

- Updated dependencies [e755724]
  - @skyscout/gaia-client@2.0.1
