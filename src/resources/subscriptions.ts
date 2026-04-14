import type { EmplyClient } from "../client.js";
import type {
  SubscriptionCreate,
  SubscriptionResponse,
  SubscriptionUpdate,
  SubscriptionListParams,
} from "../types/subscription.js";
import type { PaginatedResponse, RequestOptions } from "../types/common.js";

/**
 * Resource for managing recurring billing subscriptions.
 */
export class SubscriptionsResource {
  constructor(private readonly client: EmplyClient) {}

  /**
   * Create a new subscription.
   *
   * Charges will be generated automatically based on the interval,
   * starting from `start_date`.
   *
   * @param data - Subscription creation payload.
   * @param options - Optional request options.
   * @returns The created subscription.
   *
   * @example
   * ```ts
   * const sub = await emply.subscriptions.create({
   *   name: "Plano Mensal",
   *   client_id: "client-uuid",
   *   amount_cents: 9900,
   *   interval: "MONTHLY",
   *   start_date: "2026-05-01",
   * });
   * ```
   */
  async create(
    data: SubscriptionCreate,
    options?: RequestOptions
  ): Promise<SubscriptionResponse> {
    return this.client.request<SubscriptionResponse>(
      "POST",
      "/subscriptions/",
      data,
      options
    );
  }

  /**
   * List subscriptions with optional filters and pagination.
   *
   * @param params - Filter and pagination parameters.
   * @param options - Optional request options.
   * @returns Paginated list of subscriptions.
   */
  async list(
    params?: SubscriptionListParams,
    options?: RequestOptions
  ): Promise<PaginatedResponse<SubscriptionResponse>> {
    return this.client.request<PaginatedResponse<SubscriptionResponse>>(
      "GET",
      "/subscriptions/",
      undefined,
      options,
      params as unknown as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a single subscription by ID.
   *
   * @param id - Subscription UUID.
   * @param options - Optional request options.
   * @returns The subscription.
   */
  async get(
    id: string,
    options?: RequestOptions
  ): Promise<SubscriptionResponse> {
    return this.client.request<SubscriptionResponse>(
      "GET",
      `/subscriptions/${id}`,
      undefined,
      options
    );
  }

  /**
   * Update an existing subscription.
   *
   * Only name, amount_cents, and description can be updated.
   *
   * @param id - Subscription UUID.
   * @param data - Fields to update.
   * @param options - Optional request options.
   * @returns The updated subscription.
   */
  async update(
    id: string,
    data: SubscriptionUpdate,
    options?: RequestOptions
  ): Promise<SubscriptionResponse> {
    return this.client.request<SubscriptionResponse>(
      "PUT",
      `/subscriptions/${id}`,
      data,
      options
    );
  }

  /**
   * Pause an active subscription.
   *
   * Paused subscriptions will not generate new charges until resumed.
   *
   * @param id - Subscription UUID.
   * @param options - Optional request options.
   * @returns The updated subscription with status PAUSED.
   */
  async pause(
    id: string,
    options?: RequestOptions
  ): Promise<SubscriptionResponse> {
    return this.client.request<SubscriptionResponse>(
      "POST",
      `/subscriptions/${id}/pause`,
      undefined,
      options
    );
  }

  /**
   * Resume a paused subscription.
   *
   * @param id - Subscription UUID.
   * @param options - Optional request options.
   * @returns The updated subscription with status ACTIVE.
   */
  async resume(
    id: string,
    options?: RequestOptions
  ): Promise<SubscriptionResponse> {
    return this.client.request<SubscriptionResponse>(
      "POST",
      `/subscriptions/${id}/resume`,
      undefined,
      options
    );
  }

  /**
   * Cancel a subscription permanently.
   *
   * Cancelled subscriptions cannot be resumed.
   *
   * @param id - Subscription UUID.
   * @param options - Optional request options.
   * @returns The updated subscription with status CANCELLED.
   */
  async cancel(
    id: string,
    options?: RequestOptions
  ): Promise<SubscriptionResponse> {
    return this.client.request<SubscriptionResponse>(
      "POST",
      `/subscriptions/${id}/cancel`,
      undefined,
      options
    );
  }
}
