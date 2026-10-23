export class LasairError extends Error {
  readonly statusCode?: number;
  readonly responseBody?: string;

  constructor(message: string, statusCode?: number, responseBody?: string) {
    super(message);
    this.name = 'LasairError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LasairAuthError extends LasairError {
  constructor(message: string = 'Unauthorized: Invalid or missing Lasair API token') {
    super(message, 401);
    this.name = 'LasairAuthError';
  }
}

export class LasairRateLimitError extends LasairError {
  constructor(
    message: string = 'Rate limit exceeded: Please wait an hour or request higher quota from Lasair'
  ) {
    super(message, 429);
    this.name = 'LasairRateLimitError';
  }
}

export class LasairRequestError extends LasairError {
  constructor(message: string, statusCode: number, responseBody?: string) {
    super(message, statusCode, responseBody);
    this.name = 'LasairRequestError';
  }
}

export class LasairTimeoutError extends LasairError {
  constructor(message: string = 'Request timed out') {
    super(message, 408);
    this.name = 'LasairTimeoutError';
  }
}
