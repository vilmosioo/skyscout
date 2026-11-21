# @skyscout/nasa-client

## 2.0.1

### Patch Changes

- 3995343: Add Cloudflare Pages Function edge proxies, Vite development proxies, and fix fetch execution context across clients:
  - **Fetch Receiver Fix**: Wrapped `globalThis.fetch` in explicit function calls across `@skyscout/nasa-client`, `@skyscout/gaia-client`, `@skyscout/lasair-client`, `@skyscout/hips-client`, and `@skyscout/skyview-client` to prevent browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` errors when invoked as instance getters or unbound references.
  - **Lasair (`/api/lasair/*`)**: Server-side `LASAIR_TOKEN` injection from Cloudflare environment secrets, CORS preflight handling, and 24-hour edge caching for historical light curves.
  - **NASA TAP (`/api/nasa/*`)**: Edge proxy for IPAC (2MASS) and STScI (MAST) TAP endpoints with deterministic SHA-256 body-keyed edge caching (7-day TTL).
  - **NASA SkyView (`/api/skyview/*`)**: NASA GSFC SkyView image cutout proxy with CORS headers and 30-day edge caching, preventing canvas-tainting during 300 DPI exports.
  - **CDS HiPS (`/api/hips/*`)**: IVOA CDS hips2fits image cutout proxy with CORS headers and 30-day edge caching.
  - **`@skyscout/lasair-client`**: Made `token` optional when configured with an authenticated proxy endpoint.
  - **Web Apps**: Updated `skyscout` and `starplot` to route through proxies without baking secret tokens into client bundles.

## 2.0.0

### Major Changes

- 19e5ef6: Add `@skyscout/nasa-client`: Fully-typed TypeScript client for NASA Public Domain astronomical archives:
  - NASA IPAC / IRSA: 2MASS All-Sky Point Source Catalog (`fp_psc`) with near-infrared $J - K_s$ color computation.
  - STScI MAST: TESS Input Catalog (TIC v8.2) with direct stellar physical parameters ($T_{\rm eff}$, radius $R_\odot$, mass $M_\odot$, luminosity $L_\odot$).
  - Web-standard `fetch`, configurable timeouts, exponential backoff retries, and clean error hierarchy (`NasaError`, `NasaRateLimitError`, `NasaRequestError`, `NasaTimeoutError`, `NasaParseError`).
  - 100% U.S. Public Domain data compliant for unrestricted commercial use.
