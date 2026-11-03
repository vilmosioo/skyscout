---
"starplot": minor
---

Add `wouter` routing (`/` cluster grid & `/chart/:id`), 33-cluster Messier/NGC/Caldwell catalog, Constant Radius (`R☉`) overlays, and Custom Sky Cone Search:
- `/` Home Page (`HomeCatalogView`): Searchable, filterable grid of 33 star clusters (Solar Neighborhood `< 50 pc`, 20 Open Clusters spanning `~12 Myr` to `~6.8 Gyr`, and 12 ancient Globular Clusters) with instant procedural H–R thumbnail canvases (`generateClusterPreviewPoints`) and `✓ Live Cached` indicators.
- `/chart/:id` Interactive Chart Page (`ChartView`): Multi-cluster layering, Stefan–Boltzmann Constant Stellar Radius curves (`computeConstantRadiusCurve`, `0.01 R☉` to `1000 R☉`), and polished high-res print poster layout preventing title/spectral header collision.
- `/chart/custom` Custom Sky Cone Search: Direct coordinate query interface (`fetchCustomConeStars`) for querying any `(RA, Dec, Radius, Distance)` field from ESA Gaia DR3.
