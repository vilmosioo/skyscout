export {
  HipsClient,
  DEFAULT_HIPS2FITS_ENDPOINT,
} from './client';

export {
  HipsError,
  HipsRequestError,
  HipsTimeoutError,
  HipsRateLimitError,
} from './errors';

export type {
  HipsSurveyId,
  HipsProjection,
  HipsCoordinateSystem,
  HipsImageFormat,
  HipsCutoutOptions,
  HipsClientConfig,
} from './types';
