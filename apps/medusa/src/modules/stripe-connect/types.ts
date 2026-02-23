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
  apiKey: string;

  /**
   * The connected account ID (e.g., acct_1234ABC...) that will receive
   * the payment minus the platform fee.
   * Optional - when not set, works like regular Stripe (no platform fees).
   */
  connectedAccountId?: string;

  /**
   * The platform fee percentage (0-100) to collect on each transaction.
   * @default 5
   */
  feePercent?: number;

  /**
   * Whether to include Stripe's processing fees in the application fee calculation.
   * If true, the application fee will be increased to cover Stripe fees, ensuring
   * the platform receives the feePercent as net after Stripe fees.
   *
   * Example: With feePercent=5 and includeStripeFees=true on $149.99 payment:
   * - Stripe fee: ~$4.65 (2.9% + $0.30)
   * - Application fee: $7.50 (5%) + $4.65 (Stripe fees) = $12.15
   * - Platform net: $12.15 - $4.65 = $7.50 (5% as desired)
   * - Connected account receives: $149.99 - $12.15 = $137.84
   *
   * @default false (platform fee is calculated before Stripe fees are deducted)
   */
  includeStripeFees?: boolean;

  /**
   * Whether to refund the platform's application fee when processing refunds.
   * - true: Platform fee is refunded along with the payment
   * - false: Platform keeps the fee, connected account bears full refund
   * @default false
   */
  refundApplicationFee?: boolean;

  /**
   * The webhook secret for verifying Stripe webhook signatures.
   */
  webhookSecret?: string;

  /**
   * Whether to enable automatic payment methods on PaymentIntents.
   * @default true
   */
  automaticPaymentMethods?: boolean;

  /**
   * Whether to capture payments automatically or require manual capture.
   * @default "automatic"
   */
  captureMethod?: 'automatic' | 'manual';
}

/**
 * Internal configuration derived from provider options.
 */
export interface StripeConnectConfig {
  apiKey: string;
  connectedAccountId: string;
  feePercent: number;
  refundApplicationFee: boolean;
  includeStripeFees: boolean;
  webhookSecret?: string;
  automaticPaymentMethods: boolean;
  captureMethod: 'automatic' | 'manual';
}

/**
 * Data stored in payment session/payment data property.
 */
export interface StripeConnectPaymentData {
  /**
   * The Stripe PaymentIntent ID.
   */
  id: string;

  /**
   * The client secret for confirming the PaymentIntent on the frontend.
   */
  client_secret?: string;

  /**
   * The current status of the PaymentIntent.
   */
  status?: string;

  /**
   * The amount in the smallest currency unit.
   */
  amount?: number;

  /**
   * The currency code (e.g., "usd").
   */
  currency?: string;

  /**
   * The connected account ID for the transfer.
   */
  connected_account_id?: string;

  /**
   * The application fee amount in the smallest currency unit.
   */
  application_fee_amount?: number;
}
