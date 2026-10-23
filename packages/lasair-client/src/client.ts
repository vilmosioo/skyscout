import {
  LasairAuthError,
  LasairError,
  LasairRateLimitError,
  LasairRequestError,
  LasairTimeoutError,
} from './errors';
import type {
  AnnotationParams,
  ConeParams,
  ConeSearchResult,
  LasairConfig,
  ObjectParams,
  QueryParams,
  RubinObjectResponse,
  RubinTransientCandidate,
  SherlockObjectParams,
  SherlockPositionParams,
  SherlockResponse,
} from './types';

const DEFAULT_ENDPOINT = 'https://api.lasair.lsst.ac.uk/api';
const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * Parses JSON while safely preserving 64-bit integers (e.g. Rubin diaObjectId, diaSourceId)
 * that would otherwise suffer precision loss under standard JavaScript IEEE-754 Number parsing.
 */
export function parseLosslessJson<T>(rawText: string): T {
  // Matches 15+ digit integer literals preceded by ':', '[', or ',' and followed by ',', '}', or ']'
  const preserved = rawText.replace(/([:\[,]\s*)(\d{15,})(\s*[,}\]])/g, '$1"$2"$3');
  return JSON.parse(preserved) as T;
}

export class LasairClient {
  private readonly token: string;
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly customFetch?: typeof fetch;

  constructor(config: LasairConfig) {
    if (!config?.token || typeof config.token !== 'string' || config.token.trim() === '') {
      throw new LasairAuthError('LASAIR_TOKEN is required to initialize LasairClient.');
    }
    this.token = config.token.trim();
    this.endpoint = (config.endpoint ?? DEFAULT_ENDPOINT).replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.customFetch = config.fetch;
  }

  /**
   * Internal HTTP POST helper to send requests to Lasair endpoints.
   */
  private async post<T>(method: string, payload: Record<string, unknown>): Promise<T> {
    const url = `${this.endpoint}/${method}/`;
    const fetchFn = this.customFetch ?? globalThis.fetch;

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetchFn(url, {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new LasairTimeoutError(`Request to ${url} timed out after ${this.timeoutMs}ms.`);
      }
      throw new LasairError(`Network error querying Lasair at ${url}: ${(err as Error).message}`);
    } finally {
      clearTimeout(timeoutTimer);
    }

    const rawText = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        throw new LasairAuthError(`Unauthorized (401): ${rawText}`);
      }
      if (response.status === 429) {
        throw new LasairRateLimitError(
          `Rate limit exceeded (429): Lasair quota reached. Details: ${rawText}`
        );
      }
      throw new LasairRequestError(
        `Lasair API request failed with status ${response.status}: ${rawText}`,
        response.status,
        rawText
      );
    }

    try {
      return parseLosslessJson<T>(rawText);
    } catch (parseErr) {
      throw new LasairError(
        `Failed to parse response JSON from ${url}: ${(parseErr as Error).message}. Body: ${rawText.slice(0, 200)}`
      );
    }
  }

  /**
   * Runs an arbitrary SQL query on the Lasair Rubin / LSST database.
   *
   * @param options - Query parameters including selected fields, tables, WHERE conditions, and limit/offset.
   * @returns Array of typed transient candidate records.
   *
   * @see Official Query Documentation: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#query}
   *
   * @example
   * ```ts
   * const candidates = await client.query({
   *   selected: 'objects.diaObjectId, objects.ra, objects.decl, sherlock_classifications.classification',
   *   tables: 'objects, sherlock_classifications',
   *   conditions: "objects.diaObjectId = sherlock_classifications.diaObjectId AND sherlock_classifications.classification = 'SN'",
   *   limit: 10
   * });
   * ```
   */
  async query<T = RubinTransientCandidate>(options: QueryParams): Promise<T[]> {
    const payload = {
      selected: options.selected,
      tables: options.tables,
      conditions: options.conditions,
      limit: options.limit ?? 1000,
      offset: options.offset ?? 0,
    };
    return this.post<T[]>('query', payload);
  }

  /**
   * Performs a cone search around a specific celestial sky position (RA/Dec in degrees).
   *
   * @param options - Cone search options including central RA/Dec, radius in arcseconds, and requestType ('all' | 'nearest' | 'count').
   * @returns Cone search result object with matching objects and angular separations.
   *
   * @see Official Cone Search Documentation: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#cone}
   *
   * @example
   * ```ts
   * const result = await client.cone({
   *   ra: 52.8238,
   *   dec: -29.6916,
   *   radius: 10,
   *   requestType: 'nearest'
   * });
   * ```
   */
  async cone(options: ConeParams): Promise<ConeSearchResult> {
    const payload = {
      ra: options.ra,
      dec: options.dec,
      radius: options.radius ?? 5,
      requestType: options.requestType ?? 'all',
    };
    return this.post<ConeSearchResult>('cone', payload);
  }

  /**
   * Fetches full object data, including multi-epoch DIA Difference Image Analysis photometry points (light curves).
   *
   * @param objectId - Rubin diaObjectId (64-bit integer or string).
   * @param options - Optional flags: `lite` (exclude heavy metadata) and `lasairAdded` (include Lasair metadata).
   * @returns Complete Rubin DIA object record with detections list.
   *
   * @see Official Object Documentation: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#object}
   *
   * @example
   * ```ts
   * const record = await client.object('170019695992242795');
   * console.log(record.diaSourcesList);
   * ```
   */
  async object(
    objectId: string | number,
    options?: { lite?: boolean; lasairAdded?: boolean }
  ): Promise<RubinObjectResponse> {
    const payload: ObjectParams = {
      objectId: String(objectId),
      lite: options?.lite ?? true,
      lasairAdded: options?.lasairAdded ?? true,
    };
    return this.post<RubinObjectResponse>('object', payload as unknown as Record<string, unknown>);
  }

  /**
   * Queries the Sherlock context database for a specific Rubin DIA object ID.
   *
   * @param objectId - Rubin diaObjectId (64-bit integer or string).
   * @param options - Optional configuration flags (e.g. `lite`).
   * @returns Sherlock classification and catalog cross-matches for the object.
   *
   * @see Official Sherlock API Documentation: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#sherlock}
   * @see Official Sherlock Overview: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/sherlock.html}
   *
   * @example
   * ```ts
   * const context = await client.sherlockObject('170019695992242795');
   * console.log(context.classification, context.crossmatches);
   * ```
   */
  async sherlockObject(
    objectId: string | number,
    options?: { lite?: boolean }
  ): Promise<SherlockResponse> {
    const payload: SherlockObjectParams = {
      objectId: String(objectId),
      lite: options?.lite ?? true,
    };
    return this.post<SherlockResponse>('sherlock/object', payload as unknown as Record<string, unknown>);
  }

  /**
   * Queries the Sherlock contextual classification engine for any arbitrary celestial coordinates in the sky.
   *
   * @param ra - Right Ascension in decimal degrees.
   * @param dec - Declination in decimal degrees.
   * @param options - Optional configuration flags (e.g. `lite`).
   * @returns Sherlock classification and catalog cross-matches for the coordinates.
   *
   * @see Official Sherlock API Documentation: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#sherlock}
   * @see Official Sherlock Overview: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/sherlock.html}
   *
   * @example
   * ```ts
   * const context = await client.sherlockPosition(52.8238, -29.6916);
   * console.log(context.classification);
   * ```
   */
  async sherlockPosition(
    ra: number,
    dec: number,
    options?: { lite?: boolean }
  ): Promise<SherlockResponse> {
    const payload: SherlockPositionParams = {
      ra,
      dec,
      lite: options?.lite ?? true,
    };
    return this.post<SherlockResponse>('sherlock/position', payload as unknown as Record<string, unknown>);
  }

  /**
   * Submits a user or machine classification annotation back to the Lasair broker.
   *
   * @param options - Annotation payload including objectId, topic, classification, and explanation.
   * @returns Status response from the Lasair server.
   *
   * @see Official Annotate Documentation: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#annotate}
   *
   * @example
   * ```ts
   * await client.annotate({
   *   objectId: '170019695992242795',
   *   topic: 'my_survey_topic',
   *   classification: 'SN Ia',
   *   version: '1.0',
   *   explanation: 'Fast rise time consistent with Type Ia supernova'
   * });
   * ```
   */
  async annotate(options: AnnotationParams): Promise<Record<string, unknown>> {
    const payload = {
      objectId: String(options.objectId),
      topic: options.topic,
      classification: options.classification,
      version: (options.version ?? '0.1').slice(0, 16),
      explanation: options.explanation ?? '',
      classdict: options.classdict ? JSON.stringify(options.classdict) : '{}',
      url: options.url ?? '',
    };
    return this.post<Record<string, unknown>>('annotate', payload);
  }

  /**
   * Submits a batch of user or machine annotations to the Lasair broker.
   *
   * @param annotations - Array of annotation objects.
   * @returns Status response from the Lasair server.
   *
   * @see Official Annotate Documentation: {@link https://lasair-lsst.readthedocs.io/en/latest/core_functions/rest_api.html#annotate}
   */
  async annotateList(annotations: AnnotationParams[]): Promise<Record<string, unknown>> {
    const formatted = annotations.map((ann, idx) => {
      if (!ann.objectId) throw new LasairError(`Annotation at index ${idx} missing "objectId"`);
      if (!ann.topic) throw new LasairError(`Annotation at index ${idx} missing "topic"`);
      if (!ann.classification) throw new LasairError(`Annotation at index ${idx} missing "classification"`);
      return {
        objectId: String(ann.objectId),
        topic: ann.topic,
        classification: ann.classification,
        version: (ann.version ?? '0.1').slice(0, 16),
        explanation: ann.explanation ?? '',
        classdict: ann.classdict ? JSON.stringify(ann.classdict) : '{}',
        url: ann.url ?? '',
      };
    });
    return this.post<Record<string, unknown>>('annotatelist', { annotations: formatted });
  }
}
