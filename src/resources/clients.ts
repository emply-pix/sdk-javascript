import type { EmplyClient } from "../client.js";
import type {
  ClientCreate,
  ClientResponse,
  ClientUpdate,
  ClientListParams,
} from "../types/client.js";
import type { PaginatedResponse, RequestOptions } from "../types/common.js";

/**
 * Resource for managing clients (customers) who receive charges.
 */
export class ClientsResource {
  constructor(private readonly client: EmplyClient) {}

  /**
   * Create a new client.
   *
   * @param data - Client creation payload.
   * @param options - Optional request options.
   * @returns The created client.
   *
   * @example
   * ```ts
   * const client = await emply.clients.create({
   *   name: "Maria Silva",
   *   email: "maria@example.com",
   *   cpf_cnpj: "12345678901",
   *   phone: "11999999999",
   * });
   * ```
   */
  async create(
    data: ClientCreate,
    options?: RequestOptions
  ): Promise<ClientResponse> {
    return this.client.request<ClientResponse>("POST", "/clients/", data, options);
  }

  /**
   * List clients with optional search and pagination.
   *
   * @param params - Search and pagination parameters.
   * @param options - Optional request options.
   * @returns Paginated list of clients.
   *
   * @example
   * ```ts
   * const { items, total } = await emply.clients.list({ search: "maria", page: 0 });
   * ```
   */
  async list(
    params?: ClientListParams,
    options?: RequestOptions
  ): Promise<PaginatedResponse<ClientResponse>> {
    return this.client.request<PaginatedResponse<ClientResponse>>(
      "GET",
      "/clients/",
      undefined,
      options,
      params as unknown as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a single client by ID.
   *
   * @param id - Client UUID.
   * @param options - Optional request options.
   * @returns The client.
   */
  async get(id: string, options?: RequestOptions): Promise<ClientResponse> {
    return this.client.request<ClientResponse>(
      "GET",
      `/clients/${id}`,
      undefined,
      options
    );
  }

  /**
   * Update an existing client. Only provided fields are updated.
   *
   * @param id - Client UUID.
   * @param data - Fields to update.
   * @param options - Optional request options.
   * @returns The updated client.
   */
  async update(
    id: string,
    data: ClientUpdate,
    options?: RequestOptions
  ): Promise<ClientResponse> {
    return this.client.request<ClientResponse>(
      "PUT",
      `/clients/${id}`,
      data,
      options
    );
  }

  /**
   * Delete a client.
   *
   * @param id - Client UUID.
   * @param options - Optional request options.
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    return this.client.request<void>("DELETE", `/clients/${id}`, undefined, options);
  }
}
