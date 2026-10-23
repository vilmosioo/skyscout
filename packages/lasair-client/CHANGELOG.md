# @skyscout/lasair-client

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
