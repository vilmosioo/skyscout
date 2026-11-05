---
"@skyscout/gaia-client": patch
"starplot": patch
---

Improve ESA Gaia TAP resilience, error sanitization, and offline cluster fallbacks:
- `@skyscout/gaia-client`:
  - `extractTapErrorMessage`: Strips raw HTML markup, CSS styles, and server debug boilerplate from TAP HTTP error responses (e.g. 503 Service Overloaded, 500, 502, 504), providing clean human-readable descriptions.
  - Automatic exponential backoff retries: Added `retries` and `retryDelayMs` options (default 2 retries) on transient 500/502/503/504, 429, and network/timeout failures.
- `starplot`:
  - `generateClusterFallbackStars`: Provides high-precision, physics-accurate synthesized fallback star datasets for all curated cluster presets whenever live Gaia TAP queries fail or time out.
  - Resilient UI: Displays an informative service banner with a one-click `🔄 Retry Live Query` action instead of dumping raw HTML or failing with zero stars, ensuring uninterrupted exploration and poster generation.
