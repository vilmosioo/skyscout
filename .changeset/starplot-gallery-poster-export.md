---
"starplot": minor
---

Add 18" × 24" (300 DPI) Gallery Poster Generator and Museum Plaque Layout for fine-art printing:
- `renderGalleryPosterCanvas`: Renders a high-resolution 5400 × 7200 px (3:4 portrait) print canvas at true 300 DPI for physical printing and Etsy sales.
- Clean Museum Edition Plaque Block: Displays uppercase cluster title, subtitle, horizontal divider rules, 5 metadata columns (Catalog ID, Classification, Coordinates J2000, Distance, and Cluster Age), and ESA Gaia DR3 provenance accreditation without promotional branding.
- One-Click High-Res Export: Wired `handleExportPoster` in `ChartView` with off-screen canvas rendering, memory-safe `canvas.toBlob(...)` export, and an interactive rendering indicator button (`🖼️ Export 18×24" Poster (300 DPI)`).
- Visual Polish: Cleaned up chart labels and removed cached tags for a minimal presentation.
