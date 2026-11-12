import {
  HipsError,
  HipsRateLimitError,
  HipsRequestError,
  HipsTimeoutError,
} from './errors';
import type {
  HipsClientConfig,
  HipsCutoutOptions,
  HipsSurveyId,
} from './types';

export const DEFAULT_HIPS2FITS_ENDPOINT =
  'https://alasky.cds.unistra.fr/hips-image-services/hips2fits';
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Client for IVOA HiPS and CDS `hips2fits` astronomical image cutouts.
 *
 * Generates true-color and multiwavelength astronomical cutouts from
 * full-sky Hierarchical Progressive Surveys (DSS2, 2MASS, Pan-STARRS, unWISE).
 */
export class HipsClient {
  private readonly endpoint: string;
  private readonly defaultTimeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(config: HipsClientConfig = {}) {
    this.endpoint = config.endpoint ?? DEFAULT_HIPS2FITS_ENDPOINT;
    this.defaultTimeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = config.fetch ?? fetch;
  }

  /**
   * Generates a direct URL for a HiPS image cutout.
   * Suitable for `<img src="...">`, CSS backgrounds, or HTML5 Canvas `drawImage`.
   */
  getCutoutUrl(options: HipsCutoutOptions): string {
    const params = new URLSearchParams();

    params.set('hips', options.hips ?? 'CDS/P/DSS2/color');
    params.set('ra', options.ra.toFixed(6));
    params.set('dec', options.dec.toFixed(6));
    params.set('fov', String(options.fovDeg ?? 0.5));
    params.set('width', String(options.width ?? 600));
    params.set('height', String(options.height ?? 600));
    params.set('projection', options.projection ?? 'TAN');
    params.set('coordsys', options.coordsys ?? 'icrs');
    params.set('rotation_angle', String(options.rotationAngleDeg ?? 0));
    params.set('format', options.format ?? 'jpg');

    return `${this.endpoint}?${params.toString()}`;
  }

  /**
   * Fetches the cutout as a browser/Node `Blob`.
   */
  async fetchCutoutBlob(options: HipsCutoutOptions): Promise<Blob> {
    const url = this.getCutoutUrl(options);
    const response = await this.executeRequest(url, options.timeoutMs);
    return await response.blob();
  }

  /**
   * Fetches the cutout as an `ArrayBuffer`.
   */
  async fetchCutoutArrayBuffer(options: HipsCutoutOptions): Promise<ArrayBuffer> {
    const url = this.getCutoutUrl(options);
    const response = await this.executeRequest(url, options.timeoutMs);
    return await response.arrayBuffer();
  }

  /**
   * Fetches the cutout in raw astronomical FITS format.
   */
  async fetchFits(options: Omit<HipsCutoutOptions, 'format'>): Promise<ArrayBuffer> {
    const url = this.getCutoutUrl({ ...options, format: 'fits' });
    const response = await this.executeRequest(url, options.timeoutMs);
    return await response.arrayBuffer();
  }

  /**
   * Returns official licensing and credit attribution text for the survey.
   */
  getSurveyAttribution(surveyId?: HipsSurveyId): string {
    const id = surveyId ?? 'CDS/P/DSS2/color';
    if (id.includes('2MASS')) {
      return 'NASA 2MASS survey. U.S. Public Domain.';
    }
    if (id.includes('DSS2')) {
      return 'Based on photographic data obtained using The UK Schmidt Telescope / Palomar Observatory, digitized by STScI.';
    }
    if (id.includes('PanSTARRS')) {
      return 'Pan-STARRS1 Surveys (PS1) hosted by STScI / CDS.';
    }
    if (id.includes('unWISE')) {
      return 'unWISE / NASA WISE infrared survey. U.S. Public Domain.';
    }
    return 'Astronomical image courtesy of CDS / IVOA HiPS.';
  }

  private async executeRequest(url: string, timeoutMs?: number): Promise<Response> {
    const timeout = timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.fetchFn(url, {
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryHeader = response.headers.get('Retry-After');
          const retrySec = retryHeader ? parseInt(retryHeader, 10) : undefined;
          throw new HipsRateLimitError(retrySec);
        }
        const text = await response.text().catch(() => '');
        throw new HipsRequestError(
          `hips2fits server responded with status ${response.status}`,
          response.status,
          text
        );
      }

      return response;
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        throw new HipsTimeoutError(timeout);
      }
      if (err instanceof HipsError) {
        throw err;
      }
      throw new HipsRequestError((err as Error).message ?? 'Network error', 0);
    } finally {
      clearTimeout(timer);
    }
  }
}
