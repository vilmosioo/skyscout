# starplot

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
