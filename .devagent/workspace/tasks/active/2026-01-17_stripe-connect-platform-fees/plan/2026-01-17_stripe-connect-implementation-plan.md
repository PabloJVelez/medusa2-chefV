# Stripe Connect with 5% Platform Fee Implementation Plan

- Owner: PabloJVelez
- Last Updated: 2026-01-17
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-17_stripe-connect-platform-fees/`
- Stakeholders: PabloJVelez (Owner, Decision Maker)

---

## PART 1: PRODUCT CONTEXT

### Summary

This plan implements Stripe Connect to enable the platform (developer's Stripe account) to collect a 5% application fee on all payments, with 95% automatically transferred to ChefV's connected account. The implementation creates a new custom payment provider module that extends Medusa v2's payment provider interface, using Stripe's destination charges model for clean fee splitting and platform control.

### Context & Problem

**Current State:**
- The project uses `@medusajs/medusa/payment-stripe` standard provider
- All payments go directly to a single Stripe account
- No mechanism exists for platform fee collection

**Business Trigger:**
- Platform needs to collect a 5% commission on all transactions
- Developer's Stripe account should be the merchant of record (platform)
- ChefV should receive 95% of each payment as a connected account

**Technical Trigger:**
- Empty `stripe-connect` module directory exists at `apps/medusa/src/modules/stripe-connect/` (prior intent to implement)
- Current config at `apps/medusa/medusa-config.ts` (lines 139-152) needs replacement

### Objectives & Success Metrics

| Objective | Metric | Target |
|-----------|--------|--------|
| Platform fee collection | Platform receives application fee | 5% of each transaction |
| Connected account payouts | ChefV receives remainder | 95% of each transaction |
| Config-driven fee | Fee percentage configurable | Via `PLATFORM_FEE_PERCENT` env var |
| Config-driven refunds | Refund behavior configurable | Via `REFUND_APPLICATION_FEE` env var |
| Payment flow continuity | Existing checkout works | No breaking changes to storefront |

### Users & Insights

**Platform (Developer):**
- Collects 5% application fee on all transactions
- Uses existing Stripe account as platform account
- Manages connected account relationship

**Connected Account (ChefV):**
- Receives 95% of each payment
- Uses Express account type (Stripe handles onboarding)
- Single chef model (no multi-vendor support)

**Customers:**
- No visible change to checkout experience
- Payment processed by platform (developer's Stripe)

### Solution Principles

1. **Clean Separation**: New custom payment provider module, not a fork of existing Stripe provider
2. **Config-Driven**: All Connect-specific values (account ID, fee %, refund behavior) via environment variables
3. **Medusa v2 Patterns**: Follow existing module patterns (`file-b2`, `resend`) for consistency
4. **Destination Charges**: Platform is merchant of record, transfers to connected account
5. **Single Chef Model**: One connected account (ChefV), no multi-vendor complexity

### Scope Definition

**In Scope:**
- Custom Stripe Connect payment provider module
- PaymentIntent creation with `application_fee_amount` and `transfer_data[destination]`
- Config-driven refund handling (`REFUND_APPLICATION_FEE`)
- Webhook handling for Connect-specific events
- Environment variable configuration
- Medusa config update to use new provider

**Out of Scope / Future:**
- Multi-vendor support (multiple connected accounts)
- Dynamic fee calculation (per-product or per-vendor fees)
- Connected account onboarding UI
- Stripe Connect Express dashboard integration
- Payout scheduling configuration

### Functional Narrative

#### Payment Flow

**Trigger:** Customer completes checkout with Stripe payment

**Experience Narrative:**
1. Customer enters payment details on storefront
2. Storefront calls Medusa payment session API
3. Stripe Connect provider creates PaymentIntent with:
   - Full amount charged to customer
   - `application_fee_amount` = 5% of total
   - `transfer_data.destination` = ChefV's connected account ID
4. Customer confirms payment
5. Stripe processes payment on platform account
6. Stripe automatically transfers 95% to ChefV's connected account
7. Platform retains 5% application fee

**Acceptance Criteria:**
- PaymentIntent includes `application_fee_amount` calculated as `Math.round(amount * feePercent / 100)`
- PaymentIntent includes `transfer_data.destination` with connected account ID
- Payment succeeds and order is created
- Platform Stripe dashboard shows application fee collected
- Connected account receives transfer

#### Refund Flow

**Trigger:** Admin initiates refund for an order

**Experience Narrative:**
1. Admin triggers refund via Medusa admin
2. Stripe Connect provider creates refund with:
   - `refund_application_fee` = value from `REFUND_APPLICATION_FEE` env var
3. If `REFUND_APPLICATION_FEE=false` (default):
   - Customer receives full refund
   - Platform keeps 5% fee
   - ChefV bears full refund amount
4. If `REFUND_APPLICATION_FEE=true`:
   - Customer receives full refund
   - Platform fee is also refunded
   - Both platform and ChefV share refund proportionally

**Acceptance Criteria:**
- Refund respects `REFUND_APPLICATION_FEE` configuration
- Default behavior (false) keeps platform fee
- Optional behavior (true) refunds platform fee

### Technical Notes & Dependencies

**Dependencies:**
- Stripe SDK (already available via `@medusajs/medusa/payment-stripe`)
- Medusa v2 payment provider interface (`AbstractPaymentProvider`)
- Platform Stripe account with Connect enabled
- ChefV's Express connected account ID

**Environment Variables Required:**
```bash
STRIPE_API_KEY=sk_...                    # Platform's Stripe secret key (existing)
STRIPE_CONNECTED_ACCOUNT_ID=acct_...     # ChefV's connected account ID (new)
PLATFORM_FEE_PERCENT=5                   # Platform fee percentage (new)
REFUND_APPLICATION_FEE=false             # Refund behavior flag (new)
STRIPE_WEBHOOK_SECRET=whsec_...          # Webhook secret (may need update)
```

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

**Scope Focus:** Custom Stripe Connect payment provider module for Medusa v2

**Key Assumptions:**
- Developer's Stripe account already has Connect enabled
- ChefV's connected account ID is available (or will be created in Stripe Dashboard)
- Existing storefront payment flow uses standard Medusa payment APIs
- No changes needed to storefront code

**Out of Scope:**
- Storefront modifications
- Admin UI modifications
- Multi-vendor support

### Implementation Tasks

#### Task 1: Create Stripe Connect Payment Provider Service

**Objective:** Implement the core payment provider service with all required methods

**Impacted Modules/Files:**
- `apps/medusa/src/modules/stripe-connect/service.ts` (create)
- `apps/medusa/src/modules/stripe-connect/types.ts` (create)

**Dependencies:** None (first task)

**Acceptance Criteria:**
- Service extends `AbstractPaymentProvider` from `@medusajs/framework/utils`
- Static identifier is `"stripe-connect"`
- Constructor initializes Stripe client with platform API key
- Constructor reads config options (connectedAccountId, feePercent, refundApplicationFee)
- All required payment provider methods are implemented:
  - `initiatePayment` - Creates PaymentIntent with Connect parameters
  - `authorizePayment` - Confirms payment authorization
  - `capturePayment` - Captures authorized payment
  - `refundPayment` - Creates refund with config-driven `refund_application_fee`
  - `cancelPayment` - Cancels PaymentIntent
  - `deletePayment` - Deletes payment session data
  - `retrievePayment` - Retrieves PaymentIntent status
  - `updatePayment` - Updates PaymentIntent amount
  - `getWebhookActionAndData` - Handles Stripe webhooks

**Subtasks:**
1. Create `types.ts` with provider options interface
   - Validation: TypeScript compilation passes
2. Create `service.ts` with class skeleton and constructor
   - Validation: Service instantiates without errors
3. Implement `initiatePayment` with Connect parameters
   - Validation: PaymentIntent created with `application_fee_amount` and `transfer_data`
4. Implement `authorizePayment`, `capturePayment`, `cancelPayment`
   - Validation: Standard Stripe operations work correctly
5. Implement `refundPayment` with config-driven `refund_application_fee`
   - Validation: Refund respects `REFUND_APPLICATION_FEE` setting
6. Implement `retrievePayment`, `updatePayment`, `deletePayment`
   - Validation: Payment session management works correctly
7. Implement `getWebhookActionAndData` for Connect events
   - Validation: Webhook events are processed correctly

**Validation Plan:** Unit tests for each method, integration test with Stripe test mode

---

#### Task 2: Create Module Provider Definition

**Objective:** Create the module index file to register the payment provider with Medusa

**Impacted Modules/Files:**
- `apps/medusa/src/modules/stripe-connect/index.ts` (create)

**Dependencies:** Task 1 (service must exist)

**Acceptance Criteria:**
- Uses `ModuleProvider` from `@medusajs/framework/utils`
- Registers with `Modules.PAYMENT`
- Exports the service correctly

**Validation Plan:** Module loads without errors when registered in medusa-config.ts

---

#### Task 3: Update Medusa Configuration

**Objective:** Replace standard Stripe provider with new Stripe Connect provider

**Impacted Modules/Files:**
- `apps/medusa/medusa-config.ts` (modify lines 139-152)

**Dependencies:** Task 1, Task 2 (module must be complete)

**Acceptance Criteria:**
- Payment module uses `./src/modules/stripe-connect` instead of `@medusajs/medusa/payment-stripe`
- Provider ID is `stripe-connect`
- Options include:
  - `apiKey` from `STRIPE_API_KEY`
  - `connectedAccountId` from `STRIPE_CONNECTED_ACCOUNT_ID`
  - `feePercent` from `PLATFORM_FEE_PERCENT` (default: 5)
  - `refundApplicationFee` from `REFUND_APPLICATION_FEE` (default: false)
  - `webhookSecret` from `STRIPE_WEBHOOK_SECRET`

**Validation Plan:** Medusa starts without errors, payment provider is registered

---

#### Task 4: Add Environment Variables

**Objective:** Document and configure new environment variables

**Impacted Modules/Files:**
- `.env.example` or `.env.template` (if exists, modify)
- Documentation in task hub

**Dependencies:** None (can be done in parallel)

**Acceptance Criteria:**
- New environment variables documented:
  - `STRIPE_CONNECTED_ACCOUNT_ID`
  - `PLATFORM_FEE_PERCENT`
  - `REFUND_APPLICATION_FEE`
- Default values specified where applicable

**Validation Plan:** Application starts with new environment variables configured

---

#### Task 5: End-to-End Testing

**Objective:** Verify complete payment flow with Stripe Connect in test mode

**Impacted Modules/Files:**
- Test configuration and manual testing

**Dependencies:** Tasks 1-4 (all implementation complete)

**Acceptance Criteria:**
- Payment flow works with test cards (4242 4242 4242 4242)
- PaymentIntent shows `application_fee_amount` in Stripe Dashboard
- Transfer to connected account appears in Stripe Dashboard
- Refund with `REFUND_APPLICATION_FEE=false` keeps platform fee
- Refund with `REFUND_APPLICATION_FEE=true` refunds platform fee

**Validation Plan:** Manual testing in Stripe test mode with test connected account

---

### Implementation Guidance

**From Workspace Rules → Medusa v2 Development Rules:**

Module Provider Pattern:
```typescript
import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import StripeConnectProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [StripeConnectProviderService],
})
```

Payment Provider Service Pattern:
```typescript
import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

class StripeConnectProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "stripe-connect"
  
  protected logger_: Logger
  protected options_: Options
  protected stripe_: Stripe
  
  constructor(container: InjectedDependencies, options: Options) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
    this.stripe_ = new Stripe(options.apiKey)
  }
}
```

**From Existing Module Pattern (`apps/medusa/src/modules/file-b2/`):**
- Constructor receives `InjectedDependencies` and `Options`
- Config stored in `this.config_` or `this.options_`
- Logger available via `this.logger_`
- Static identifier defines provider ID

**From Medusa Config Pattern (`apps/medusa/medusa-config.ts`):**
```typescript
{
  resolve: '@medusajs/medusa/payment',
  options: {
    providers: [
      {
        resolve: './src/modules/stripe-connect',
        id: 'stripe-connect',
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          connectedAccountId: process.env.STRIPE_CONNECTED_ACCOUNT_ID,
          feePercent: parseInt(process.env.PLATFORM_FEE_PERCENT || '5', 10),
          refundApplicationFee: process.env.REFUND_APPLICATION_FEE === 'true',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },
      },
    ],
  },
},
```

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
|------|------|-------|------------------------|-----|
| Stripe SDK version compatibility | Risk | PabloJVelez | Use same Stripe SDK version as existing Medusa Stripe provider | Before Task 1 |
| Connected account not onboarded | Risk | PabloJVelez | Verify ChefV's Express account is fully onboarded before testing | Before Task 5 |
| Webhook endpoint configuration | Risk | PabloJVelez | May need to update webhook endpoint in Stripe Dashboard for Connect events | Before Task 5 |
| Platform fee visibility to customers | Question | PabloJVelez | Decide if fee should be shown during checkout (currently not planned) | Deferred |
| Disputes/chargebacks handling | Question | PabloJVelez | Research Connect dispute handling if issues arise | Deferred |
| Breaking existing payments | Risk | PabloJVelez | Test thoroughly in Stripe test mode before production deployment | Task 5 |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Research & Clarification Artifacts
- Research: [`research/2026-01-17_stripe-connect-implementation-research.md`](../research/2026-01-17_stripe-connect-implementation-research.md)
- Clarification: [`clarification/2026-01-17_gap-fill-account-ownership.md`](../clarification/2026-01-17_gap-fill-account-ownership.md)

### Internal Project References
- Current Stripe Config: `apps/medusa/medusa-config.ts` (lines 139-152)
- Existing Module Pattern: `apps/medusa/src/modules/file-b2/`
- Empty Stripe Connect Module: `apps/medusa/src/modules/stripe-connect/`

### External Documentation
- [Medusa v2 Payment Provider Guide](https://docs.medusajs.com/resources/references/payment/provider)
- [Stripe Connect Destination Charges](https://docs.stripe.com/connect/destination-charges)
- [Stripe Connect Application Fees](https://docs.stripe.com/connect/marketplace/tasks/app-fees)
- [Stripe Connect Testing](https://docs.stripe.com/connect/testing)

### Coding Standards
- Workspace Rules: Medusa v2 Development Rules (see `.cursor/rules/`)
- TypeScript strict mode
- Follow existing module patterns in `apps/medusa/src/modules/`
