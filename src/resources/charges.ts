import type { EmplyClient } from "../client.js";
import type {
  ChargeCreate,
  ChargeResponse,
  ChargeListParams,
  ChargeRefund,
} from "../types/charge.js";
import type { PaginatedResponse, RequestOptions } from "../types/common.js";

/**
 * Resource for creating, listing, and managing PIX charges.
 *
 * Supports INSTANT, BOLEPIX, CARNEPIX, and COBV charge types.
 */
export class ChargesResource {
  constructor(private readonly client: EmplyClient) {}

  /**
   * Create a new charge.
   *
   * @param data - Charge creation payload.
   * @param options - Optional request options (idempotencyKey, signal).
   * @returns The created charge.
   *
   * @example
   * ```ts
   * const charge = await emply.charges.create({
   *   amount_cents: 5000,
   *   description: "Monthly subscription",
   *   type: "INSTANT",
   * });
   * console.log(charge.qr_code_text);
   * ```
   */
  async create(
    data: ChargeCreate,
    options?: RequestOptions
  ): Promise<ChargeResponse> {
    return this.client.request<ChargeResponse>("POST", "/charges/", data, options);
  }

  /**
   * List charges with optional filters and pagination.
   *
   * @param params - Filter and pagination parameters.
   * @param options - Optional request options.
   * @returns Paginated list of charges.
   *
   * @example
   * ```ts
   * const { items, total } = await emply.charges.list({ status: "PENDING", page: 0, size: 20 });
   * ```
   */
  async list(
    params?: ChargeListParams,
    options?: RequestOptions
  ): Promise<PaginatedResponse<ChargeResponse>> {
    return this.client.request<PaginatedResponse<ChargeResponse>>(
      "GET",
      "/charges/",
      undefined,
      options,
      params as unknown as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a single charge by ID.
   *
   * @param id - Charge UUID.
   * @param options - Optional request options.
   * @returns The charge.
   */
  async get(id: string, options?: RequestOptions): Promise<ChargeResponse> {
    return this.client.request<ChargeResponse>("GET", `/charges/${id}`, undefined, options);
  }

  /**
   * Cancel a pending charge.
   *
   * @param id - Charge UUID.
   * @param options - Optional request options.
   * @returns The updated charge with status CANCELLED.
   */
  async cancel(id: string, options?: RequestOptions): Promise<ChargeResponse> {
    return this.client.request<ChargeResponse>(
      "POST",
      `/charges/${id}/cancel`,
      undefined,
      options
    );
  }

  /**
   * Refund a paid charge (full or partial).
   *
   * @param id - Charge UUID.
   * @param data - Optional refund details (amount_cents for partial refund).
   * @param options - Optional request options.
   * @returns The updated charge with status REFUNDED.
   */
  async refund(
    id: string,
    data?: ChargeRefund,
    options?: RequestOptions
  ): Promise<ChargeResponse> {
    return this.client.request<ChargeResponse>(
      "POST",
      `/charges/${id}/refund`,
      data ?? {},
      options
    );
  }

  /**
   * Simulate payment for a charge (sandbox only).
   *
   * This endpoint is only available with sandbox API keys (sk_sandbox_).
   *
   * @param id - Charge UUID.
   * @param options - Optional request options.
   * @returns The updated charge with status PAID.
   */
  async simulatePayment(
    id: string,
    options?: RequestOptions
  ): Promise<ChargeResponse> {
    return this.client.request<ChargeResponse>(
      "POST",
      `/charges/${id}/simulate-payment`,
      undefined,
      options
    );
  }

  /**
   * List all installment charges in a group (for CARNEPIX charges).
   *
   * @param groupId - Charge group UUID.
   * @param options - Optional request options.
   * @returns Array of charges in the group.
   */
  async listGroup(
    groupId: string,
    options?: RequestOptions
  ): Promise<ChargeResponse[]> {
    return this.client.request<ChargeResponse[]>(
      "GET",
      `/charges/group/${groupId}`,
      undefined,
      options
    );
  }

  /**
   * Cancel all pending charges in a group.
   *
   * @param groupId - Charge group UUID.
   * @param options - Optional request options.
   * @returns Array of updated charges.
   */
  async cancelGroup(
    groupId: string,
    options?: RequestOptions
  ): Promise<ChargeResponse[]> {
    return this.client.request<ChargeResponse[]>(
      "POST",
      `/charges/group/${groupId}/cancel`,
      undefined,
      options
    );
  }
}
