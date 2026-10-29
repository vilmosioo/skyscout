# @skyscout/core

## 1.1.0

### Minor Changes

- 8de44a1: Add stellar distance, absolute magnitude, luminosity, and H-R diagram photometry utilities:
  - `parallaxToDistanceParsecs` and `parallaxToDistanceLightYears` for converting parallax in milliarcseconds ($\varpi$) to physical distances.
  - `distanceModulus` and `distanceParsecsToModulus` for calculating astronomical distance modulus ($\mu = m - M$).
  - `apparentToAbsoluteMag` for computing absolute magnitude ($M_G = G + 5 + 5 \log_{10}(\varpi / 1000) - A_G$) with optional interstellar extinction.
  - `absoluteMagToLogLuminosity` and `absoluteMagToLuminositySolar` for calculating relative stellar luminosity ($\log_{10}(L / L_\odot)$ and $L / L_\odot$).
  - `calculateBpRpColor`, `bpRpToEffectiveTempK`, and `bpRpToSpectralClass` for Gaia $(G_{\text{BP}} - G_{\text{RP}})$ color index, effective temperature ($T_{\text{eff}}$), and Morgan-Keenan spectral classification.

## 1.1.0

### Minor Changes

- Add stellar distance, absolute magnitude, luminosity, and H-R diagram photometry utilities:
  - `parallaxToDistanceParsecs` and `parallaxToDistanceLightYears` for converting parallax in milliarcseconds ($\varpi$) to physical distances.
  - `distanceModulus` and `distanceParsecsToModulus` for calculating astronomical distance modulus ($\mu = m - M$).
  - `apparentToAbsoluteMag` for computing absolute magnitude ($M_G = G + 5 + 5 \log_{10}(\varpi / 1000) - A_G$) with optional interstellar extinction.
  - `absoluteMagToLogLuminosity` and `absoluteMagToLuminositySolar` for calculating relative stellar luminosity ($\log_{10}(L / L_\odot)$ and $L / L_\odot$).
  - `calculateBpRpColor`, `bpRpToEffectiveTempK`, and `bpRpToSpectralClass` for Gaia $(G_{\text{BP}} - G_{\text{RP}})$ color index, effective temperature ($T_{\text{eff}}$), and Morgan-Keenan spectral classification.

## 1.0.0

### Major Changes

- 59f6d90: Updated badge in readme to valid CI link

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
