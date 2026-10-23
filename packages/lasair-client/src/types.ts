export interface LasairConfig {
  /** Lasair authentication token */
  token: string;
  /** Base API endpoint URL (defaults to 'https://api.lasair.lsst.ac.uk/api') */
  endpoint?: string;
  /** Request timeout in milliseconds (defaults to 60,000ms) */
  timeoutMs?: number;
  /** Optional custom fetch implementation (useful for tests or custom proxies) */
  fetch?: typeof fetch;
}

/** Parameters for querying the Lasair database */
export interface QueryParams {
  /** Comma-separated list of columns/attributes to select (e.g. 'objects.diaObjectId, objects.ra, objects.decl') */
  selected: string;
  /** Comma-separated list of tables to query and join (e.g. 'objects, sherlock_classifications') */
  tables: string;
  /** WHERE clause conditions without the WHERE keyword */
  conditions: string;
  /** Maximum number of records to return (defaults to 1000) */
  limit?: number;
  /** Offset for pagination (defaults to 0) */
  offset?: number;
}

/** Parameters for cone search */
export interface ConeParams {
  /** Right Ascension in decimal degrees (J2000) */
  ra: number;
  /** Declination in decimal degrees (J2000) */
  dec: number;
  /** Cone search radius in arcseconds (defaults to 5) */
  radius?: number;
  /** Search type: 'all' returns all objects, 'nearest' returns closest, 'count' returns count */
  requestType?: 'all' | 'nearest' | 'count';
}

export interface ConeMatchedObject {
  object: number | string;
  separation: number;
}

export interface ConeSearchResult {
  count?: number;
  nearest?: ConeMatchedObject;
  objects?: ConeMatchedObject[];
  [key: string]: unknown;
}

/** Parameters for fetching an individual Rubin object */
export interface ObjectParams {
  /** Rubin DIA Object ID */
  objectId: string | number;
  /** When true, returns standard output; when false, returns extended data */
  lite?: boolean;
  /** Whether to include Lasair-added metadata */
  lasairAdded?: boolean;
}

/** Individual detection in Difference Image Analysis */
export interface RubinDiaSource {
  diaSourceId: string | number;
  midpointMjdTai: number;
  band: 'u' | 'g' | 'r' | 'i' | 'z' | 'y' | string;
  psfFlux: number;
  psfFluxErr: number;
  reliability?: number;
  ra?: number;
  decl?: number;
  snr?: number;
  [key: string]: unknown;
}

/** Forced photometry source measurement */
export interface RubinDiaForcedSource {
  diaForcedSourceId?: string | number;
  midpointMjdTai: number;
  band: 'u' | 'g' | 'r' | 'i' | 'z' | 'y' | string;
  psfFlux: number;
  psfFluxErr: number;
  [key: string]: unknown;
}

/** Rubin DIA Object summary metadata */
export interface RubinDiaObjectRecord {
  ra: number;
  decl: number;
  firstDiaSourceMjdTai?: number;
  lastDiaSourceMjdTai?: number;
  [key: string]: unknown;
}

/** Full Rubin object payload from Lasair */
export interface RubinObjectResponse {
  diaObjectId: string | number;
  lasairData?: Record<string, unknown>;
  diaObject: RubinDiaObjectRecord;
  diaSourcesList: RubinDiaSource[];
  diaForcedSourcesList?: RubinDiaForcedSource[];
  [key: string]: unknown;
}

/** Parameters for Sherlock context lookup on an object */
export interface SherlockObjectParams {
  objectId: string | number;
  lite?: boolean;
}

/** Parameters for Sherlock context lookup by sky coordinates */
export interface SherlockPositionParams {
  ra: number;
  dec: number;
  lite?: boolean;
}

/** Sherlock catalog cross-match entry */
export interface SherlockCrossmatch {
  transient_object_id: string;
  association_type: 'SN' | 'NT' | 'CV' | 'AGN' | 'VS' | string;
  catalogue_object_id: string;
  catalogue_object_type: string;
  catalogue_table_name: string;
  raDeg: number;
  decDeg: number;
  separationArcsec: number;
  physical_separation_kpc?: number | null;
  z?: number | null;
  Mag?: number | null;
  MagFilter?: string | null;
  classificationReliability?: number;
  [key: string]: unknown;
}

/** Response from Sherlock classification service */
export interface SherlockResponse {
  classifications?: Record<string, [classification: string, summaryHtml: string]>;
  crossmatches?: SherlockCrossmatch[];
  [key: string]: unknown;
}

/** Parameters to create an annotation */
export interface AnnotationParams {
  objectId: string | number;
  topic: string;
  classification: string;
  version?: string;
  explanation?: string;
  classdict?: Record<string, unknown>;
  url?: string;
}

/** Common transient candidate row returned from standard Rubin scout queries */
export interface RubinTransientCandidate {
  diaObjectId: string | number;
  ra: number;
  decl: number;
  classification?: 'SN' | 'NT' | 'CV' | 'AGN' | 'VS' | string;
  [key: string]: unknown;
}
