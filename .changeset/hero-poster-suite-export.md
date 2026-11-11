---
"starplot": minor
---

Add Print-Ready Hero Poster Collection Suite, dedicated in-app Poster Gallery, and instant catalog export:
- Dedicated `/gallery` Route: Interactive museum poster gallery room with live 3:4 canvas rendering, room wall backdrop, realistic mat board and frame mockup options (Natural Oak, Matte Black, Gallery White), theme switcher (Classic Black, Archival Cream, JWST Gold, Cosmic UV), solar radius curves toggle, and 300 DPI master download button.
- Added `downloadGalleryPoster`: Generates and triggers instant 18" × 24" at 300 DPI (`5400 × 7200 px`) PNG poster downloads for any preset using cached or high-precision synthesized stars.
- Fixed duplicate catalog codes in poster typography: Added `formatPosterTitle` to cleanly format cluster headers without redundancy (e.g. `M45 · M45 PLEIADES` is now cleanly `M45 · PLEIADES`).
- Home Page Collection Suite: Added a dedicated top hero bar on `/` featuring the "Launch 5" bestsellers (Pleiades M45, Hercules M13, Hyades, Double Cluster, Solar Neighborhood) with theme selection (Classic Black, Archival Cream, JWST Gold, Ultraviolet) and a sequential batch download button.
- Instant Card Exports: Added an inline `🖼️ 18×24"` quick-download button on every cluster card in the catalog grid.
- Navigation: Added `🖼️ Poster Gallery` action links in headers across the catalog home view and multi-cluster chart view.
