/**
 * Stripe Connect Payment Provider Service
 *
 * Implements Medusa's AbstractPaymentProvider for Stripe Connect,
 * enabling platform fee collection via destination charges.
 *
 * Payment Flow:
 * 1. Customer pays full amount to platform
 * 2. Platform collects application fee (configurable %)
 * 3. Remaining amount transfers to connected account
 */

import Stripe from 'stripe';
import { AbstractPaymentProvider, MedusaError, PaymentSessionStatus, BigNumber } from '@medusajs/framework/utils';
import type {
  Logger,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from '@medusajs/framework/types';
import type { StripeConnectProviderOptions, StripeConnectConfig, StripeConnectPaymentData } from './types';

type InjectedDependencies = {
  logger: Logger;
};

class StripeConnectProviderService extends AbstractPaymentProvider<StripeConnectProviderOptions> {
  // Keep identifier as 'stripe' to maintain frontend compatibility
  // The frontend expects 'pp_stripe_stripe' as the provider ID
  static identifier = 'stripe';

  protected config_: StripeConnectConfig;
  protected logger_: Logger;
  protected stripe_: Stripe;

  constructor({ logger }: InjectedDependencies, options: StripeConnectProviderOptions) {
    super({ logger }, options);

    // Validate required options
    if (!options.apiKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Stripe API key is required for stripe-connect provider');
    }

    // Validate connected account ID format if provided
    let connectedAccountId = options.connectedAccountId || '';
    if (connectedAccountId && !connectedAccountId.startsWith('acct_')) {
      logger.warn(
        `[stripe] Invalid connected account ID format: "${connectedAccountId}". Connected account IDs should start with "acct_". Platform fees will be DISABLED.`,
      );
      connectedAccountId = ''; // Disable Connect features for invalid account ID
    }

    // Build internal config with defaults
    // connectedAccountId is optional - when not set, works like regular Stripe (no platform fees)
    this.config_ = {
      apiKey: options.apiKey,
      connectedAccountId,
      feePercent: options.feePercent ?? 5,
      refundApplicationFee: options.refundApplicationFee ?? false,
      includeStripeFees: options.includeStripeFees ?? false,
      webhookSecret: options.webhookSecret,
      automaticPaymentMethods: options.automaticPaymentMethods ?? true,
      captureMethod: options.captureMethod ?? 'automatic',
    };

    this.logger_ = logger;
    this.stripe_ = new Stripe(this.config_.apiKey);

    if (this.config_.connectedAccountId) {
      this.logger_.info(
        `[stripe] Stripe Connect provider initialized with connected account: ${this.config_.connectedAccountId}, fee: ${this.config_.feePercent}%`,
      );
    } else {
      this.logger_.warn(
        `[stripe] Stripe Connect provider initialized WITHOUT connected account - platform fees disabled. Set STRIPE_CONNECTED_ACCOUNT_ID to enable.`,
      );
    }
  }

  /**
   * Convert BigNumber/BigNumberInput to a numeric value in smallest currency unit.
   * Medusa passes amounts that may be BigNumber objects.
   *
   * IMPORTANT: Medusa sometimes passes amounts in dollars (with decimals) instead of cents.
   * We detect this and multiply by 100 when needed.
   */
  private convertToSmallestUnit(amount: unknown): number {
    if (amount === null || amount === undefined) {
      return 0;
    }

    let numericValue: number | null = null;

    // Handle BigNumber objects (they have a numeric property or can be converted via toString)
    if (typeof amount === 'object' && amount !== null) {
      // BigNumber from @medusajs/framework/utils has a numeric value accessible
      const bigNum = amount as { value?: string; numeric?: number; toString?: () => string };

      // Try to get numeric value
      if (typeof bigNum.numeric === 'number') {
        numericValue = bigNum.numeric;
      }
      // Try to convert via toString
      else if (typeof bigNum.toString === 'function') {
        const strValue = bigNum.toString();
        const parsed = parseFloat(strValue);
        if (!isNaN(parsed)) {
          numericValue = parsed;
        }
      }
      // Try value property
      else if (typeof bigNum.value === 'string') {
        const parsed = parseFloat(bigNum.value);
        if (!isNaN(parsed)) {
          numericValue = parsed;
        }
      }
    }
    // Handle string
    else if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      if (!isNaN(parsed)) {
        numericValue = parsed;
      }
    }
    // Handle number
    else if (typeof amount === 'number') {
      numericValue = amount;
    }

    if (numericValue === null) {
      this.logger_.warn(`[stripe] Could not convert amount to number: ${JSON.stringify(amount)}, defaulting to 0`);
      return 0;
    }

    // Detect if amount is in dollars format (has decimal places)
    // e.g., 149.99 is dollars, 14999 is cents
    // Key insight: if the number has decimal places, it's definitely in dollars
    // because Stripe amounts in cents are always whole numbers
    const hasDecimalPlaces = numericValue !== Math.floor(numericValue);

    if (hasDecimalPlaces) {
      // Amount has decimal places, so it must be in dollars - convert to cents
      return Math.round(numericValue * 100);
    }

    // Amount is a whole number - assume it's already in cents
    return Math.round(numericValue);
  }

  /**
   * Calculate the application fee amount based on the total amount.
   *
   * If includeStripeFees is true, adds estimated Stripe processing fees to ensure
   * the platform receives the feePercent as net after Stripe fees are deducted.
   *
   * Stripe fees are estimated as 2.9% + $0.30 (typical for US cards).
   * Actual Stripe fees may vary slightly based on card type, country, etc.
   */
  private calculateApplicationFee(amount: number): number {
    if (this.config_.feePercent <= 0) {
      return 0;
    }

    // Calculate base platform fee (percentage of amount)
    const baseFee = Math.round(amount * (this.config_.feePercent / 100));

    // If not including Stripe fees, return base fee
    if (!this.config_.includeStripeFees) {
      return baseFee;
    }

    // Estimate Stripe processing fees (2.9% + $0.30)
    // Stripe fee = (amount * 0.029) + 30 cents (in smallest currency unit)
    const estimatedStripeFee = Math.round(amount * 0.029) + 30;

    // Application fee = platform fee + Stripe fees (so platform nets the platform fee)
    // This ensures platform receives feePercent as net after Stripe fees
    const applicationFee = baseFee + estimatedStripeFee;

    this.logger_.debug(
      `[stripe] Fee calculation: amount=${amount}, platformFee=${baseFee} (${this.config_.feePercent}%), ` +
        `estimatedStripeFee=${estimatedStripeFee}, applicationFee=${applicationFee}`,
    );

    return applicationFee;
  }

  /**
   * Map Stripe PaymentIntent status to Medusa PaymentSessionStatus.
   */
  private mapStripeStatus(stripeStatus: Stripe.PaymentIntent.Status): PaymentSessionStatus {
    switch (stripeStatus) {
      case 'succeeded':
        return PaymentSessionStatus.CAPTURED;
      case 'processing':
        return PaymentSessionStatus.PENDING;
      case 'requires_capture':
        return PaymentSessionStatus.AUTHORIZED;
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return PaymentSessionStatus.REQUIRES_MORE;
      case 'canceled':
        return PaymentSessionStatus.CANCELED;
      default:
        return PaymentSessionStatus.PENDING;
    }
  }

  /**
   * Safely extract payment intent ID from data object.
   */
  private getPaymentIntentId(data?: Record<string, unknown>): string | undefined {
    if (!data) return undefined;
    return data.id as string | undefined;
  }

  /**
   * Initiates a payment by creating a Stripe PaymentIntent with Connect parameters.
   *
   * This creates a PaymentIntent with:
   * - application_fee_amount: Platform's fee
   * - transfer_data.destination: Connected account to receive funds
   */
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context } = input;

    // Properly convert BigNumber/BigNumberInput to number
    // Medusa passes amount as BigNumber which needs proper conversion
    const amountInSmallestUnit = this.convertToSmallestUnit(amount);
    const applicationFeeAmount = this.calculateApplicationFee(amountInSmallestUnit);

    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: amountInSmallestUnit,
        currency: currency_code.toLowerCase(),
        capture_method: this.config_.captureMethod,
        metadata: {
          // Store session and resource IDs for webhook correlation
          ...(context && {
            session_id: String((context as Record<string, unknown>).session_id || ''),
            resource_id: String((context as Record<string, unknown>).resource_id || ''),
          }),
        },
      };

      // Add automatic payment methods if enabled
      if (this.config_.automaticPaymentMethods) {
        paymentIntentParams.automatic_payment_methods = { enabled: true };
      }

      // Add Connect-specific parameters for destination charges ONLY if connected account is configured
      if (this.config_.connectedAccountId) {
        if (applicationFeeAmount > 0) {
          paymentIntentParams.application_fee_amount = applicationFeeAmount;
        }

        paymentIntentParams.transfer_data = {
          destination: this.config_.connectedAccountId,
        };
      }

      const paymentIntent = await this.stripe_.paymentIntents.create(paymentIntentParams);

      this.logger_.info(
        `[stripe] Created PaymentIntent ${paymentIntent.id}: ${amountInSmallestUnit} ${currency_code}` +
          (this.config_.connectedAccountId ? `, fee: ${applicationFeeAmount} (${this.config_.feePercent}%)` : ''),
      );

      const paymentData: StripeConnectPaymentData = {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret || undefined,
        status: paymentIntent.status,
        amount: amountInSmallestUnit,
        currency: currency_code.toLowerCase(),
        connected_account_id: this.config_.connectedAccountId || undefined,
        application_fee_amount: this.config_.connectedAccountId ? applicationFeeAmount : undefined,
      };

      return {
        id: paymentIntent.id,
        data: paymentData as unknown as Record<string, unknown>,
      };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      this.logger_.error(
        `[stripe] Failed to create PaymentIntent: ${stripeError.message}` +
          (stripeError.code ? ` (code: ${stripeError.code})` : '') +
          (stripeError.param ? ` (param: ${stripeError.param})` : ''),
      );

      // Provide helpful error messages for common Connect issues
      if (stripeError.code === 'account_invalid' || stripeError.param === 'transfer_data[destination]') {
        this.logger_.error(
          `[stripe] The connected account "${this.config_.connectedAccountId}" is invalid or not connected to your platform. ` +
            `Please verify the account ID and ensure it's properly onboarded via Stripe Connect.`,
        );
      }

      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        `Failed to initiate payment: ${stripeError.message}`,
      );
    }
  }

  /**
   * Authorizes a payment session.
   *
   * For Stripe with automatic capture, the payment is already captured when this is called.
   * We return AUTHORIZED for succeeded payments since Medusa expects this status
   * to proceed with cart completion. The actual capture is already done by Stripe.
   */
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const { data } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'PaymentIntent ID is required for authorization');
    }

    try {
      const paymentIntent = await this.stripe_.paymentIntents.retrieve(paymentIntentId);

      // For automatic capture mode, 'succeeded' means already captured
      // We return AUTHORIZED because Medusa expects this to proceed with order completion
      // The capturePayment method will handle the already-captured case gracefully
      let status: PaymentSessionStatus;
      if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
        status = PaymentSessionStatus.AUTHORIZED;
      } else {
        status = this.mapStripeStatus(paymentIntent.status);
      }

      return {
        status,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      };
    } catch (error) {
      this.logger_.error(`[stripe] Failed to authorize payment: ${(error as Error).message}`);
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        `Failed to authorize payment: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Captures an authorized payment.
   *
   * Only needed if capture_method is "manual".
   * With capture_method: "automatic", this may still be called by Medusa
   * but the payment will already be captured - we handle that gracefully.
   */
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const { data } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'PaymentIntent ID is required for capture');
    }

    try {
      // First, retrieve the current status to check if already captured
      const existingIntent = await this.stripe_.paymentIntents.retrieve(paymentIntentId);

      // If already captured (succeeded), return the existing data
      if (existingIntent.status === 'succeeded') {
        return {
          data: {
            id: existingIntent.id,
            status: existingIntent.status,
            amount: existingIntent.amount,
            currency: existingIntent.currency,
          },
        };
      }

      // If not captured yet, capture it
      if (existingIntent.status === 'requires_capture') {
        const paymentIntent = await this.stripe_.paymentIntents.capture(paymentIntentId);

        return {
          data: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        };
      }

      // For other statuses, return current state
      this.logger_.warn(
        `[stripe] PaymentIntent ${paymentIntentId} in unexpected state for capture: ${existingIntent.status}`,
      );
      return {
        data: {
          id: existingIntent.id,
          status: existingIntent.status,
          amount: existingIntent.amount,
          currency: existingIntent.currency,
        },
      };
    } catch (error) {
      this.logger_.error(`[stripe] Failed to capture payment: ${(error as Error).message}`);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to capture payment: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Refunds a payment.
   *
   * The refund_application_fee parameter is config-driven:
   * - false (default): Platform keeps the fee, connected account bears full refund
   * - true: Platform fee is also refunded proportionally
   */
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const { data, amount } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'PaymentIntent ID is required for refund');
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        refund_application_fee: this.config_.refundApplicationFee,
      };

      // Add amount if partial refund (properly convert BigNumber)
      if (amount) {
        refundParams.amount = this.convertToSmallestUnit(amount);
      }

      const refund = await this.stripe_.refunds.create(refundParams);

      this.logger_.debug(
        `[stripe-connect] Refunded ${refund.amount} for PaymentIntent ${paymentIntentId}, refund_application_fee: ${this.config_.refundApplicationFee}`,
      );

      return {
        data: {
          id: refund.id,
          payment_intent: paymentIntentId,
          amount: refund.amount,
          status: refund.status,
        },
      };
    } catch (error) {
      this.logger_.error(`[stripe-connect] Failed to refund payment: ${(error as Error).message}`);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to refund payment: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Cancels a payment by canceling the PaymentIntent.
   */
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const { data } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'PaymentIntent ID is required for cancellation');
    }

    try {
      const paymentIntent = await this.stripe_.paymentIntents.cancel(paymentIntentId);

      this.logger_.debug(`[stripe-connect] Canceled PaymentIntent ${paymentIntentId}`);

      return {
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      };
    } catch (error) {
      // If already canceled or cannot be canceled, that's okay
      if ((error as Stripe.errors.StripeError).code === 'payment_intent_unexpected_state') {
        this.logger_.warn(`[stripe-connect] PaymentIntent ${paymentIntentId} already in final state`);
        return {
          data: {
            id: paymentIntentId,
            status: 'canceled',
          },
        };
      }

      this.logger_.error(`[stripe-connect] Failed to cancel payment: ${(error as Error).message}`);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to cancel payment: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Deletes payment session data.
   *
   * For Stripe, we cancel the PaymentIntent if it's still active.
   */
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const { data } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      // Nothing to delete
      return { data: {} };
    }

    try {
      // Try to cancel if not already in final state
      const paymentIntent = await this.stripe_.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'canceled' && paymentIntent.status !== 'succeeded') {
        await this.stripe_.paymentIntents.cancel(paymentIntentId);
        this.logger_.debug(`[stripe-connect] Deleted (canceled) PaymentIntent ${paymentIntentId}`);
      }

      return { data: {} };
    } catch (error) {
      // Log but don't fail - deletion is best effort
      this.logger_.warn(
        `[stripe-connect] Could not delete PaymentIntent ${paymentIntentId}: ${(error as Error).message}`,
      );
      return { data: {} };
    }
  }

  /**
   * Retrieves the current status of a payment.
   */
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const { data } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'PaymentIntent ID is required for retrieval');
    }

    try {
      const paymentIntent = await this.stripe_.paymentIntents.retrieve(paymentIntentId);

      return {
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          client_secret: paymentIntent.client_secret,
        },
      };
    } catch (error) {
      this.logger_.error(`[stripe-connect] Failed to retrieve payment: ${(error as Error).message}`);
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Failed to retrieve payment: ${(error as Error).message}`);
    }
  }

  /**
   * Gets the payment status from Stripe.
   */
  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const { data } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      return { status: PaymentSessionStatus.PENDING };
    }

    try {
      const paymentIntent = await this.stripe_.paymentIntents.retrieve(paymentIntentId);

      const status = this.mapStripeStatus(paymentIntent.status);

      return {
        status,
        data: {
          id: paymentIntent.id,
          stripe_status: paymentIntent.status,
        },
      };
    } catch (error) {
      this.logger_.warn(`[stripe-connect] Could not get payment status: ${(error as Error).message}`);
      return { status: PaymentSessionStatus.ERROR };
    }
  }

  /**
   * Updates a payment (e.g., amount change).
   */
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const { data, amount, currency_code } = input;
    const paymentIntentId = this.getPaymentIntentId(data);

    if (!paymentIntentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'PaymentIntent ID is required for update');
    }

    try {
      const updateParams: Stripe.PaymentIntentUpdateParams = {};

      if (amount !== undefined) {
        const amountInSmallestUnit = Math.round(typeof amount === 'number' ? amount : Number(amount));
        updateParams.amount = amountInSmallestUnit;

        // Recalculate application fee for new amount
        const applicationFeeAmount = this.calculateApplicationFee(amountInSmallestUnit);
        if (applicationFeeAmount > 0) {
          updateParams.application_fee_amount = applicationFeeAmount;
        }
      }

      if (currency_code) {
        updateParams.currency = currency_code.toLowerCase();
      }

      const paymentIntent = await this.stripe_.paymentIntents.update(paymentIntentId, updateParams);

      this.logger_.debug(`[stripe-connect] Updated PaymentIntent ${paymentIntentId}`);

      const paymentData: StripeConnectPaymentData = {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret || undefined,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        connected_account_id: this.config_.connectedAccountId,
        application_fee_amount: paymentIntent.application_fee_amount || undefined,
      };

      return {
        data: paymentData as unknown as Record<string, unknown>,
      };
    } catch (error) {
      this.logger_.error(`[stripe-connect] Failed to update payment: ${(error as Error).message}`);
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        `Failed to update payment: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Handles Stripe webhook events.
   *
   * Returns the appropriate action for Medusa to take based on the event type.
   */
  async getWebhookActionAndData(payload: ProviderWebhookPayload['payload']): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload;

    // Verify webhook signature if secret is configured
    if (this.config_.webhookSecret && rawData && headers) {
      const signature = headers['stripe-signature'];
      if (signature) {
        try {
          this.stripe_.webhooks.constructEvent(
            rawData as string | Buffer,
            signature as string,
            this.config_.webhookSecret,
          );
        } catch (error) {
          this.logger_.error(`[stripe-connect] Webhook signature verification failed: ${(error as Error).message}`);
          return {
            action: 'failed',
            data: {
              session_id: '',
              amount: new BigNumber(0),
            },
          };
        }
      }
    }

    // Cast data to Stripe event
    const event = data as unknown as Stripe.Event;

    if (!event || !event.type) {
      this.logger_.warn('[stripe-connect] Received webhook with no event type');
      return {
        action: 'not_supported',
        data: {
          session_id: '',
          amount: new BigNumber(0),
        },
      };
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const sessionId = (paymentIntent.metadata?.session_id as string) || paymentIntent.id;

          this.logger_.debug(`[stripe-connect] Webhook: payment_intent.succeeded for ${paymentIntent.id}`);

          return {
            action: 'captured',
            data: {
              session_id: sessionId,
              amount: new BigNumber(paymentIntent.amount),
            },
          };
        }

        case 'payment_intent.amount_capturable_updated': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const sessionId = (paymentIntent.metadata?.session_id as string) || paymentIntent.id;

          this.logger_.debug(
            `[stripe-connect] Webhook: payment_intent.amount_capturable_updated for ${paymentIntent.id}`,
          );

          return {
            action: 'authorized',
            data: {
              session_id: sessionId,
              amount: new BigNumber(paymentIntent.amount_capturable || 0),
            },
          };
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const sessionId = (paymentIntent.metadata?.session_id as string) || paymentIntent.id;

          this.logger_.warn(`[stripe-connect] Webhook: payment_intent.payment_failed for ${paymentIntent.id}`);

          return {
            action: 'failed',
            data: {
              session_id: sessionId,
              amount: new BigNumber(paymentIntent.amount),
            },
          };
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          const paymentIntentId = charge.payment_intent as string;
          const sessionId = paymentIntentId || charge.id;

          this.logger_.debug(`[stripe-connect] Webhook: charge.refunded for ${sessionId}`);

          return {
            action: 'not_supported',
            data: {
              session_id: sessionId,
              amount: new BigNumber(charge.amount_refunded || 0),
            },
          };
        }

        default:
          this.logger_.debug(`[stripe-connect] Webhook: unhandled event type ${event.type}`);
          return {
            action: 'not_supported',
            data: {
              session_id: '',
              amount: new BigNumber(0),
            },
          };
      }
    } catch (error) {
      this.logger_.error(`[stripe-connect] Webhook processing error: ${(error as Error).message}`);
      return {
        action: 'failed',
        data: {
          session_id: '',
          amount: new BigNumber(0),
        },
      };
    }
  }
}

export default StripeConnectProviderService;
