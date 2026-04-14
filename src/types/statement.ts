/**
 * Account statement entry.
 */
export interface StatementEntry {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount_cents: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

/**
 * Statement response containing entries for a date range.
 */
export interface StatementResponse {
  entries: StatementEntry[];
  total_credit_cents: number;
  total_debit_cents: number;
  start_date: string;
  end_date: string;
}

/**
 * Account balance response.
 */
export interface BalanceResponse {
  available_cents: number;
  pending_cents: number;
  total_cents: number;
  updated_at: string;
}

/**
 * Parameters for fetching a statement.
 */
export interface StatementParams {
  /** Start date (ISO 8601 date string). */
  start_date: string;
  /** End date (ISO 8601 date string). */
  end_date: string;
}
