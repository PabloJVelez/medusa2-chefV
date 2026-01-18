# Stripe Connect Implementation Research for Medusa v2

- **Date**: 2026-01-17
- **Classification**: Implementation Design
- **Scope**: Payment Provider Customization for Stripe Connect with 5% Platform Fee

---

## Research Plan (What Was Validated)

1. How to create a custom payment provider in Medusa v2
2. Stripe Connect charge types and which supports application fees
3. How to implement `application_fee_amount` and `transfer_data[destination]` in PaymentIntent
4. Current project Stripe configuration and payment-related code
5. Medusa v2 payment provider interface methods
6. Best practices for testing Stripe Connect in test mode

---

## Sources

### Official Documentation
- **Medusa v2 Payment Provider Guide**: https://docs.medusajs.com/resources/references/payment/provider (2026-01-17)
- **Medusa Stripe Module Provider**: https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe (2026-01-17)
- **Stripe Connect Destination Charges**: https://docs.stripe.com/connect/destination-charges (2026-01-17)
- **Stripe Connect Application Fees**: https://docs.stripe.com/connect/marketplace/tasks/app-fees (2026-01-17)
- **Stripe Connect Direct Charges**: https://docs.stripe.com/connect/direct-charges (2026-01-17)
- **Stripe Connect Testing**: https://docs.stripe.com/connect/testing (2026-01-17)

### Internal Project References
- **Current Stripe Config**: `apps/medusa/medusa-config.ts` (lines 139-152)
- **Existing Module Patterns**: `apps/medusa/src/modules/file-b2/` and `apps/medusa/src/modules/resend/`
- **Stripe Connect Module (empty)**: `apps/medusa/src/modules/stripe-connect/` (only migrations folder exists)

---

## Findings & Analysis

### 1. Current Project State

The project currently uses the standard Medusa Stripe payment provider:

```typescript
// apps/medusa/medusa-config.ts (lines 139-152)
{
  resolve: '@medusajs/medusa/payment',
  options: {
    providers: [
      {
        resolve: '@medusajs/medusa/payment-stripe',
        id: 'stripe',
        options: {
          apiKey: STRIPE_API_KEY,
        },
      },
    ],
  },
},
```

**Key observations:**
- Uses `@medusajs/medusa/payment-stripe` default provider
- Only `apiKey` is configured (no Connect-specific options)
- An empty `stripe-connect` module directory exists at `apps/medusa/src/modules/stripe-connect/` (suggesting prior intent to implement)

### 2. Stripe Connect Charge Types Comparison

| Charge Type | Merchant of Record | Application Fee Support | Best For |
|-------------|-------------------|------------------------|----------|
| **Destination Charges** | Platform | ✅ Yes (`application_fee_amount` + `transfer_data[destination]`) | Single vendor per transaction, platform controls UX |
| **Direct Charges** | Connected Account | ✅ Yes (`application_fee_amount`) | Connected account appears to customer |
| **Separate Charges & Transfers** | Platform | ✅ Yes (retain fee by reducing transfer) | Multiple vendors per transaction |

**Recommendation**: Use **Destination Charges** for this project because:
- Platform (developer's Stripe account) is the merchant of record
- Single chef (ChefV as connected account) per transaction
- Simpler implementation with clear fee visibility
- Platform controls the customer experience

> **CLARIFICATION (2026-01-17)**: The developer's personal/business Stripe account is the **platform account** that collects the 5% fee. ChefV (the chef) is the **connected account** that receives 95% of payments.

### 3. Medusa v2 Payment Provider Interface

To create a custom payment provider, you must extend `AbstractPaymentProvider` and implement these methods:

```typescript
import { AbstractPaymentProvider } from "@medusajs/framework/utils"

class StripeConnectProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "stripe-connect"
  
  // Required methods:
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput>
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput>
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput>
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput>
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput>
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput>
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput>
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput>
  async getWebhookActionAndData(data: WebhookActionData): Promise<WebhookActionResult>
}
```

### 4. Key Implementation: PaymentIntent with Connect Parameters

The critical change is in `initiatePayment` where we create the PaymentIntent:

```typescript
// Standard Stripe PaymentIntent (current)
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountTotal,
  currency: currency,
  automatic_payment_methods: { enabled: true },
});

// Stripe Connect PaymentIntent (new)
const applicationFeeAmount = Math.round(amountTotal * (feePercent / 100));

const paymentIntent = await stripe.paymentIntents.create({
  amount: amountTotal,
  currency: currency,
  automatic_payment_methods: { enabled: true },
  application_fee_amount: applicationFeeAmount,
  transfer_data: {
    destination: connectedAccountId, // e.g., "acct_1234ABC..."
  },
});
```

### 5. Environment Variables Required

```bash
# Existing
STRIPE_API_KEY=sk_test_... # Platform's Stripe secret key (developer's account)

# New for Connect
STRIPE_CONNECTED_ACCOUNT_ID=acct_... # ChefV's connected account ID
PLATFORM_FEE_PERCENT=5 # Platform fee percentage (5%)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook secret for Connect events
REFUND_APPLICATION_FEE=false # Config-driven: if true, refunds include platform fee (default: false)
```

> **Note**: `STRIPE_API_KEY` is the developer's (platform) Stripe secret key. `STRIPE_CONNECTED_ACCOUNT_ID` is ChefV's connected account ID.

### 6. Stripe Connect Account Setup Requirements

**Platform Account (Developer's Personal/Business Stripe Account):**
- Enable Stripe Connect in Dashboard
- Use platform's API keys for all operations
- Configure webhook endpoints for Connect events
- This account collects the 5% platform fee

**Connected Account (ChefV - the chef):**
- Account type: **Express** (recommended for simplicity)
  - Stripe handles onboarding/KYC
  - ChefV gets limited dashboard access
  - Platform has control over fees
- Alternative: **Custom** (more control, more responsibility)
- Receives 95% of each payment (after platform fee)

**For Testing:**
- Create test connected accounts via Dashboard or API
- Use test card numbers (e.g., 4242 4242 4242 4242)
- Test SMS verification code: `000-000`

> **CLARIFICATION (2026-01-17)**: This is a single-chef model. ChefV is the only connected account. No plans to support multiple chefs/vendors.

### 7. Refund Handling (Config-Driven)

Application fees are **NOT** automatically refunded by Stripe. The platform has a **config-driven** approach:

**Default Behavior (`REFUND_APPLICATION_FEE=false`):**
- When a refund is processed, the platform fee is **NOT** refunded
- Platform keeps the 5% fee even when the customer is refunded
- ChefV (connected account) bears the full refund amount

**Optional Behavior (`REFUND_APPLICATION_FEE=true`):**
- When enabled, refunds **include** the platform fee
- Platform refunds the 5% fee back to the customer
- Both platform and ChefV share the refund proportionally

```typescript
// Config-driven refund implementation
const refundApplicationFee = process.env.REFUND_APPLICATION_FEE === 'true';

const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  refund_application_fee: refundApplicationFee, // Config-driven
});
```

> **CLARIFICATION (2026-01-17)**: Default behavior is to NOT refund the platform fee. This can be changed via environment variable if business requirements change.

### 8. Webhook Events for Connect

Key events to handle:
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `transfer.created` - Funds transferred to connected account
- `application_fee.created` - Platform fee collected
- `charge.refunded` - Refund processed
- `account.updated` - Connected account status changed

---

## Implementation Approaches

### Approach A: Create New Custom Payment Provider (Recommended)

**Pros:**
- Clean separation from default Stripe provider
- Full control over Connect-specific logic
- Can coexist with standard Stripe if needed
- Follows Medusa v2 module provider patterns

**Cons:**
- More code to write and maintain
- Need to implement all payment provider methods

**Implementation:**
1. Create `apps/medusa/src/modules/stripe-connect/service.ts`
2. Create `apps/medusa/src/modules/stripe-connect/index.ts`
3. Register in `medusa-config.ts` as a new payment provider

### Approach B: Fork/Extend Default Stripe Provider

**Pros:**
- Less code duplication
- Inherit existing functionality

**Cons:**
- Tightly coupled to Medusa's internal implementation
- May break on Medusa updates
- More complex to maintain

**Not Recommended** for this project.

---

## Tradeoffs & Considerations

### Fee Calculation
- **Percentage-based (5%)**: `Math.round(amount * 0.05)`
- **Fixed amount**: `500` (e.g., $5.00)
- **Hybrid**: Percentage with min/max caps

**Recommendation**: Start with configurable percentage via environment variable.

### Who Pays Stripe Processing Fees?
- **Platform pays** (default for destination charges): Stripe's ~2.9% + $0.30 comes from platform's portion
- **Connected account pays**: Requires `controller.fees.payer` configuration

**Recommendation**: Platform pays (simpler, default behavior).

### Currency Handling
- Application fee must be in same currency as charge
- Cross-border payments may have additional fees

### Single vs Multiple Connected Accounts
- Current scope: Single chef (single connected account)
- Future consideration: Store connected account ID per chef in database

---

## Recommendation

**Implement Approach A: Create a new custom Stripe Connect payment provider module.**

This approach:
1. Creates `apps/medusa/src/modules/stripe-connect/` with full implementation
2. Uses destination charges with `application_fee_amount` and `transfer_data[destination]`
3. Stores connected account ID and fee percentage in environment variables
4. Handles webhooks for Connect-specific events
5. Properly handles refunds with `refund_application_fee: true`

---

## Repo Next Steps (Checklist)

- [ ] **Stripe Dashboard Setup**
  - [ ] Enable Stripe Connect on platform account
  - [ ] Create test connected account for chef
  - [ ] Configure webhook endpoints for Connect events
  - [ ] Note connected account ID for environment variable

- [ ] **Environment Configuration**
  - [ ] Add `STRIPE_CONNECTED_ACCOUNT_ID` to `.env` (ChefV's connected account ID)
  - [ ] Add `PLATFORM_FEE_PERCENT` to `.env` (default: 5)
  - [ ] Add `REFUND_APPLICATION_FEE` to `.env` (default: false)
  - [ ] Update `STRIPE_WEBHOOK_SECRET` for Connect webhooks

- [ ] **Module Implementation**
  - [ ] Create `apps/medusa/src/modules/stripe-connect/service.ts`
  - [ ] Create `apps/medusa/src/modules/stripe-connect/index.ts`
  - [ ] Implement all payment provider methods
  - [ ] Add Connect-specific webhook handling

- [ ] **Configuration Update**
  - [ ] Update `medusa-config.ts` to use new provider
  - [ ] Configure provider options (apiKey, connectedAccountId, feePercent)

- [ ] **Testing**
  - [ ] Test payment flow with test cards
  - [ ] Verify fee splitting (95% to ChefV, 5% to platform)
  - [ ] Test refund flow with `REFUND_APPLICATION_FEE=false` (platform keeps fee)
  - [ ] Test refund flow with `REFUND_APPLICATION_FEE=true` (platform fee refunded)
  - [ ] Test webhook handling

- [ ] **Documentation**
  - [ ] Document new environment variables
  - [ ] Document Stripe Connect setup process
  - [ ] Update deployment documentation

---

## Risks & Open Questions

### Risks
1. **Breaking existing payments**: Ensure smooth transition from standard Stripe to Connect
2. **Webhook configuration**: Must update webhook endpoints for Connect events
3. **Refund complexity**: Application fees require explicit refund handling

### Open Questions (Resolved)

| Question | Answer |
|----------|--------|
| Who is the platform account? | **Developer's personal/business Stripe account** - collects 5% fee |
| Who is the connected account? | **ChefV** (the chef) - receives 95% of payments |
| What Stripe Connect account type for ChefV? | **Express** - Stripe handles onboarding, simpler setup |
| Support multiple connected accounts? | **No** - single chef model (ChefV only) |
| How to handle refunds? | **Config-driven**: Default is NOT to refund platform fee. Set `REFUND_APPLICATION_FEE=true` to include platform fee in refunds |
| Which charge type to use? | **Destination charges** - platform (developer) is merchant of record |

### Remaining Open Questions
1. Should the platform fee be visible to customers during checkout?
2. What happens if the connected account is not fully onboarded?
3. How to handle disputes/chargebacks under Connect model?

---

## References

- [Medusa v2 Payment Provider Guide](https://docs.medusajs.com/resources/references/payment/provider)
- [Stripe Connect Destination Charges](https://docs.stripe.com/connect/destination-charges)
- [Stripe Connect Application Fees](https://docs.stripe.com/connect/marketplace/tasks/app-fees)
- [Stripe Connect Testing](https://docs.stripe.com/connect/testing)
- [Blog: Medusa Marketplace Stripe Connect](https://blog.perseides.org/medusa-marketplace-5-stripe-connect)
