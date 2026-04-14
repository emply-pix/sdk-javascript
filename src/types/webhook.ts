/**
 * Webhook event types that can be subscribed to.
 */
export type WebhookEvent =
  | "charge.created"
  | "charge.paid"
  | "charge.cancelled"
  | "charge.refunded"
  | "charge.expired"
  | "subscription.created"
  | "subscription.cancelled"
  | "subscription.paused"
  | "subscription.resumed"
  | "client.created"
  | "client.updated";

/**
 * Payload to create a new webhook configuration.
 */
export interface WebhookConfigCreate {
  /** URL to receive webhook POST requests. Must be HTTPS. */
  url: string;
  /** List of event types to subscribe to. */
  events: WebhookEvent[];
  /** Optional HMAC-SHA256 secret for signature verification. */
  secret?: string;
}

/**
 * Full webhook configuration returned by the API.
 */
export interface WebhookConfigResponse {
  id: string;
  company_id: string;
  url: string;
  events: WebhookEvent[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for updating an existing webhook configuration.
 */
export interface WebhookConfigUpdate {
  url?: string;
  events?: WebhookEvent[];
  secret?: string;
  is_active?: boolean;
}

/**
 * Individual delivery attempt for a webhook.
 */
export interface WebhookDeliveryResponse {
  id: string;
  webhook_config_id: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status_code: number | null;
  response_body: string | null;
  success: boolean;
  attempted_at: string;
}
