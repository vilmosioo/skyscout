# @skyscout/lasair-client

## 2.0.2

### Patch Changes

- 3995343: Add Cloudflare Pages Function edge proxies, Vite development proxies, and fix fetch execution context across clients:
  - **Fetch Receiver Fix**: Wrapped `globalThis.fetch` in explicit function calls across `@skyscout/nasa-client`, `@skyscout/gaia-client`, `@skyscout/lasair-client`, `@skyscout/hips-client`, and `@skyscout/skyview-client` to prevent browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` errors when invoked as instance getters or unbound references.
  - **Lasair (`/api/lasair/*`)**: Server-side `LASAIR_TOKEN` injection from Cloudflare environment secrets, CORS preflight handling, and 24-hour edge caching for historical light curves.
  - **NASA TAP (`/api/nasa/*`)**: Edge proxy for IPAC (2MASS) and STScI (MAST) TAP endpoints with deterministic SHA-256 body-keyed edge caching (7-day TTL).
  - **NASA SkyView (`/api/skyview/*`)**: NASA GSFC SkyView image cutout proxy with CORS headers and 30-day edge caching, preventing canvas-tainting during 300 DPI exports.
  - **CDS HiPS (`/api/hips/*`)**: IVOA CDS hips2fits image cutout proxy with CORS headers and 30-day edge caching.
  - **`@skyscout/lasair-client`**: Made `token` optional when configured with an authenticated proxy endpoint.
  - **Web Apps**: Updated `skyscout` and `starplot` to route through proxies without baking secret tokens into client bundles.

## 2.0.1

### Patch Changes

- 2545525: Replace raw LaTeX notation in `README.md` with clean Unicode and inline code so mathematical expressions render properly on npmjs.com.

## 2.0.1

### Patch Changes

- Replace raw LaTeX notation in `README.md` with clean Unicode and inline code so mathematical expressions render properly on npmjs.com.

## 2.0.0

### Major Changes

- 59f6d90: Updated badge in readme to valid CI link

### Patch Changes

- Updated dependencies [59f6d90]
  - @skyscout/core@1.0.0

## 1.0.0

### Major Changes

- 6d11cc0: Added new function getLasairSourceUrl

### Minor Changes

- 5f2039e: Initial release of `@skyscout/core` and `@skyscout/lasair-client`:
  - Extracted telescope-agnostic astronomical mathematics and coordinate geometry into `@skyscout/core`:
    - Time: Modified Julian Date (MJD) <-> JavaScript Date <-> Julian Date (JD).
    - Photometry: PSF flux (nanoJanskys) <-> AB magnitude, error propagation via Taylor expansion, SNR calculation.
    - Coordinates: Decimal <-> sexagesimal conversions (HMS for RA, DMS for Dec), formatting, and great-circle angular separation via spherical Vincenty formula.
  - `@skyscout/lasair-client`:
    - Fully-typed TypeScript client for the Lasair Rubin / LSST transient broker.
    - Lossless 64-bit integer ID parser preventing precision corruption on 18-digit Rubin DIA object/source IDs.
    - Implements `query`, `cone`, `object`, `sherlockObject`, `sherlockPosition`, `annotate`, and `annotateList` methods.
    - Re-exports shared core utilities from `@skyscout/core`.
    - Dual ESM and CommonJS pre-bundled outputs with full type declarations.

### Patch Changes

- Updated dependencies [5f2039e]
  - @skyscout/core@0.2.0
