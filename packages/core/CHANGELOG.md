# @skyscout/core

## 0.2.0

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
