/**
 * Paginated response wrapper returned by all list endpoints.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/**
 * Parameters accepted by list endpoints for pagination.
 */
export interface PaginationParams {
  /** Page number (0-based). Defaults to 0. */
  page?: number;
  /** Items per page (1-100). Defaults to 20. */
  size?: number;
}

/**
 * Options that can be passed to any SDK method.
 */
export interface RequestOptions {
  /** Idempotency key for POST requests to prevent duplicate operations. */
  idempotencyKey?: string;
  /** AbortSignal to cancel the request. */
  signal?: AbortSignal;
}

/**
 * Structured error thrown by the SDK for all API error responses.
 */
export class EmplyError extends Error {
  /** HTTP status code returned by the API. */
  public readonly statusCode: number;
  /** Error detail message from the API response body. */
  public readonly detail: string;

  constructor(statusCode: number, message: string, detail: string) {
    super(message);
    this.name = "EmplyError";
    this.statusCode = statusCode;
    this.detail = detail;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EmplyError);
    }
  }
}

/**
 * Error thrown when the API returns 429 Too Many Requests.
 */
export class EmplyRateLimitError extends EmplyError {
  /** Seconds to wait before retrying, from the Retry-After header. */
  public readonly retryAfter: number | null;

  constructor(detail: string, retryAfter: number | null) {
    super(429, "Rate limit exceeded", detail);
    this.name = "EmplyRateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when the SDK cannot connect to the API.
 */
export class EmplyConnectionError extends EmplyError {
  constructor(message: string) {
    super(0, message, "Connection failed");
    this.name = "EmplyConnectionError";
  }
}
