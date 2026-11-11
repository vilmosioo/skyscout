export class NasaError extends Error {
  readonly statusCode?: number;
  readonly responseBody?: string;

  constructor(message: string, statusCode?: number, responseBody?: string) {
    super(message);
    this.name = 'NasaError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NasaRateLimitError extends NasaError {
  constructor(message: string = 'Rate limit exceeded: NASA TAP server quota reached') {
    super(message, 429);
    this.name = 'NasaRateLimitError';
  }
}

export class NasaRequestError extends NasaError {
  constructor(message: string, statusCode: number, responseBody?: string) {
    super(message, statusCode, responseBody);
    this.name = 'NasaRequestError';
  }
}

export class NasaTimeoutError extends NasaError {
  constructor(message: string = 'NASA TAP request timed out') {
    super(message, 408);
    this.name = 'NasaTimeoutError';
  }
}

export class NasaParseError extends NasaError {
  constructor(message: string, responseBody?: string) {
    super(message, undefined, responseBody);
    this.name = 'NasaParseError';
  }
}
