import type { EmplyClient } from "../client.js";
import type {
  TransactionResponse,
  TransactionListParams,
} from "../types/transaction.js";
import type { PaginatedResponse, RequestOptions } from "../types/common.js";

/**
 * Resource for querying transaction history.
 *
 * Transactions are read-only records created automatically when
 * charges are paid, refunded, etc.
 */
export class TransactionsResource {
  constructor(private readonly client: EmplyClient) {}

  /**
   * List transactions with optional filters and pagination.
   *
   * @param params - Filter and pagination parameters.
   * @param options - Optional request options.
   * @returns Paginated list of transactions.
   *
   * @example
   * ```ts
   * const { items, total } = await emply.transactions.list({
   *   type: "CREDIT",
   *   start_date: "2026-04-01",
   *   end_date: "2026-04-30",
   * });
   * ```
   */
  async list(
    params?: TransactionListParams,
    options?: RequestOptions
  ): Promise<PaginatedResponse<TransactionResponse>> {
    return this.client.request<PaginatedResponse<TransactionResponse>>(
      "GET",
      "/transactions/",
      undefined,
      options,
      params as unknown as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a single transaction by ID.
   *
   * @param id - Transaction UUID.
   * @param options - Optional request options.
   * @returns The transaction.
   */
  async get(
    id: string,
    options?: RequestOptions
  ): Promise<TransactionResponse> {
    return this.client.request<TransactionResponse>(
      "GET",
      `/transactions/${id}`,
      undefined,
      options
    );
  }
}
