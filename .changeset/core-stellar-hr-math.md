---
"@skyscout/core": minor
---

Add stellar distance, absolute magnitude, luminosity, and H-R diagram photometry utilities:
- `parallaxToDistanceParsecs` and `parallaxToDistanceLightYears` for converting parallax in milliarcseconds ($\varpi$) to physical distances.
- `distanceModulus` and `distanceParsecsToModulus` for calculating astronomical distance modulus ($\mu = m - M$).
- `apparentToAbsoluteMag` for computing absolute magnitude ($M_G = G + 5 + 5 \log_{10}(\varpi / 1000) - A_G$) with optional interstellar extinction.
- `absoluteMagToLogLuminosity` and `absoluteMagToLuminositySolar` for calculating relative stellar luminosity ($\log_{10}(L / L_\odot)$ and $L / L_\odot$).
- `calculateBpRpColor`, `bpRpToEffectiveTempK`, and `bpRpToSpectralClass` for Gaia $(G_{\text{BP}} - G_{\text{RP}})$ color index, effective temperature ($T_{\text{eff}}$), and Morgan-Keenan spectral classification.
