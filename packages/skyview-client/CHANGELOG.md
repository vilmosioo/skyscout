# @skyscout/skyview-client

## 1.1.2

### Patch Changes

- 631234f: Remove fetch dependency injection, `this.fetch` properties, and unbound instance fetch getters across all API clients. Invoke web-standard global `fetch(...)` directly to eliminate browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation`.

## 1.1.1

### Patch Changes

- 3995343: Add Cloudflare Pages Function edge proxies, Vite development proxies, and fix fetch execution context across clients:
  - **Fetch Receiver Fix**: Wrapped `globalThis.fetch` in explicit function calls across `@skyscout/nasa-client`, `@skyscout/gaia-client`, `@skyscout/lasair-client`, `@skyscout/hips-client`, and `@skyscout/skyview-client` to prevent browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` errors when invoked as instance getters or unbound references.
  - **Lasair (`/api/lasair/*`)**: Server-side `LASAIR_TOKEN` injection from Cloudflare environment secrets, CORS preflight handling, and 24-hour edge caching for historical light curves.
  - **NASA TAP (`/api/nasa/*`)**: Edge proxy for IPAC (2MASS) and STScI (MAST) TAP endpoints with deterministic SHA-256 body-keyed edge caching (7-day TTL).
  - **NASA SkyView (`/api/skyview/*`)**: NASA GSFC SkyView image cutout proxy with CORS headers and 30-day edge caching, preventing canvas-tainting during 300 DPI exports.
  - **CDS HiPS (`/api/hips/*`)**: IVOA CDS hips2fits image cutout proxy with CORS headers and 30-day edge caching.
  - **`@skyscout/lasair-client`**: Made `token` optional when configured with an authenticated proxy endpoint.
  - **Web Apps**: Updated `skyscout` and `starplot` to route through proxies without baking secret tokens into client bundles.

## 1.1.0

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
