/**
 * Base class for all HiPS client errors.
 */
export class HipsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HipsError';
  }
}

/**
 * Thrown when a cutout HTTP request fails.
 */
export class HipsRequestError extends HipsError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: string
  ) {
    super(`HiPS Request failed [HTTP ${status}]: ${message}`);
    this.name = 'HipsRequestError';
  }
}

/**
 * Thrown when an HTTP request exceeds timeout.
 */
export class HipsTimeoutError extends HipsError {
  constructor(public readonly timeoutMs: number) {
    super(`HiPS request timed out after ${timeoutMs}ms`);
    this.name = 'HipsTimeoutError';
  }
}

/**
 * Thrown when the server rate limits the client (HTTP 429).
 */
export class HipsRateLimitError extends HipsError {
  constructor(public readonly retryAfterSeconds?: number) {
    super(
      `HiPS rate limit exceeded (HTTP 429).${
        retryAfterSeconds ? ` Retry after ${retryAfterSeconds}s.` : ''
      }`
    );
    this.name = 'HipsRateLimitError';
  }
}
