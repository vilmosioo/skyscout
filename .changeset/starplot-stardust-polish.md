---
"starplot": patch
---

Refine H–R diagram stardust rendering, Classic Powell color scheme, and request caching:
- Reduce star dot radius (`computeStarCanvasRadius`, `0.55px–1.20px`) with additive blending and a `12px` hover hit-testing radius (`findClosestStarAtPoint`).
- Update default `blackbody` theme to the Classic Wikipedia / Richard Powell palette on a `#000000` background with top Spectral Class (`O B A F G K M`) and Surface Temperature (`30000K–3000K`) ticks, left Solar Luminosity (`Sun = 1`) axis, and right Absolute Magnitude (`M_G`) axis.
- Deduplicate concurrent in-flight TAP requests (`inFlightRequests`) under React `StrictMode` and evict older `localStorage` entries on `QuotaExceededError`.
