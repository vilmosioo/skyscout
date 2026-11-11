---
"@skyscout/nasa-client": major
---

Add `@skyscout/nasa-client`: Fully-typed TypeScript client for NASA Public Domain astronomical archives:
- NASA IPAC / IRSA: 2MASS All-Sky Point Source Catalog (`fp_psc`) with near-infrared $J - K_s$ color computation.
- STScI MAST: TESS Input Catalog (TIC v8.2) with direct stellar physical parameters ($T_{\rm eff}$, radius $R_\odot$, mass $M_\odot$, luminosity $L_\odot$).
- Web-standard `fetch`, configurable timeouts, exponential backoff retries, and clean error hierarchy (`NasaError`, `NasaRateLimitError`, `NasaRequestError`, `NasaTimeoutError`, `NasaParseError`).
- 100% U.S. Public Domain data compliant for unrestricted commercial use.
