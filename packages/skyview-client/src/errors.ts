/**
 * Base class for all NASA SkyView client errors.
 */
export class SkyviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkyviewError';
  }
}

/**
 * Thrown when an HTTP request to NASA SkyView fails (e.g. 400, 500, 503).
 */
export class SkyviewRequestError extends SkyviewError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: string
  ) {
    super(`SkyView Request failed [HTTP ${status}]: ${message}`);
    this.name = 'SkyviewRequestError';
  }
}

/**
 * Thrown when an HTTP request exceeds the configured timeout threshold.
 */
export class SkyviewTimeoutError extends SkyviewError {
  constructor(public readonly timeoutMs: number) {
    super(`SkyView request timed out after ${timeoutMs}ms`);
    this.name = 'SkyviewTimeoutError';
  }
}

/**
 * Thrown when NASA SkyView returns HTTP 429 Rate Limit.
 */
export class SkyviewRateLimitError extends SkyviewError {
  constructor(public readonly retryAfterSeconds?: number) {
    super(
      `SkyView rate limit exceeded (HTTP 429).${
        retryAfterSeconds ? ` Retry after ${retryAfterSeconds}s.` : ''
      }`
    );
    this.name = 'SkyviewRateLimitError';
  }
}

/**
 * Thrown when response parsing fails.
 */
export class SkyviewParseError extends SkyviewError {
  constructor(message: string, public readonly rawText?: string) {
    super(`SkyView parse error: ${message}`);
    this.name = 'SkyviewParseError';
  }
}
