# @skyscout/gaia-client

## 1.0.0

### Major Changes

- Initial release of `@skyscout/gaia-client`:
  - Pure, environment-agnostic TypeScript client for the public ESA Gaia Archive (`https://gea.esac.esa.int/tap-server/tap/sync`).
  - High-level, ADQL-free query methods (`coneSearch`, `searchByDistance`, `searchStars`, `getStarById`) plus raw `queryAdql` escape hatch.
  - Lossless 64-bit integer parser preserving 19-digit Gaia DR3 `source_id` identifiers in TAP tabular JSON responses.
  - Automatic physical enrichment mapping raw `gaiadr3.gaia_source` rows to camelCase `GaiaStar` objects (`distancePc`, `distanceLy`, `absoluteMagG`, `logLuminositySolar`, `teffK`, `spectralClass`) powered by `@skyscout/core`.
