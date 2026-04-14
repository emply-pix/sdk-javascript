/**
 * Payload to create a new client (customer).
 */
export interface ClientCreate {
  /** Full name. */
  name: string;
  /** Email address. */
  email: string;
  /** CPF (11 digits) or CNPJ (14 digits), numbers only. */
  cpf_cnpj: string;
  /** Phone number, numbers only (e.g., "11999999999"). */
  phone?: string;
}

/**
 * Full client object returned by the API.
 */
export interface ClientResponse {
  id: string;
  company_id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for updating an existing client.
 * All fields are optional; only provided fields are updated.
 */
export interface ClientUpdate {
  name?: string;
  email?: string;
  cpf_cnpj?: string;
  phone?: string;
}

/**
 * Parameters for listing clients.
 */
export interface ClientListParams {
  /** Search by name, email, or CPF/CNPJ. */
  search?: string;
  /** Page number (0-based). */
  page?: number;
  /** Items per page (1-100). */
  size?: number;
}
