---
"starplot": patch
---

Replace in-memory fallback star generation with viewport-aware live NASA 2MASS queries (`/api/nasa/ipac/sync`) backed by Cloudflare edge caching (7-day TTL) and client `localStorage`.
