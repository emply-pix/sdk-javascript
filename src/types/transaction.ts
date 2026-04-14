/**
 * Transaction types.
 */
export type TransactionType = "CREDIT" | "DEBIT";

/**
 * Full transaction object returned by the API.
 */
export interface TransactionResponse {
  id: string;
  company_id: string;
  charge_id: string | null;
  type: TransactionType;
  amount_cents: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

/**
 * Parameters for listing transactions.
 */
export interface TransactionListParams {
  /** Filter by transaction type. */
  type?: TransactionType;
  /** Start date filter (ISO 8601). */
  start_date?: string;
  /** End date filter (ISO 8601). */
  end_date?: string;
  /** Page number (0-based). */
  page?: number;
  /** Items per page (1-100). */
  size?: number;
}
