# @skyscout/gaia-client

## 2.0.4

### Patch Changes

- 631234f: Remove fetch dependency injection, `this.fetch` properties, and unbound instance fetch getters across all API clients. Invoke web-standard global `fetch(...)` directly to eliminate browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation`.

## 2.0.3

### Patch Changes

- 3995343: Add Cloudflare Pages Function edge proxies, Vite development proxies, and fix fetch execution context across clients:
  - **Fetch Receiver Fix**: Wrapped `globalThis.fetch` in explicit function calls across `@skyscout/nasa-client`, `@skyscout/gaia-client`, `@skyscout/lasair-client`, `@skyscout/hips-client`, and `@skyscout/skyview-client` to prevent browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` errors when invoked as instance getters or unbound references.
  - **Lasair (`/api/lasair/*`)**: Server-side `LASAIR_TOKEN` injection from Cloudflare environment secrets, CORS preflight handling, and 24-hour edge caching for historical light curves.
  - **NASA TAP (`/api/nasa/*`)**: Edge proxy for IPAC (2MASS) and STScI (MAST) TAP endpoints with deterministic SHA-256 body-keyed edge caching (7-day TTL).
  - **NASA SkyView (`/api/skyview/*`)**: NASA GSFC SkyView image cutout proxy with CORS headers and 30-day edge caching, preventing canvas-tainting during 300 DPI exports.
  - **CDS HiPS (`/api/hips/*`)**: IVOA CDS hips2fits image cutout proxy with CORS headers and 30-day edge caching.
  - **`@skyscout/lasair-client`**: Made `token` optional when configured with an authenticated proxy endpoint.
  - **Web Apps**: Updated `skyscout` and `starplot` to route through proxies without baking secret tokens into client bundles.

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
