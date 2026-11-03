# starplot

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
