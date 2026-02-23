# Stripe Connect Environment Variables

## Required Variables

These environment variables must be configured for the Stripe Connect payment provider to function:

### `STRIPE_API_KEY` (existing)
The Stripe secret API key for the **platform account** (your Stripe account).
- Format: `sk_test_...` (test mode) or `sk_live_...` (production)
- Obtain from: [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)

### `STRIPE_CONNECTED_ACCOUNT_ID` (new)
The Stripe account ID for the **connected account** (ChefV's Stripe account).
- Format: `acct_...`
- Obtain from: [Stripe Dashboard → Connect → Accounts](https://dashboard.stripe.com/connect/accounts/overview)
- This is ChefV's connected account that will receive 95% of payments

## Optional Variables

### `PLATFORM_FEE_PERCENT` (new)
The percentage of each payment to collect as a platform fee.
- Default: `5`
- Valid range: 0-100
- Example: `PLATFORM_FEE_PERCENT=5` means 5% goes to platform, 95% to connected account

### `REFUND_APPLICATION_FEE` (new)
Whether to refund the platform's application fee when processing refunds.
- Default: `false`
- When `false`: Platform keeps the fee on refunds (connected account bears full refund)
- When `true`: Platform fee is also refunded proportionally
- Example: `REFUND_APPLICATION_FEE=false`

### `INCLUDE_STRIPE_FEES` (new)
Whether to include Stripe's processing fees in the application fee calculation.
- Default: `false`
- When `false`: Application fee is calculated as a percentage of the payment amount. Platform pays Stripe fees separately, so net platform fee is less than feePercent.
- When `true`: Application fee includes estimated Stripe fees (2.9% + $0.30), ensuring platform receives feePercent as net after Stripe fees.
- Example with `INCLUDE_STRIPE_FEES=true` and `PLATFORM_FEE_PERCENT=5` on $149.99 payment:
  - Application fee: $7.50 (5%) + $4.65 (estimated Stripe fees) = $12.15
  - Platform net: $12.15 - $4.65 = $7.50 (5% as desired)
  - Connected account receives: $149.99 - $12.15 = $137.84
- Example: `INCLUDE_STRIPE_FEES=false`

### `STRIPE_WEBHOOK_SECRET` (existing, may need update)
The webhook signing secret for verifying Stripe webhook events.
- Format: `whsec_...`
- Obtain from: [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
- Note: You may need to update your webhook endpoint to handle Connect events

## Example Configuration

```bash
# Platform Account (your Stripe account)
STRIPE_API_KEY=sk_test_51ABC123...

# Connected Account (ChefV's Stripe account)
STRIPE_CONNECTED_ACCOUNT_ID=acct_1DEF456...

# Fee Configuration
PLATFORM_FEE_PERCENT=5

# Refund Behavior
REFUND_APPLICATION_FEE=false

# Webhook Security
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

## Stripe Dashboard Setup

Before using these environment variables, ensure:

1. **Platform Account Setup**
   - Enable Stripe Connect on your account
   - Complete platform onboarding requirements
   - Set up Connect webhooks

2. **Connected Account Setup**
   - Create or link ChefV's Express account
   - Complete onboarding and verification
   - Note the account ID (`acct_...`)

3. **Webhook Configuration**
   - Add webhook endpoint for your Medusa backend
   - Subscribe to Connect-relevant events:
     - `payment_intent.succeeded`
     - `payment_intent.amount_capturable_updated`
     - `payment_intent.payment_failed`
     - `charge.refunded`

## Testing

For testing, use Stripe test mode:
- Use test API key (`sk_test_...`)
- Use test connected accounts
- Use test card: `4242 4242 4242 4242`

See: [Stripe Connect Testing Guide](https://docs.stripe.com/connect/testing)
