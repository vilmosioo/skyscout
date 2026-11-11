import {
  NasaError,
  NasaParseError,
  NasaRateLimitError,
  NasaRequestError,
  NasaTimeoutError,
} from './errors';
import type {
  NasaClientConfig,
  NasaConeSearchOptions,
  TapJsonTabularResponse,
  TicStar,
  TwoMassStar,
} from './types';

export const DEFAULT_IPAC_TAP_ENDPOINT = 'https://irsa.ipac.caltech.edu/TAP';
export const DEFAULT_MAST_TAP_ENDPOINT = 'https://mast.stsci.edu/api/v0/tap';
const DEFAULT_TIMEOUT_MS = 45_000;

/**
 * Safely parses raw TAP JSON response text while preserving large 64-bit ID literals.
 */
export function parseLosslessNasaJson<T>(rawText: string): T {
  const preserved = rawText.replace(/([:\[,]\s*)(\d{15,})(\s*[,}\]])/g, '$1"$2"$3');
  return JSON.parse(preserved) as T;
}

/**
 * Converts a raw TAP response (either `{ metadata, data }` matrix or array of row objects)
 * into a typed array of row records.
 */
export function normalizeTapResponse<T = Record<string, unknown>>(rawText: string): T[] {
  let parsed: unknown;
  try {
    parsed = parseLosslessNasaJson(rawText);
  } catch (err) {
    throw new NasaParseError(
      `Failed to parse TAP JSON response: ${(err as Error).message}`,
      rawText.slice(0, 500)
    );
  }

  // Format 1: Already an array of row objects
  if (Array.isArray(parsed)) {
    return parsed as T[];
  }

  // Format 2: Standard IVOA TAP `{ metadata: [{ name: 'col' }, ...], data: [[val1, val2], ...] }`
  const tabular = parsed as TapJsonTabularResponse;
  if (tabular && Array.isArray(tabular.data)) {
    const columns = (tabular.metadata ?? []).map((col) => col.name.toLowerCase());
    return tabular.data.map((row) => {
      const record: Record<string, unknown> = {};
      columns.forEach((colName, index) => {
        record[colName] = row[index];
      });
      return record as T;
    });
  }

  return [];
}

/**
 * Production-ready TypeScript client for NASA Public Domain astronomical archives:
 * - NASA IPAC / IRSA (2MASS All-Sky Point Source Catalog & AllWISE)
 * - STScI MAST (TESS Input Catalog & Hubble Source Catalog)
 */
export class NasaClient {
  readonly ipacEndpoint: string;
  readonly mastEndpoint: string;
  readonly timeoutMs: number;
  readonly retries: number;
  readonly retryDelayMs: number;
  private readonly customFetch?: typeof fetch;

  constructor(config: NasaClientConfig = {}) {
    this.ipacEndpoint = (config.ipacTapEndpoint ?? DEFAULT_IPAC_TAP_ENDPOINT).replace(/\/+$/, '');
    this.mastEndpoint = (config.mastTapEndpoint ?? DEFAULT_MAST_TAP_ENDPOINT).replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = config.retries ?? 2;
    this.retryDelayMs = config.retryDelayMs ?? 1_000;
    this.customFetch = config.fetch;
  }

  private get fetchFn(): typeof fetch {
    if (this.customFetch) return this.customFetch;
    if (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function') {
      return globalThis.fetch;
    }
    throw new NasaError(
      'No web-standard fetch implementation found in runtime. Please provide a fetch polyfill in NasaClientConfig.'
    );
  }

  /**
   * Performs an asynchronous POST request to an IVOA TAP endpoint with retries and timeout control.
   */
  private async executeTapQuery<T>(endpointUrl: string, adql: string): Promise<T[]> {
    const syncUrl = `${endpointUrl}/sync`;
    const body = new URLSearchParams({
      REQUEST: 'doQuery',
      LANG: 'ADQL',
      FORMAT: 'json',
      QUERY: adql,
    });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      if (attempt > 0) {
        const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchFn(syncUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json, text/plain, */*',
          },
          body: body.toString(),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new NasaRateLimitError(
            `NASA TAP rate limit exceeded (${response.status}) at ${endpointUrl}`
          );
        }

        if (!response.ok) {
          const rawError = await response.text().catch(() => '');
          throw new NasaRequestError(
            `NASA TAP query failed with HTTP status ${response.status}: ${rawError.slice(0, 300)}`,
            response.status,
            rawError
          );
        }

        const rawText = await response.text();
        return normalizeTapResponse<T>(rawText);
      } catch (err) {
        clearTimeout(timeoutId);

        if ((err as Error).name === 'AbortError') {
          lastError = new NasaTimeoutError(
            `NASA TAP query timed out after ${this.timeoutMs}ms: ${adql.slice(0, 80)}...`
          );
        } else {
          lastError = err as Error;
        }

        // Do not retry 4xx client errors or explicit rate limit errors
        if (
          lastError instanceof NasaRequestError &&
          lastError.statusCode &&
          lastError.statusCode >= 400 &&
          lastError.statusCode < 500 &&
          lastError.statusCode !== 408
        ) {
          throw lastError;
        }

        if (lastError instanceof NasaRateLimitError) {
          throw lastError;
        }
      }
    }

    throw lastError ?? new NasaError('NASA TAP query failed after max retries');
  }

  /**
   * Executes a raw ADQL query against the NASA IPAC / IRSA TAP server.
   */
  async queryIpac<T = Record<string, unknown>>(adql: string): Promise<T[]> {
    return this.executeTapQuery<T>(this.ipacEndpoint, adql);
  }

  /**
   * Executes a raw ADQL query against the STScI MAST TAP server.
   */
  async queryMast<T = Record<string, unknown>>(adql: string): Promise<T[]> {
    return this.executeTapQuery<T>(this.mastEndpoint, adql);
  }

  /**
   * Performs a celestial cone search in the NASA 2MASS All-Sky Point Source Catalog (`fp_psc`).
   *
   * Near-infrared bands:
   * - $J$: 1.25 µm
   * - $H$: 1.65 µm
   * - $K_s$: 2.17 µm
   *
   * Automatically calculates infrared color index $J - K_s$.
   */
  async coneSearch2Mass(options: NasaConeSearchOptions): Promise<TwoMassStar[]> {
    const { ra, dec, radiusDeg, limit = 1000, maxMag } = options;

    if (ra < 0 || ra > 360) {
      throw new NasaError(`RA must be between 0 and 360 degrees, received: ${ra}`);
    }
    if (dec < -90 || dec > 90) {
      throw new NasaError(`Dec must be between -90 and 90 degrees, received: ${dec}`);
    }
    if (radiusDeg <= 0 || radiusDeg > 10) {
      throw new NasaError(`Radius must be positive and <= 10 degrees, received: ${radiusDeg}`);
    }

    const magClause = maxMag !== undefined ? `AND k_m <= ${maxMag}` : '';

    const adql = `
      SELECT TOP ${limit}
        designation, ra, dec, j_m, h_m, k_m,
        j_msigcom, h_msigcom, k_msigcom, ph_qual
      FROM fp_psc
      WHERE CONTAINS(POINT('J2000', ra, dec), CIRCLE('J2000', ${ra}, ${dec}, ${radiusDeg})) = 1
        AND j_m IS NOT NULL
        AND k_m IS NOT NULL
        ${magClause}
      ORDER BY j_m ASC
    `.trim();

    interface Raw2MassRow {
      designation?: string;
      ra?: number;
      dec?: number;
      j_m?: number | null;
      h_m?: number | null;
      k_m?: number | null;
      j_msigcom?: number | null;
      h_msigcom?: number | null;
      k_msigcom?: number | null;
      ph_qual?: string | null;
    }

    const rows = await this.queryIpac<Raw2MassRow>(adql);

    return rows.map((row): TwoMassStar => {
      const j = typeof row.j_m === 'number' ? row.j_m : null;
      const h = typeof row.h_m === 'number' ? row.h_m : null;
      const k = typeof row.k_m === 'number' ? row.k_m : null;
      const jMinusK = j !== null && k !== null ? Number((j - k).toFixed(4)) : null;

      return {
        designation: String(row.designation ?? ''),
        ra: Number(row.ra ?? 0),
        dec: Number(row.dec ?? 0),
        jMag: j,
        hMag: h,
        kMag: k,
        jMinusK,
        jError: typeof row.j_msigcom === 'number' ? row.j_msigcom : null,
        hError: typeof row.h_msigcom === 'number' ? row.h_msigcom : null,
        kError: typeof row.k_msigcom === 'number' ? row.k_msigcom : null,
        qualityFlag: String(row.ph_qual ?? '---'),
      };
    });
  }

  /**
   * Performs a celestial cone search in the NASA / STScI TESS Input Catalog (TIC v8.2).
   *
   * Returns calibrated astrophysical parameters including:
   * - Effective temperature ($T_{\\rm eff}$ in Kelvin)
   * - Stellar radius ($R / R_\\odot$)
   * - Stellar mass ($M / M_\\odot$)
   * - Stellar luminosity ($L / L_\\odot$)
   * - Parallax and distance
   * - Johnson B and V magnitudes with $(B - V)$ color index
   */
  async coneSearchTic(options: NasaConeSearchOptions): Promise<TicStar[]> {
    const { ra, dec, radiusDeg, limit = 1000, maxMag } = options;

    if (ra < 0 || ra > 360) {
      throw new NasaError(`RA must be between 0 and 360 degrees, received: ${ra}`);
    }
    if (dec < -90 || dec > 90) {
      throw new NasaError(`Dec must be between -90 and 90 degrees, received: ${dec}`);
    }
    if (radiusDeg <= 0 || radiusDeg > 10) {
      throw new NasaError(`Radius must be positive and <= 10 degrees, received: ${radiusDeg}`);
    }

    const magClause = maxMag !== undefined ? `AND Tmag <= ${maxMag}` : '';

    const adql = `
      SELECT TOP ${limit}
        ID, ra, dec, Tmag, GAIA, plx, e_plx, d,
        Teff, rad, mass, lum, Bmag, Vmag
      FROM dbo.tic_v82
      WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', ${ra}, ${dec}, ${radiusDeg})) = 1
        AND Tmag IS NOT NULL
        ${magClause}
      ORDER BY Tmag ASC
    `.trim();

    interface RawTicRow {
      ID?: string | number;
      id?: string | number;
      ra?: number;
      dec?: number;
      Tmag?: number | null;
      tmag?: number | null;
      GAIA?: string | number | null;
      gaia?: string | number | null;
      plx?: number | null;
      e_plx?: number | null;
      d?: number | null;
      Teff?: number | null;
      teff?: number | null;
      rad?: number | null;
      mass?: number | null;
      lum?: number | null;
      Bmag?: number | null;
      bmag?: number | null;
      Vmag?: number | null;
      vmag?: number | null;
    }

    const rows = await this.queryMast<RawTicRow>(adql);

    return rows.map((row): TicStar => {
      const b = typeof (row.Bmag ?? row.bmag) === 'number' ? (row.Bmag ?? row.bmag)! : null;
      const v = typeof (row.Vmag ?? row.vmag) === 'number' ? (row.Vmag ?? row.vmag)! : null;
      const bMinusV = b !== null && v !== null ? Number((b - v).toFixed(4)) : null;

      const idVal = row.ID ?? row.id;
      const gaiaVal = row.GAIA ?? row.gaia;

      return {
        ticId: String(idVal ?? ''),
        ra: Number(row.ra ?? 0),
        dec: Number(row.dec ?? 0),
        tessMag: typeof (row.Tmag ?? row.tmag) === 'number' ? (row.Tmag ?? row.tmag)! : null,
        gaiaSourceId: gaiaVal !== null && gaiaVal !== undefined ? String(gaiaVal) : null,
        parallax: typeof row.plx === 'number' ? row.plx : null,
        parallaxError: typeof row.e_plx === 'number' ? row.e_plx : null,
        distancePc: typeof row.d === 'number' ? row.d : null,
        teffK: typeof (row.Teff ?? row.teff) === 'number' ? (row.Teff ?? row.teff)! : null,
        radiusSolar: typeof row.rad === 'number' ? row.rad : null,
        massSolar: typeof row.mass === 'number' ? row.mass : null,
        luminositySolar: typeof row.lum === 'number' ? row.lum : null,
        bMag: b,
        vMag: v,
        bMinusV,
      };
    });
  }
}
