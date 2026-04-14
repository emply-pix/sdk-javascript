import type { EmplyClient } from "../client.js";
import type {
  WebhookConfigCreate,
  WebhookConfigResponse,
  WebhookConfigUpdate,
  WebhookDeliveryResponse,
} from "../types/webhook.js";
import type { PaginatedResponse, RequestOptions } from "../types/common.js";

/**
 * Resource for managing webhook configurations and viewing delivery history.
 */
export class WebhooksResource {
  constructor(private readonly client: EmplyClient) {}

  /**
   * Create a new webhook configuration.
   *
   * @param data - Webhook configuration payload.
   * @param options - Optional request options.
   * @returns The created webhook configuration.
   *
   * @example
   * ```ts
   * const webhook = await emply.webhooks.create({
   *   url: "https://example.com/webhook",
   *   events: ["charge.paid", "charge.cancelled"],
   *   secret: "my-signing-secret",
   * });
   * ```
   */
  async create(
    data: WebhookConfigCreate,
    options?: RequestOptions
  ): Promise<WebhookConfigResponse> {
    return this.client.request<WebhookConfigResponse>(
      "POST",
      "/webhooks/config",
      data,
      options
    );
  }

  /**
   * List all webhook configurations.
   *
   * @param options - Optional request options.
   * @returns Array of webhook configurations.
   */
  async list(options?: RequestOptions): Promise<WebhookConfigResponse[]> {
    return this.client.request<WebhookConfigResponse[]>(
      "GET",
      "/webhooks/config",
      undefined,
      options
    );
  }

  /**
   * Update an existing webhook configuration.
   *
   * @param id - Webhook config UUID.
   * @param data - Fields to update.
   * @param options - Optional request options.
   * @returns The updated webhook configuration.
   */
  async update(
    id: string,
    data: WebhookConfigUpdate,
    options?: RequestOptions
  ): Promise<WebhookConfigResponse> {
    return this.client.request<WebhookConfigResponse>(
      "PUT",
      `/webhooks/config/${id}`,
      data,
      options
    );
  }

  /**
   * Delete a webhook configuration.
   *
   * @param id - Webhook config UUID.
   * @param options - Optional request options.
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    return this.client.request<void>(
      "DELETE",
      `/webhooks/config/${id}`,
      undefined,
      options
    );
  }

  /**
   * List delivery history for a webhook configuration.
   *
   * @param id - Webhook config UUID.
   * @param options - Optional request options.
   * @returns Array of delivery attempts.
   */
  async listDeliveries(
    id: string,
    options?: RequestOptions
  ): Promise<WebhookDeliveryResponse[]> {
    return this.client.request<WebhookDeliveryResponse[]>(
      "GET",
      `/webhooks/config/${id}/deliveries`,
      undefined,
      options
    );
  }
}
