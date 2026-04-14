# @emply/sdk

Official JavaScript/TypeScript SDK for the [Emply](https://emply.com.br) payment API. Process PIX payments, manage customers, subscriptions, and webhooks with fully typed methods.

## Requirements

- Node.js 18+ (uses native `fetch`)
- TypeScript 5.0+ (optional, but recommended)

## Installation

```bash
npm install @emply/sdk
```

## Quick Start

```typescript
import { Emply } from "@emply/sdk";

const emply = new Emply({ apiKey: "sk_sandbox_your_key_here" });

// Create a PIX charge
const charge = await emply.charges.create({
  amount_cents: 5000, // R$ 50.00
  description: "Order #123",
  type: "INSTANT",
});

console.log(charge.qr_code_text); // PIX copy-paste code
console.log(charge.qr_code_image_url); // QR code image
```

## Configuration

```typescript
const emply = new Emply({
  // Required: API key determines the environment automatically
  //   sk_sandbox_  -->  sandbox
  //   sk_live_     -->  production
  apiKey: "sk_live_your_key_here",

  // Optional: override base URL (default: https://api.emply.com.br/api/v1)
  baseUrl: "https://api.emply.com.br/api/v1",

  // Optional: request timeout in ms (default: 30000)
  timeout: 30000,

  // Optional: max retries on transient errors (default: 2)
  maxRetries: 2,
});

// Check detected environment
console.log(emply.environment); // "sandbox" or "production"
```

## Resources

### Charges

Create and manage PIX charges. Supports INSTANT, BOLEPIX, CARNEPIX, and COBV types.

```typescript
// Create a charge
const charge = await emply.charges.create({
  amount_cents: 10000,
  description: "Monthly subscription",
  type: "COBV",
  client_id: "client-uuid",
  due_date: "2026-05-01T00:00:00Z",
});

// Create a CARNEPIX (installments)
const carneCharge = await emply.charges.create({
  amount_cents: 30000,
  description: "Equipment purchase",
  type: "CARNEPIX",
  client_id: "client-uuid",
  installments: 3,
  installment_interval: 30,
});

// List charges with filters
const { items, total } = await emply.charges.list({
  status: "PENDING",
  type: "INSTANT",
  page: 0,
  size: 20,
});

// Get a single charge
const charge = await emply.charges.get("charge-uuid");

// Cancel a pending charge
const cancelled = await emply.charges.cancel("charge-uuid");

// Refund a paid charge (full)
const refunded = await emply.charges.refund("charge-uuid");

// Refund a paid charge (partial)
const partialRefund = await emply.charges.refund("charge-uuid", {
  amount_cents: 2500,
  reason: "Partial refund",
});

// Simulate payment (sandbox only)
const paid = await emply.charges.simulatePayment("charge-uuid");

// List installments in a group
const installments = await emply.charges.listGroup("group-uuid");

// Cancel all pending installments
const cancelledGroup = await emply.charges.cancelGroup("group-uuid");
```

### Clients

Manage customers who receive charges.

```typescript
// Create a client
const client = await emply.clients.create({
  name: "Maria Silva",
  email: "maria@example.com",
  cpf_cnpj: "12345678901",
  phone: "11999999999",
});

// List clients with search
const { items, total } = await emply.clients.list({
  search: "maria",
  page: 0,
  size: 20,
});

// Get a client
const client = await emply.clients.get("client-uuid");

// Update a client
const updated = await emply.clients.update("client-uuid", {
  phone: "11988888888",
});

// Delete a client
await emply.clients.delete("client-uuid");
```

### Subscriptions

Manage recurring billing.

```typescript
// Create a subscription
const sub = await emply.subscriptions.create({
  name: "Plano Mensal",
  client_id: "client-uuid",
  amount_cents: 9900,
  interval: "MONTHLY",
  description: "Monthly plan",
  start_date: "2026-05-01",
});

// List subscriptions
const { items, total } = await emply.subscriptions.list({
  status: "ACTIVE",
  page: 0,
});

// Get a subscription
const sub = await emply.subscriptions.get("sub-uuid");

// Update subscription
const updated = await emply.subscriptions.update("sub-uuid", {
  amount_cents: 12900,
});

// Pause
const paused = await emply.subscriptions.pause("sub-uuid");

// Resume
const resumed = await emply.subscriptions.resume("sub-uuid");

// Cancel (permanent)
const cancelled = await emply.subscriptions.cancel("sub-uuid");
```

### Transactions

Query transaction history.

```typescript
// List transactions
const { items, total } = await emply.transactions.list({
  type: "CREDIT",
  start_date: "2026-04-01",
  end_date: "2026-04-30",
  page: 0,
});

// Get a transaction
const tx = await emply.transactions.get("tx-uuid");
```

### Statements

Account statements and balance.

```typescript
// Get statement for a date range
const statement = await emply.statements.get({
  start_date: "2026-04-01",
  end_date: "2026-04-30",
});
console.log(statement.total_credit_cents);
console.log(statement.total_debit_cents);
console.log(statement.entries);

// Get current balance
const balance = await emply.statements.balance();
console.log(`Available: R$ ${(balance.available_cents / 100).toFixed(2)}`);
console.log(`Pending: R$ ${(balance.pending_cents / 100).toFixed(2)}`);
```

### Webhooks

Configure webhook endpoints and view delivery history.

```typescript
// Create a webhook config
const webhook = await emply.webhooks.create({
  url: "https://example.com/webhook",
  events: ["charge.paid", "charge.cancelled", "charge.expired"],
  secret: "my-signing-secret",
});

// List webhook configs
const configs = await emply.webhooks.list();

// Update a webhook config
const updated = await emply.webhooks.update("webhook-uuid", {
  events: ["charge.paid"],
  is_active: false,
});

// Delete a webhook config
await emply.webhooks.delete("webhook-uuid");

// View delivery history
const deliveries = await emply.webhooks.listDeliveries("webhook-uuid");
```

## Error Handling

All API errors throw an `EmplyError` with structured information.

```typescript
import { Emply, EmplyError, EmplyRateLimitError } from "@emply/sdk";

try {
  const charge = await emply.charges.get("nonexistent-uuid");
} catch (error) {
  if (error instanceof EmplyRateLimitError) {
    // 429 Too Many Requests
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds.`);
  } else if (error instanceof EmplyError) {
    console.log(error.statusCode); // 404
    console.log(error.message); // "Not Found"
    console.log(error.detail); // "Charge not found"
  }
}
```

Error status codes:
| Code | Meaning |
|------|---------|
| 400 | Bad Request - invalid parameters |
| 401 | Unauthorized - invalid or missing API key |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found - resource does not exist |
| 409 | Conflict - duplicate or conflicting operation |
| 422 | Validation Error - request body validation failed |
| 429 | Rate Limit - 100 requests/minute exceeded |
| 500 | Server Error - internal server error |

## Idempotency

Prevent duplicate operations by passing an idempotency key on POST requests.

```typescript
const charge = await emply.charges.create(
  {
    amount_cents: 5000,
    description: "Order #123",
  },
  { idempotencyKey: "order-123-charge" }
);
```

If the same idempotency key is sent again, the API returns the original response instead of creating a duplicate.

## Request Cancellation

Cancel in-flight requests using `AbortSignal`.

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const charges = await emply.charges.list(
    { page: 0 },
    { signal: controller.signal }
  );
} catch (error) {
  if (error instanceof EmplyError && error.message === "Request was aborted") {
    console.log("Request was cancelled");
  }
}
```

## Webhook Signature Verification

Verify that incoming webhooks are authentic using HMAC-SHA256 signatures.

```typescript
import { verifyWebhookSignature } from "@emply/sdk/webhook";
// or: import { verifyWebhookSignature } from "@emply/sdk";
```

### Express

```typescript
import express from "express";
import { verifyWebhookSignature } from "@emply/sdk/webhook";

const app = express();

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["x-webhook-signature"] as string;
    const isValid = verifyWebhookSignature(
      req.body,
      signature,
      process.env.WEBHOOK_SECRET!
    );

    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    switch (event.type) {
      case "charge.paid":
        console.log(`Charge ${event.data.id} was paid!`);
        break;
      case "charge.cancelled":
        console.log(`Charge ${event.data.id} was cancelled.`);
        break;
    }

    res.status(200).send("OK");
  }
);
```

### Fastify

```typescript
import Fastify from "fastify";
import { verifyWebhookSignature } from "@emply/sdk/webhook";

const fastify = Fastify();

fastify.addContentTypeParser(
  "application/json",
  { parseAs: "buffer" },
  (req, body, done) => done(null, body)
);

fastify.post("/webhook", async (request, reply) => {
  const signature = request.headers["x-webhook-signature"] as string;
  const isValid = verifyWebhookSignature(
    request.body as Buffer,
    signature,
    process.env.WEBHOOK_SECRET!
  );

  if (!isValid) {
    return reply.status(401).send("Invalid signature");
  }

  const event = JSON.parse((request.body as Buffer).toString());
  // Handle event...

  return reply.status(200).send("OK");
});
```

### Test Signatures

Use `constructWebhookSignature` to generate signatures for testing.

```typescript
import {
  verifyWebhookSignature,
  constructWebhookSignature,
} from "@emply/sdk/webhook";

const payload = JSON.stringify({ type: "charge.paid", data: { id: "123" } });
const secret = "test-secret";

const signature = constructWebhookSignature(payload, secret);
const isValid = verifyWebhookSignature(payload, signature, secret); // true
```

## Webhook Events

| Event | Description |
|-------|-------------|
| `charge.created` | A new charge was created |
| `charge.paid` | A charge was paid |
| `charge.cancelled` | A charge was cancelled |
| `charge.refunded` | A charge was refunded |
| `charge.expired` | A charge expired |
| `subscription.created` | A subscription was created |
| `subscription.cancelled` | A subscription was cancelled |
| `subscription.paused` | A subscription was paused |
| `subscription.resumed` | A subscription was resumed |
| `client.created` | A client was created |
| `client.updated` | A client was updated |

## Pagination

All list methods return a `PaginatedResponse<T>` with `items` and `total`.

```typescript
// Fetch all charges across pages
async function fetchAllCharges(emply: Emply) {
  const allCharges = [];
  let page = 0;
  const size = 100;
  let total = Infinity;

  while (allCharges.length < total) {
    const response = await emply.charges.list({ page, size });
    allCharges.push(...response.items);
    total = response.total;
    page++;
  }

  return allCharges;
}
```

## TypeScript

All types are exported and available for use in your code.

```typescript
import type {
  ChargeCreate,
  ChargeResponse,
  ChargeType,
  ChargeStatus,
  ClientCreate,
  ClientResponse,
  SubscriptionCreate,
  SubscriptionInterval,
  PaginatedResponse,
  EmplyConfig,
} from "@emply/sdk";
```

## License

MIT
