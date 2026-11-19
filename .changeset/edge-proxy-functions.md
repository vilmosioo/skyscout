---
"@skyscout/lasair-client": patch
"skyscout": patch
"starplot": patch
---

Add Cloudflare Pages Function edge proxies and Vite development proxies for Lasair, NASA IPAC/MAST, NASA SkyView, and CDS HiPS:
- **Lasair (`/api/lasair/*`)**: Server-side `LASAIR_TOKEN` injection from Cloudflare environment secrets, CORS preflight handling, and 24-hour edge caching for historical light curves.
- **NASA TAP (`/api/nasa/*`)**: Edge proxy for IPAC (2MASS) and STScI (MAST) TAP endpoints with deterministic SHA-256 body-keyed edge caching (7-day TTL).
- **NASA SkyView (`/api/skyview/*`)**: NASA GSFC SkyView image cutout proxy with CORS headers and 30-day edge caching, preventing canvas-tainting during 300 DPI exports.
- **CDS HiPS (`/api/hips/*`)**: IVOA CDS hips2fits image cutout proxy with CORS headers and 30-day edge caching.
- **`@skyscout/lasair-client`**: Made `token` optional when configured with an authenticated proxy endpoint.
- **Web App**: Updated `skyscout` UI to run seamlessly without baking secret tokens into client bundles.
