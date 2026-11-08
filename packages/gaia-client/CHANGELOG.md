# @skyscout/gaia-client

## 2.0.2

### Patch Changes

- 1314f56: Improve ESA Gaia TAP resilience, error sanitization, and offline cluster fallbacks:
  - `@skyscout/gaia-client`:
    - `extractTapErrorMessage`: Strips raw HTML markup, CSS styles, and server debug boilerplate from TAP HTTP error responses (e.g. 503 Service Overloaded, 500, 502, 504), providing clean human-readable descriptions.
    - Automatic exponential backoff retries: Added `retries` and `retryDelayMs` options (default 2 retries) on transient 500/502/503/504, 429, and network/timeout failures.
  - `starplot`:
    - `generateClusterFallbackStars`: Provides high-precision, physics-accurate synthesized fallback star datasets for all curated cluster presets whenever live Gaia TAP queries fail or time out.
    - Cloudflare Edge Cache API (`functions/gaia-tap/[[path]].ts`): Added deterministic SHA-256 body-hashed edge caching for TAP `POST` requests via Cloudflare `caches.default` (7-day TTL), preventing repetitive upstream hits to ESA.
    - Resilient UI: Displays an informative service banner with a one-click `🔄 Retry Live Query` action instead of dumping raw HTML or failing with zero stars, ensuring uninterrupted exploration and poster generation.

## 2.0.1

### Patch Changes

- e755724: Simplify solar volume query options and presets.

## 2.0.0

### Major Changes

- 4470a82: Initial release of `@skyscout/gaia-client`:
  - Pure, environment-agnostic TypeScript client for the public ESA Gaia Archive (`https://gea.esac.esa.int/tap-server/tap/sync`).
  - High-level, ADQL-free query methods (`coneSearch`, `searchByDistance`, `searchStars`, `getStarById`) plus raw `queryAdql` escape hatch.
  - Lossless 64-bit integer parser preserving 19-digit Gaia DR3 `source_id` identifiers in TAP tabular JSON responses.
  - Automatic physical enrichment mapping raw `gaiadr3.gaia_source` rows to camelCase `GaiaStar` objects (`distancePc`, `distanceLy`, `absoluteMagG`, `logLuminositySolar`, `teffK`, `spectralClass`) powered by `@skyscout/core`.

## 1.0.0

### Major Changes

- Initial release of `@skyscout/gaia-client`:
  - Pure, environment-agnostic TypeScript client for the public ESA Gaia Archive (`https://gea.esac.esa.int/tap-server/tap/sync`).
  - High-level, ADQL-free query methods (`coneSearch`, `searchByDistance`, `searchStars`, `getStarById`) plus raw `queryAdql` escape hatch.
  - Lossless 64-bit integer parser preserving 19-digit Gaia DR3 `source_id` identifiers in TAP tabular JSON responses.
  - Automatic physical enrichment mapping raw `gaiadr3.gaia_source` rows to camelCase `GaiaStar` objects (`distancePc`, `distanceLy`, `absoluteMagG`, `logLuminositySolar`, `teffK`, `spectralClass`) powered by `@skyscout/core`.
