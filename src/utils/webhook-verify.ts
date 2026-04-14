import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify the HMAC-SHA256 signature of an incoming webhook request.
 *
 * Emply signs every webhook delivery with the secret configured on the
 * webhook endpoint. The signature is sent in the `X-Webhook-Signature` header
 * as a hex-encoded HMAC-SHA256 digest of the raw request body.
 *
 * @param payload - The raw request body as a string or Buffer.
 * @param signature - The value of the `X-Webhook-Signature` header.
 * @param secret - The webhook secret configured in your Emply dashboard.
 * @returns `true` if the signature is valid, `false` otherwise.
 *
 * @example Express middleware
 * ```ts
 * import { verifyWebhookSignature } from "@emply/sdk/webhook";
 *
 * app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
 *   const signature = req.headers["x-webhook-signature"] as string;
 *   const isValid = verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET!);
 *
 *   if (!isValid) {
 *     return res.status(401).send("Invalid signature");
 *   }
 *
 *   const event = JSON.parse(req.body.toString());
 *   // Handle event...
 *   res.status(200).send("OK");
 * });
 * ```
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    const expectedSignature = createHmac("sha256", secret)
      .update(typeof payload === "string" ? payload : payload)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    // Constant-time comparison to prevent timing attacks
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Construct the expected webhook signature for a given payload and secret.
 *
 * Useful for testing or debugging webhook integrations.
 *
 * @param payload - The raw request body.
 * @param secret - The webhook secret.
 * @returns Hex-encoded HMAC-SHA256 signature.
 */
export function constructWebhookSignature(
  payload: string | Buffer,
  secret: string
): string {
  return createHmac("sha256", secret)
    .update(typeof payload === "string" ? payload : payload)
    .digest("hex");
}
