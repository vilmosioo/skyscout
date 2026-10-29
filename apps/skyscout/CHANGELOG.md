# skyscout

## 0.2.0

### Minor Changes

- 3026db3: Initial release of the SkyScout web application (`apps/skyscout`, private):

  - Interactive Discovery Feed with visual card grid and live Canvas difference image stamp previews.
  - Client-side routing with `wouter` (`/`, `/cards`, `/console`).
  - Multi-tool Scout Console with transient SQL queries, celestial cone search, DIA photometry table, Sherlock context classifier, and annotation broadcaster.
  - DIA Cutout Image Triplet viewer (Template, Science, Difference) with astronomical colormaps and reticle crosshair.
  - Authentication configured via Vite environment variables (`VITE_SKYSCOUT_TOKEN`).
  - Marked as private to prevent npm package publication.
