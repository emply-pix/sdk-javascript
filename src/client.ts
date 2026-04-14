import {
  EmplyError,
  EmplyRateLimitError,
  EmplyConnectionError,
  type RequestOptions,
} from "./types/common.js";

const DEFAULT_BASE_URL = "https://api.emply.com.br/api/v1";
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface EmplyClientConfig {
  /** API key. Prefix determines environment: sk_sandbox_ or sk_live_. */
  apiKey: string;
  /** Override the default base URL. */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30000. */
  timeout?: number;
  /** Maximum number of automatic retries on transient errors. Defaults to 2. */
  maxRetries?: number;
}

/**
 * Low-level HTTP client that handles authentication, error parsing,
 * retries with exponential backoff, and timeout management.
 */
export class EmplyClient {
  public readonly apiKey: string;
  public readonly baseUrl: string;
  public readonly environment: "sandbox" | "production";
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(config: EmplyClientConfig) {
    if (!config.apiKey) {
      throw new Error(
        "API key is required. Pass your key as: new Emply({ apiKey: 'sk_sandbox_...' })"
      );
    }

    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = config.maxRetries ?? MAX_RETRIES;

    // Auto-detect environment from API key prefix
    if (config.apiKey.startsWith("sk_live_")) {
      this.environment = "production";
    } else if (config.apiKey.startsWith("sk_sandbox_")) {
      this.environment = "sandbox";
    } else {
      throw new Error(
        'Invalid API key format. Keys must start with "sk_sandbox_" or "sk_live_".'
      );
    }
  }

  /**
   * Execute an HTTP request against the Emply API with automatic
   * retries, timeout, and structured error handling.
   */
  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions,
    queryParams?: Record<string, string | number | undefined>
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);
    const headers = this.buildHeaders(options);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        await this.sleep(this.backoffDelay(attempt));
      }

      try {
        const response = await this.executeRequest(
          method,
          url,
          headers,
          body,
          options?.signal
        );

        if (response.ok) {
          // Handle 204 No Content
          if (response.status === 204) {
            return undefined as T;
          }
          return (await response.json()) as T;
        }

        // Parse error response
        const error = await this.parseErrorResponse(response);

        // Rate limit errors include Retry-After
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : null;
          lastError = new EmplyRateLimitError(
            error.detail,
            Number.isNaN(retrySeconds) ? null : retrySeconds
          );

          // Retry rate limits if we have attempts left
          if (attempt < this.maxRetries) {
            continue;
          }
          throw lastError;
        }

        // Only retry on transient server errors
        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < this.maxRetries) {
          lastError = new EmplyError(response.status, error.message, error.detail);
          continue;
        }

        // Non-retryable error -- throw immediately
        throw new EmplyError(response.status, error.message, error.detail);
      } catch (err) {
        if (err instanceof EmplyError) {
          // If it's already an EmplyError from parseErrorResponse, re-check if it should retry
          if (
            RETRYABLE_STATUS_CODES.has(err.statusCode) &&
            attempt < this.maxRetries
          ) {
            lastError = err;
            continue;
          }
          throw err;
        }

        // Network errors and timeouts
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new EmplyConnectionError("Request was aborted");
        }

        if (attempt < this.maxRetries) {
          lastError = err as Error;
          continue;
        }

        throw new EmplyConnectionError(
          `Request to ${method} ${path} failed: ${(err as Error).message}`
        );
      }
    }

    // Should not reach here, but just in case
    throw lastError ?? new EmplyConnectionError("Request failed after retries");
  }

  private async executeRequest(
    method: HttpMethod,
    url: string,
    headers: Record<string, string>,
    body: unknown,
    signal?: AbortSignal
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // Compose signals: user signal + timeout
    const composedSignal = signal
      ? this.composeAbortSignals(signal, controller.signal)
      : controller.signal;

    try {
      const init: RequestInit = {
        method,
        headers,
        signal: composedSignal,
      };

      if (body !== undefined && method !== "GET") {
        init.body = JSON.stringify(body);
      }

      return await fetch(url, init);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildUrl(
    path: string,
    queryParams?: Record<string, string | number | undefined>
  ): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "@emply/sdk-js/1.0.0",
    };

    if (options?.idempotencyKey) {
      headers["X-Idempotency-Key"] = options.idempotencyKey;
    }

    return headers;
  }

  private async parseErrorResponse(
    response: Response
  ): Promise<{ message: string; detail: string }> {
    let detail = "Unknown error";

    try {
      const body = await response.json();
      if (typeof body === "object" && body !== null && "detail" in body) {
        detail = String((body as Record<string, unknown>).detail);
      }
    } catch {
      // Response body is not JSON
      try {
        detail = await response.text();
      } catch {
        // Could not read body at all
      }
    }

    const message = this.statusCodeMessage(response.status);
    return { message, detail };
  }

  private statusCodeMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Not Found";
      case 409:
        return "Conflict";
      case 422:
        return "Validation Error";
      case 429:
        return "Rate Limit Exceeded";
      case 500:
        return "Internal Server Error";
      case 502:
        return "Bad Gateway";
      case 503:
        return "Service Unavailable";
      case 504:
        return "Gateway Timeout";
      default:
        return `HTTP Error ${statusCode}`;
    }
  }

  private backoffDelay(attempt: number): number {
    // Exponential backoff: 500ms, 1500ms, 3500ms, ...
    const baseDelay = 500;
    const delay = baseDelay * Math.pow(2, attempt - 1);
    // Add jitter: +/- 25%
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(delay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private composeAbortSignals(
    userSignal: AbortSignal,
    timeoutSignal: AbortSignal
  ): AbortSignal {
    // If AbortSignal.any is available (Node 20+), use it
    if ("any" in AbortSignal) {
      return (AbortSignal as typeof AbortSignal & { any: (signals: AbortSignal[]) => AbortSignal }).any([
        userSignal,
        timeoutSignal,
      ]);
    }

    // Fallback: create a new controller that aborts when either fires
    const controller = new AbortController();

    const onAbort = () => controller.abort();
    userSignal.addEventListener("abort", onAbort, { once: true });
    timeoutSignal.addEventListener("abort", onAbort, { once: true });

    // Clean up if already aborted
    if (userSignal.aborted || timeoutSignal.aborted) {
      controller.abort();
    }

    return controller.signal;
  }
}
