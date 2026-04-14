import type { EmplyClient } from "../client.js";
import type {
  StatementResponse,
  BalanceResponse,
  StatementParams,
} from "../types/statement.js";
import type { RequestOptions } from "../types/common.js";

/**
 * Resource for querying account statements and balance.
 */
export class StatementsResource {
  constructor(private readonly client: EmplyClient) {}

  /**
   * Get account statement for a date range.
   *
   * @param params - Start and end dates.
   * @param options - Optional request options.
   * @returns Statement with entries and totals.
   *
   * @example
   * ```ts
   * const statement = await emply.statements.get({
   *   start_date: "2026-04-01",
   *   end_date: "2026-04-30",
   * });
   * console.log(`Credits: ${statement.total_credit_cents}`);
   * ```
   */
  async get(
    params: StatementParams,
    options?: RequestOptions
  ): Promise<StatementResponse> {
    return this.client.request<StatementResponse>(
      "GET",
      "/statements/",
      undefined,
      options,
      params as unknown as Record<string, string | number | undefined>
    );
  }

  /**
   * Get current account balance.
   *
   * @param options - Optional request options.
   * @returns Balance with available, pending, and total amounts.
   *
   * @example
   * ```ts
   * const balance = await emply.statements.balance();
   * console.log(`Available: R$ ${(balance.available_cents / 100).toFixed(2)}`);
   * ```
   */
  async balance(options?: RequestOptions): Promise<BalanceResponse> {
    return this.client.request<BalanceResponse>(
      "GET",
      "/statements/balance",
      undefined,
      options
    );
  }
}
