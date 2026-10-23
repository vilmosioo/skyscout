/**
 * Utility functions for Lasair-specific URLs and astronomical re-exports.
 */
export {
  dateToMjd,
  fluxToAbMag,
  formatCoordinates,
  mjdToDate,
} from '@skyscout/core';

/**
 * Returns the official Lasair web URL for a given Rubin DIA object ID.
 */
export function getLasairObjectUrl(diaObjectId: string | number): string {
  return `https://lasair.lsst.ac.uk/object/${diaObjectId}/`;
}

/**
 * Returns the official Lasair web URL for a given Rubin DIA source/detection ID.
 */
export function getLasairSourceUrl(diaSourceId: string | number): string {
  return `https://lasair.lsst.ac.uk/source/${diaSourceId}/`;
}
