---
"@skyscout/nasa-client": patch
"@skyscout/gaia-client": patch
"@skyscout/hips-client": patch
"@skyscout/skyview-client": patch
"@skyscout/lasair-client": patch
---

Remove fetch dependency injection, `this.fetch` properties, and unbound instance fetch getters across all API clients. Invoke web-standard global `fetch(...)` directly to eliminate browser `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation`.
