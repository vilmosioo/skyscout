# skyscout

## 0.2.1

### Patch Changes

- 3995343: Add Cloudflare Pages Function edge proxies, Vite development proxies, and fix fetch execution context across clients:
  - **Fetch Receiver Fix**: Wrapped `globalThis.fetch` in explicit function calls across `@skyscout/nasa-client`, `@skyscout/gaia-client`, `@skyscout/lasair-client`, `@skyscout/hips-client`, and `@skyscout/skyview-client` to prevent browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` errors when invoked as instance getters or unbound references.
  - **Lasair (`/api/lasair/*`)**: Server-side `LASAIR_TOKEN` injection from Cloudflare environment secrets, CORS preflight handling, and 24-hour edge caching for historical light curves.
  - **NASA TAP (`/api/nasa/*`)**: Edge proxy for IPAC (2MASS) and STScI (MAST) TAP endpoints with deterministic SHA-256 body-keyed edge caching (7-day TTL).
  - **NASA SkyView (`/api/skyview/*`)**: NASA GSFC SkyView image cutout proxy with CORS headers and 30-day edge caching, preventing canvas-tainting during 300 DPI exports.
  - **CDS HiPS (`/api/hips/*`)**: IVOA CDS hips2fits image cutout proxy with CORS headers and 30-day edge caching.
  - **`@skyscout/lasair-client`**: Made `token` optional when configured with an authenticated proxy endpoint.
  - **Web Apps**: Updated `skyscout` and `starplot` to route through proxies without baking secret tokens into client bundles.
- Updated dependencies [3995343]
  - @skyscout/lasair-client@2.0.2

## 0.2.0

### Minor Changes

- 3026db3: Initial release of the SkyScout web application (`apps/skyscout`, private):

  - Interactive Discovery Feed with visual card grid and live Canvas difference image stamp previews.
  - Client-side routing with `wouter` (`/`, `/cards`, `/console`).
  - Multi-tool Scout Console with transient SQL queries, celestial cone search, DIA photometry table, Sherlock context classifier, and annotation broadcaster.
  - DIA Cutout Image Triplet viewer (Template, Science, Difference) with astronomical colormaps and reticle crosshair.
  - Authentication configured via Vite environment variables (`VITE_SKYSCOUT_TOKEN`).
  - Marked as private to prevent npm package publication.
