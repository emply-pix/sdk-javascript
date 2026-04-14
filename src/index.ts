import { EmplyClient, type EmplyClientConfig } from "./client.js";
import { ChargesResource } from "./resources/charges.js";
import { ClientsResource } from "./resources/clients.js";
import { SubscriptionsResource } from "./resources/subscriptions.js";
import { TransactionsResource } from "./resources/transactions.js";
import { StatementsResource } from "./resources/statements.js";
import { WebhooksResource } from "./resources/webhooks.js";

/**
 * Configuration options for the Emply SDK.
 */
export interface EmplyConfig {
  /**
   * Your Emply API key.
   *
   * Keys starting with `sk_sandbox_` target the sandbox environment.
   * Keys starting with `sk_live_` target the production environment.
   */
  apiKey: string;

  /**
   * Override the default API base URL.
   * @default "https://api.emply.com.br/api/v1"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of automatic retries on transient errors (5xx, timeouts).
   * @default 2
   */
  maxRetries?: number;
}

/**
 * Main entry point for the Emply SDK.
 *
 * @example
 * ```ts
 * import { Emply } from "@emply/sdk";
 *
 * const emply = new Emply({ apiKey: "sk_sandbox_your_key" });
 *
 * // Create a PIX charge
 * const charge = await emply.charges.create({
 *   amount_cents: 5000,
 *   description: "Order #123",
 * });
 *
 * // Check balance
 * const balance = await emply.statements.balance();
 * ```
 */
export class Emply {
  /** PIX charges: create, list, cancel, refund, simulate. */
  public readonly charges: ChargesResource;
  /** Client (customer) management: create, list, update, delete. */
  public readonly clients: ClientsResource;
  /** Recurring billing subscriptions: create, pause, resume, cancel. */
  public readonly subscriptions: SubscriptionsResource;
  /** Transaction history: list and get. */
  public readonly transactions: TransactionsResource;
  /** Account statements and balance. */
  public readonly statements: StatementsResource;
  /** Webhook configuration and delivery history. */
  public readonly webhooks: WebhooksResource;

  /** The detected environment based on the API key prefix. */
  public readonly environment: "sandbox" | "production";

  private readonly _client: EmplyClient;

  constructor(config: EmplyConfig) {
    const clientConfig: EmplyClientConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
    };

    this._client = new EmplyClient(clientConfig);
    this.environment = this._client.environment;

    this.charges = new ChargesResource(this._client);
    this.clients = new ClientsResource(this._client);
    this.subscriptions = new SubscriptionsResource(this._client);
    this.transactions = new TransactionsResource(this._client);
    this.statements = new StatementsResource(this._client);
    this.webhooks = new WebhooksResource(this._client);
  }
}

// ── Re-exports ──────────────────────────────────────────────────────────────

// Main class
export { EmplyClient } from "./client.js";
export type { EmplyClientConfig } from "./client.js";

// Resources
export { ChargesResource } from "./resources/charges.js";
export { ClientsResource } from "./resources/clients.js";
export { SubscriptionsResource } from "./resources/subscriptions.js";
export { TransactionsResource } from "./resources/transactions.js";
export { StatementsResource } from "./resources/statements.js";
export { WebhooksResource } from "./resources/webhooks.js";

// Types — Charges
export type {
  ChargeType,
  ChargeStatus,
  ChargeCreate,
  ChargeResponse,
  ChargeListParams,
  ChargeRefund,
} from "./types/charge.js";

// Types — Clients
export type {
  ClientCreate,
  ClientResponse,
  ClientUpdate,
  ClientListParams,
} from "./types/client.js";

// Types — Subscriptions
export type {
  SubscriptionInterval,
  SubscriptionStatus,
  SubscriptionCreate,
  SubscriptionResponse,
  SubscriptionUpdate,
  SubscriptionListParams,
} from "./types/subscription.js";

// Types — Webhooks
export type {
  WebhookEvent,
  WebhookConfigCreate,
  WebhookConfigResponse,
  WebhookConfigUpdate,
  WebhookDeliveryResponse,
} from "./types/webhook.js";

// Types — Transactions
export type {
  TransactionType,
  TransactionResponse,
  TransactionListParams,
} from "./types/transaction.js";

// Types — Statements
export type {
  StatementEntry,
  StatementResponse,
  BalanceResponse,
  StatementParams,
} from "./types/statement.js";

// Types — Common
export {
  EmplyError,
  EmplyRateLimitError,
  EmplyConnectionError,
} from "./types/common.js";
export type {
  PaginatedResponse,
  PaginationParams,
  RequestOptions,
} from "./types/common.js";

// Utilities
export {
  verifyWebhookSignature,
  constructWebhookSignature,
} from "./utils/webhook-verify.js";
