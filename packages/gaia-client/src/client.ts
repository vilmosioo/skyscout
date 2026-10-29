import {
  absoluteMagToLogLuminosity,
  apparentToAbsoluteMag,
  bpRpToEffectiveTempK,
  bpRpToSpectralClass,
  parallaxToDistanceLightYears,
  parallaxToDistanceParsecs,
} from '@skyscout/core';
import {
  GaiaError,
  GaiaRateLimitError,
  GaiaRequestError,
  GaiaTimeoutError,
} from './errors';
import type {
  GaiaClientConfig,
  GaiaConeSearchOptions,
  GaiaDistanceSearchOptions,
  GaiaSortField,
  GaiaStar,
  GaiaStarFilterOptions,
  GaiaTapJsonResponse,
} from './types';

export const DEFAULT_GAIA_TAP_ENDPOINT = 'https://gea.esac.esa.int/tap-server/tap';
const DEFAULT_TIMEOUT_MS = 45_000;

const GAIA_SELECT_COLUMNS = [
  'source_id',
  'ra',
  'dec',
  'parallax',
  'parallax_error',
  'parallax_over_error',
  'pmra',
  'pmdec',
  'radial_velocity',
  'phot_g_mean_mag',
  'phot_bp_mean_mag',
  'phot_rp_mean_mag',
  'bp_rp',
  'teff_gspphot',
  'ag_gspphot',
  'ebpminrp_gspphot',
].join(', ');

/**
 * Parses JSON while safely preserving 64-bit integer literals (e.g. Gaia DR3 19-digit `source_id`)
 * that would otherwise suffer precision loss under standard JavaScript IEEE-754 Number parsing.
 */
export function parseLosslessGaiaJson<T>(rawText: string): T {
  const preserved = rawText.replace(/([:\[,]\s*)(\d{15,})(\s*[,}\]])/g, '$1"$2"$3');
  return JSON.parse(preserved) as T;
}

/**
 * Converts a raw ESA Gaia TAP tabular JSON response (`{ metadata, data }`) into an array
 * of keyed row objects, mapping each column name to its value.
 */
export function parseTapTabularResponse<T = Record<string, unknown>>(
  tapResponse: GaiaTapJsonResponse
): T[] {
  if (!tapResponse || !Array.isArray(tapResponse.metadata) || !Array.isArray(tapResponse.data)) {
    throw new GaiaError('Invalid Gaia TAP JSON structure: missing "metadata" or "data" arrays.');
  }

  const columns = tapResponse.metadata.map((col) => col.name);
  return tapResponse.data.map((row) => {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < columns.length; i++) {
      obj[columns[i]] = row[i];
    }
    return obj as T;
  });
}

function toFiniteNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

/**
 * Maps a raw `gaiadr3.gaia_source` row into a clean, camelCased `GaiaStar` object
 * with derived physical quantities (`distancePc`, `distanceLy`, `absoluteMagG`, `logLuminositySolar`, `spectralClass`).
 */
export function mapRawGaiaRowToStar(row: Record<string, unknown>): GaiaStar | null {
  const ra = toFiniteNumberOrNull(row.ra);
  const dec = toFiniteNumberOrNull(row.dec);
  const magG = toFiniteNumberOrNull(row.phot_g_mean_mag);

  if (ra === null || dec === null || magG === null) {
    return null;
  }

  const parallaxMas = toFiniteNumberOrNull(row.parallax);
  const parallaxErrorMas = toFiniteNumberOrNull(row.parallax_error);
  const parallaxSnr = toFiniteNumberOrNull(row.parallax_over_error);
  const pmRaMasYr = toFiniteNumberOrNull(row.pmra);
  const pmDecMasYr = toFiniteNumberOrNull(row.pmdec);
  const radialVelocityKmS = toFiniteNumberOrNull(row.radial_velocity);
  const magBp = toFiniteNumberOrNull(row.phot_bp_mean_mag);
  const magRp = toFiniteNumberOrNull(row.phot_rp_mean_mag);

  let bpRp = toFiniteNumberOrNull(row.bp_rp);
  if (bpRp === null && magBp !== null && magRp !== null) {
    bpRp = magBp - magRp;
  }

  const extinctionAg = toFiniteNumberOrNull(row.ag_gspphot);
  const reddeningBpRp = toFiniteNumberOrNull(row.ebpminrp_gspphot);

  const validExtinction = extinctionAg !== null && extinctionAg > 0 ? extinctionAg : 0;
  const validReddening = reddeningBpRp !== null && reddeningBpRp > 0 ? reddeningBpRp : 0;

  const distancePc =
    parallaxMas !== null && parallaxMas > 0 ? parallaxToDistanceParsecs(parallaxMas) : null;
  const distanceLy =
    parallaxMas !== null && parallaxMas > 0 ? parallaxToDistanceLightYears(parallaxMas) : null;
  const absoluteMagG =
    parallaxMas !== null && parallaxMas > 0
      ? apparentToAbsoluteMag(magG, parallaxMas, validExtinction)
      : null;
  const logLuminositySolar =
    absoluteMagG !== null ? absoluteMagToLogLuminosity(absoluteMagG) : null;

  const intrinsicBpRp = bpRp !== null ? bpRp - validReddening : null;
  const rawTeff = toFiniteNumberOrNull(row.teff_gspphot);
  const teffK =
    rawTeff !== null && rawTeff > 0
      ? Math.round(rawTeff)
      : intrinsicBpRp !== null
      ? bpRpToEffectiveTempK(intrinsicBpRp)
      : null;

  const spectralClass = intrinsicBpRp !== null ? bpRpToSpectralClass(intrinsicBpRp) : null;

  return {
    sourceId: String(row.source_id ?? ''),
    ra,
    dec,
    parallaxMas,
    parallaxErrorMas,
    parallaxSnr,
    pmRaMasYr,
    pmDecMasYr,
    radialVelocityKmS,
    magG,
    magBp,
    magRp,
    bpRp,
    teffK,
    extinctionAg,
    reddeningBpRp,
    distancePc,
    distanceLy,
    absoluteMagG,
    logLuminositySolar,
    spectralClass,
  };
}

function resolveSortClause(sortBy: GaiaSortField = 'brightest'): string {
  switch (sortBy) {
    case 'brightest':
      return 'ORDER BY phot_g_mean_mag ASC';
    case 'faintest':
      return 'ORDER BY phot_g_mean_mag DESC';
    case 'nearest':
      return 'ORDER BY parallax DESC';
    case 'farthest':
      return 'ORDER BY parallax ASC';
    case 'hottest':
      return 'ORDER BY bp_rp ASC';
    case 'coolest':
      return 'ORDER BY bp_rp DESC';
  }
}

function buildFilterConditions(options: GaiaStarFilterOptions): string[] {
  const conditions: string[] = ['phot_g_mean_mag IS NOT NULL'];

  const requirePositiveParallax = options.requirePositiveParallax ?? true;
  const requireColor = options.requireColor ?? true;

  if (requirePositiveParallax) {
    conditions.push('parallax IS NOT NULL', 'parallax > 0');
  }
  if (requireColor) {
    conditions.push('bp_rp IS NOT NULL');
  }

  // Distance (parsecs) <-> Parallax (mas) conversions
  let minPlx = options.minParallaxMas;
  let maxPlx = options.maxParallaxMas;

  if (typeof options.maxDistancePc === 'number' && options.maxDistancePc > 0) {
    const plxFromMaxDist = Number((1000 / options.maxDistancePc).toFixed(6));
    minPlx = minPlx !== undefined ? Math.max(minPlx, plxFromMaxDist) : plxFromMaxDist;
  }
  if (typeof options.minDistancePc === 'number' && options.minDistancePc > 0) {
    const plxFromMinDist = Number((1000 / options.minDistancePc).toFixed(6));
    maxPlx = maxPlx !== undefined ? Math.min(maxPlx, plxFromMinDist) : plxFromMinDist;
  }

  if (typeof minPlx === 'number') {
    conditions.push(`parallax >= ${minPlx}`);
  }
  if (typeof maxPlx === 'number') {
    conditions.push(`parallax <= ${maxPlx}`);
  }
  if (typeof options.minParallaxSnr === 'number') {
    conditions.push(`parallax_over_error >= ${options.minParallaxSnr}`);
  }
  if (typeof options.minMagG === 'number') {
    conditions.push(`phot_g_mean_mag >= ${options.minMagG}`);
  }
  if (typeof options.maxMagG === 'number') {
    conditions.push(`phot_g_mean_mag <= ${options.maxMagG}`);
  }
  if (typeof options.minBpRp === 'number') {
    conditions.push(`bp_rp >= ${options.minBpRp}`);
  }
  if (typeof options.maxBpRp === 'number') {
    conditions.push(`bp_rp <= ${options.maxBpRp}`);
  }
  if (typeof options.minTeffK === 'number') {
    conditions.push(`teff_gspphot >= ${options.minTeffK}`);
  }
  if (typeof options.maxTeffK === 'number') {
    conditions.push(`teff_gspphot <= ${options.maxTeffK}`);
  }

  return conditions;
}

/**
 * Resolves cone radius in decimal degrees from `radiusDeg`, `radiusArcmin`, or `radiusArcsec`.
 */
export function resolveConeRadiusDegrees(options: GaiaConeSearchOptions): number {
  if (typeof options.radiusDeg === 'number' && options.radiusDeg > 0) {
    return options.radiusDeg;
  }
  if (typeof options.radiusArcmin === 'number' && options.radiusArcmin > 0) {
    return options.radiusArcmin / 60;
  }
  if (typeof options.radiusArcsec === 'number' && options.radiusArcsec > 0) {
    return options.radiusArcsec / 3600;
  }
  throw new GaiaError(
    'Cone search requires a positive radius (`radiusDeg`, `radiusArcmin`, or `radiusArcsec`).'
  );
}

/**
 * Pure, environment-agnostic TypeScript client for the ESA Gaia Archive.
 * Abstracts away TAP protocol mechanics, ADQL syntax, and raw catalog column names.
 *
 * @see Official ESA Gaia Archive Portal: {@link https://gea.esac.esa.int/archive/}
 * @see Official Gaia TAP Server Help & Command-Line Access: {@link https://www.cosmos.esa.int/web/gaia-users/archive/programmatic-access}
 * @see Official Gaia DR3 `gaia_source` Data Model: {@link https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html}
 * @see IVOA Table Access Protocol (TAP) v1.1 Specification: {@link https://www.ivoa.net/documents/TAP/}
 * @see IVOA Astronomical Data Query Language (ADQL) Specification: {@link https://www.ivoa.net/documents/ADQL/}
 */
export class GaiaClient {
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly customFetch?: typeof fetch;

  constructor(config: GaiaClientConfig = {}) {
    this.endpoint = (config.endpoint ?? DEFAULT_GAIA_TAP_ENDPOINT).replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.customFetch = config.fetch;
  }

  /**
   * Performs a spatial cone search around a sky position (`ra`, `dec`) with optional
   * distance, parallax, magnitude, and color filters. No ADQL required.
   *
   * @example
   * ```ts
   * // Find stars in the Pleiades region within 2 degrees and 120–155 parsecs
   * const stars = await client.coneSearch({
   *   ra: 56.75,
   *   dec: 24.12,
   *   radiusDeg: 2.0,
   *   minDistancePc: 120,
   *   maxDistancePc: 155,
   *   minParallaxSnr: 10,
   *   maxMagG: 16.5,
   *   limit: 500,
   * });
   * ```
   */
  async coneSearch(options: GaiaConeSearchOptions): Promise<GaiaStar[]> {
    const radiusDeg = Number(resolveConeRadiusDegrees(options).toFixed(6));
    const limit = Math.max(1, Math.min(5000, Math.floor(options.limit ?? 500)));

    const conditions = [
      `1 = CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', ${options.ra}, ${options.dec}, ${radiusDeg}))`,
      ...buildFilterConditions(options),
    ];

    const adql = [
      `SELECT TOP ${limit}`,
      `  ${GAIA_SELECT_COLUMNS}`,
      `FROM gaiadr3.gaia_source`,
      `WHERE ${conditions.join(' AND ')}`,
      resolveSortClause(options.sortBy ?? 'brightest'),
    ].join('\n');

    const rawRows = await this.queryAdql<Record<string, unknown>>(adql);
    return this.mapRowsToStars(rawRows);
  }

  /**
   * Queries stars within a given distance in parsecs from the Sun (e.g. `maxDistancePc: 25`),
   * automatically converting parsecs into parallax bounds.
   *
   * @example
   * ```ts
   * const nearbyStars = await client.searchByDistance({
   *   maxDistancePc: 25,
   *   minParallaxSnr: 20,
   *   sortBy: 'nearest',
   *   limit: 500,
   * });
   * ```
   */
  async searchByDistance(options: GaiaDistanceSearchOptions): Promise<GaiaStar[]> {
    if (!Number.isFinite(options.maxDistancePc) || options.maxDistancePc <= 0) {
      throw new GaiaError('`maxDistancePc` must be a positive number.');
    }
    return this.searchStars({
      ...options,
      sortBy: options.sortBy ?? 'nearest',
    });
  }

  /**
   * Queries Gaia DR3 using structured filter criteria (distance, parallax, magnitude,
   * color index, effective temperature, and sort order) without writing ADQL.
   */
  async searchStars(options: GaiaStarFilterOptions = {}): Promise<GaiaStar[]> {
    const limit = Math.max(1, Math.min(5000, Math.floor(options.limit ?? 500)));
    const conditions = buildFilterConditions(options);

    const adql = [
      `SELECT TOP ${limit}`,
      `  ${GAIA_SELECT_COLUMNS}`,
      `FROM gaiadr3.gaia_source`,
      `WHERE ${conditions.join(' AND ')}`,
      resolveSortClause(options.sortBy ?? 'brightest'),
    ].join('\n');

    const rawRows = await this.queryAdql<Record<string, unknown>>(adql);
    return this.mapRowsToStars(rawRows);
  }

  /**
   * Fetches a single star record by its Gaia DR3 64-bit `source_id`.
   *
   * @param sourceId - Gaia DR3 source identifier (string or number)
   * @returns Enriched `GaiaStar` object, or `null` if not found
   */
  async getStarById(sourceId: string | number): Promise<GaiaStar | null> {
    const cleaned = String(sourceId).trim();
    if (!/^\d+$/.test(cleaned)) {
      throw new GaiaError(`Invalid Gaia source_id "${sourceId}": expected a numeric identifier.`);
    }

    const adql = [
      `SELECT TOP 1`,
      `  ${GAIA_SELECT_COLUMNS}`,
      `FROM gaiadr3.gaia_source`,
      `WHERE source_id = ${cleaned}`,
    ].join('\n');

    const rawRows = await this.queryAdql<Record<string, unknown>>(adql);
    if (rawRows.length === 0) return null;
    return mapRawGaiaRowToStar(rawRows[0]);
  }

  /**
   * Low-level escape hatch: executes a raw Astronomical Data Query Language (ADQL) query
   * against the Gaia TAP `/sync` endpoint and returns the parsed rows.
   *
   * @param adql - Valid ADQL SELECT query string
   * @returns Array of parsed row objects matching the selected columns
   *
   * @see Official Gaia ADQL & Programmatic Access Guide: {@link https://www.cosmos.esa.int/web/gaia-users/archive/programmatic-access}
   * @see Official Gaia Writing Queries Guide: {@link https://www.cosmos.esa.int/web/gaia-users/archive/writing-queries}
   */
  async queryAdql<T = Record<string, unknown>>(adql: string): Promise<T[]> {
    if (!adql || typeof adql !== 'string' || adql.trim() === '') {
      throw new GaiaError('ADQL query string must not be empty.');
    }

    const url = `${this.endpoint}/sync`;
    const fetchFn = this.customFetch ?? globalThis.fetch;

    const bodyParams = new URLSearchParams({
      REQUEST: 'doQuery',
      LANG: 'ADQL',
      FORMAT: 'json',
      QUERY: adql.trim(),
    });

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Accept: 'application/json',
        },
        body: bodyParams.toString(),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new GaiaTimeoutError(`Gaia TAP request to ${url} timed out after ${this.timeoutMs}ms.`);
      }
      throw new GaiaError(`Network error querying Gaia TAP at ${url}: ${(err as Error).message}`);
    } finally {
      clearTimeout(timeoutTimer);
    }

    const rawText = await response.text();

    if (!response.ok) {
      if (response.status === 429) {
        throw new GaiaRateLimitError(
          `Rate limit exceeded (429): Gaia TAP quota reached. Details: ${rawText.slice(0, 300)}`
        );
      }
      throw new GaiaRequestError(
        `Gaia TAP request failed with status ${response.status}: ${rawText.slice(0, 300)}`,
        response.status,
        rawText
      );
    }

    let tapJson: GaiaTapJsonResponse;
    try {
      tapJson = parseLosslessGaiaJson<GaiaTapJsonResponse>(rawText);
    } catch (parseErr: unknown) {
      throw new GaiaError(
        `Failed to parse Gaia TAP JSON from ${url}: ${(parseErr as Error).message}. Body: ${rawText.slice(0, 200)}`
      );
    }

    return parseTapTabularResponse<T>(tapJson);
  }

  private mapRowsToStars(rawRows: Array<Record<string, unknown>>): GaiaStar[] {
    const stars: GaiaStar[] = [];
    for (const row of rawRows) {
      const star = mapRawGaiaRowToStar(row);
      if (star) {
        stars.push(star);
      }
    }
    return stars;
  }
}
