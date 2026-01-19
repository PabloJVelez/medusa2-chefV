/**
 * Stripe Connect Payment Provider Types
 *
 * Configuration options for the Stripe Connect payment provider
 * that enables platform fee collection via destination charges.
 */

/**
 * Options passed to the Stripe Connect payment provider during initialization.
 */
export interface StripeConnectProviderOptions {
  /**
   * The Stripe API key for the platform account.
   * This is the secret key from the platform's Stripe dashboard.
   */
  apiKey: string

  /**
   * The connected account ID (e.g., acct_1234ABC...) that will receive
   * the payment minus the platform fee.
   * Optional - when not set, works like regular Stripe (no platform fees).
   */
  connectedAccountId?: string

  /**
   * The platform fee percentage (0-100) to collect on each transaction.
   * @default 5
   */
  feePercent?: number

  /**
   * Whether to refund the platform's application fee when processing refunds.
   * - true: Platform fee is refunded along with the payment
   * - false: Platform keeps the fee, connected account bears full refund
   * @default false
   */
  refundApplicationFee?: boolean

  /**
   * The webhook secret for verifying Stripe webhook signatures.
   */
  webhookSecret?: string

  /**
   * Whether to enable automatic payment methods on PaymentIntents.
   * @default true
   */
  automaticPaymentMethods?: boolean

  /**
   * Whether to capture payments automatically or require manual capture.
   * @default "automatic"
   */
  captureMethod?: "automatic" | "manual"
}

/**
 * Internal configuration derived from provider options.
 */
export interface StripeConnectConfig {
  apiKey: string
  connectedAccountId: string
  feePercent: number
  refundApplicationFee: boolean
  webhookSecret?: string
  automaticPaymentMethods: boolean
  captureMethod: "automatic" | "manual"
}

/**
 * Data stored in payment session/payment data property.
 */
export interface StripeConnectPaymentData {
  /**
   * The Stripe PaymentIntent ID.
   */
  id: string

  /**
   * The client secret for confirming the PaymentIntent on the frontend.
   */
  client_secret?: string

  /**
   * The current status of the PaymentIntent.
   */
  status?: string

  /**
   * The amount in the smallest currency unit.
   */
  amount?: number

  /**
   * The currency code (e.g., "usd").
   */
  currency?: string

  /**
   * The connected account ID for the transfer.
   */
  connected_account_id?: string

  /**
   * The application fee amount in the smallest currency unit.
   */
  application_fee_amount?: number
}
