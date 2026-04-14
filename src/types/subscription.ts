/**
 * Billing intervals for subscriptions.
 */
export type SubscriptionInterval =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUAL"
  | "ANNUAL";

/**
 * Subscription statuses.
 */
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

/**
 * Payload to create a new subscription.
 */
export interface SubscriptionCreate {
  /** Display name for the subscription plan. */
  name: string;
  /** Client UUID to bill. */
  client_id: string;
  /** Recurring amount in cents. */
  amount_cents: number;
  /** Billing interval. */
  interval: SubscriptionInterval;
  /** Optional description. */
  description?: string;
  /** Start date (ISO 8601 date string, e.g., "2026-05-01"). */
  start_date?: string;
}

/**
 * Full subscription object returned by the API.
 */
export interface SubscriptionResponse {
  id: string;
  company_id: string;
  client_id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  interval: SubscriptionInterval;
  status: SubscriptionStatus;
  start_date: string;
  next_billing_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for updating an existing subscription.
 */
export interface SubscriptionUpdate {
  name?: string;
  amount_cents?: number;
  description?: string;
}

/**
 * Parameters for listing subscriptions.
 */
export interface SubscriptionListParams {
  /** Filter by status. */
  status?: SubscriptionStatus;
  /** Filter by client ID. */
  client_id?: string;
  /** Page number (0-based). */
  page?: number;
  /** Items per page (1-100). */
  size?: number;
}
