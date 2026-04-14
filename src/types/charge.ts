/**
 * Charge types supported by Emply.
 */
export type ChargeType = "INSTANT" | "BOLEPIX" | "CARNEPIX" | "COBV";

/**
 * Charge statuses.
 */
export type ChargeStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED"
  | "FAILED"
  | "EXPIRED";

/**
 * Payload to create a new charge.
 */
export interface ChargeCreate {
  /** Amount in cents (e.g., 5000 = R$ 50.00). */
  amount_cents: number;
  /** Human-readable description of the charge. */
  description: string;
  /** Charge type. Defaults to INSTANT if omitted. */
  type?: ChargeType;
  /** Optional client UUID to associate with this charge. */
  client_id?: string;
  /** Due date for COBV/BOLEPIX charges (ISO 8601). */
  due_date?: string;
  /** Number of installments for CARNEPIX charges. */
  installments?: number;
  /** Days between installments for CARNEPIX charges. */
  installment_interval?: number;
}

/**
 * Full charge object returned by the API.
 */
export interface ChargeResponse {
  id: string;
  company_id: string;
  client_id: string | null;
  correlation_id: string;
  amount_cents: number;
  description: string;
  status: ChargeStatus;
  type: ChargeType;
  pix_key: string;
  qr_code_text: string;
  qr_code_image_url: string;
  due_date: string | null;
  paid_at: string | null;
  provider_id: string | null;
  charge_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * Parameters for listing charges.
 */
export interface ChargeListParams {
  /** Filter by charge status. */
  status?: ChargeStatus;
  /** Filter by charge type. */
  type?: ChargeType;
  /** Page number (0-based). */
  page?: number;
  /** Items per page (1-100). */
  size?: number;
}

/**
 * Payload for refunding a paid charge.
 */
export interface ChargeRefund {
  /** Amount to refund in cents. If omitted, full refund. */
  amount_cents?: number;
  /** Reason for the refund. */
  reason?: string;
}
