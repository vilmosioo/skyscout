export class GaiaError extends Error {
  readonly statusCode?: number;
  readonly responseBody?: string;

  constructor(message: string, statusCode?: number, responseBody?: string) {
    super(message);
    this.name = 'GaiaError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GaiaRateLimitError extends GaiaError {
  constructor(
    message: string = 'Rate limit exceeded: ESA Gaia TAP server quota reached'
  ) {
    super(message, 429);
    this.name = 'GaiaRateLimitError';
  }
}

export class GaiaRequestError extends GaiaError {
  constructor(message: string, statusCode: number, responseBody?: string) {
    super(message, statusCode, responseBody);
    this.name = 'GaiaRequestError';
  }
}

export class GaiaTimeoutError extends GaiaError {
  constructor(message: string = 'Gaia TAP request timed out') {
    super(message, 408);
    this.name = 'GaiaTimeoutError';
  }
}
