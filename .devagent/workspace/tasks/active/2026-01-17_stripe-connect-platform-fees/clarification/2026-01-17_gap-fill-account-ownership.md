# Gap-Fill Supplement: Account Ownership & Refund Behavior

- **Date**: 2026-01-17
- **Mode**: Gap Filling
- **Reference**: `research/2026-01-17_stripe-connect-implementation-research.md`

---

## Specific Gaps Addressed

### 1. Account Ownership Clarification

| Dimension | Original Understanding | Clarified Answer |
|-----------|----------------------|------------------|
| **Users** | ChefV is the platform account, chef is the connected account | ❌ **Incorrect** |
| **Users** | Developer (Pablo) owns platform account, ChefV is connected account | ✅ **Correct** |

**Clarified Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                     Payment Flow                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Customer  ───────────────►  Platform Account              │
│                               (Developer's Stripe)          │
│                                      │                      │
│                                      │ 5% Platform Fee      │
│                                      │ retained             │
│                                      ▼                      │
│                               Connected Account             │
│                               (ChefV's Stripe)              │
│                                      │                      │
│                                      ▼                      │
│                               95% transferred               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Stakeholder Attribution**: PabloJVelez (2026-01-17)

---

### 2. Platform Account Details

| Dimension | Question | Answer | Status |
|-----------|----------|--------|--------|
| **Constraints** | Which Stripe account is the platform? | Developer's personal/business Stripe account (same account) | ✅ answered |

**Notes:**
- Developer's personal Stripe account IS their business account
- This account will be used for both development/testing and production
- Platform collects the 5% application fee

**Stakeholder Attribution**: PabloJVelez (2026-01-17)

---

### 3. Connected Account Model

| Dimension | Question | Answer | Status |
|-----------|----------|--------|--------|
| **Scope** | Single or multiple connected accounts? | Single chef only (ChefV is one specific chef) | ✅ answered |

**Notes:**
- ChefV is the only connected account
- No plans to support multiple chefs/vendors
- Connected account ID stored in environment variable

**Stakeholder Attribution**: PabloJVelez (2026-01-17)

---

### 4. Refund Behavior Configuration

| Dimension | Original Understanding | Clarified Answer |
|-----------|----------------------|------------------|
| **Constraints** | Always use `refund_application_fee: true` | ❌ **Incorrect** |
| **Constraints** | Config-driven: Default is NOT to refund platform fee | ✅ **Correct** |

**Config-Driven Refund Behavior:**

| Environment Variable | Value | Behavior |
|---------------------|-------|----------|
| `REFUND_APPLICATION_FEE` | `false` (default) | Platform keeps 5% fee on refunds |
| `REFUND_APPLICATION_FEE` | `true` | Platform fee is refunded to customer |

**Implementation:**

```typescript
const refundApplicationFee = process.env.REFUND_APPLICATION_FEE === 'true';

const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  refund_application_fee: refundApplicationFee,
});
```

**Stakeholder Attribution**: PabloJVelez (2026-01-17)

---

## Updated Assumptions

| Assumption | Owner | Validation Required | Validation Method |
|------------|-------|---------------------|-------------------|
| Developer's Stripe account is already set up | PabloJVelez | No | Account exists |
| ChefV will onboard as Express connected account | PabloJVelez | Yes | Complete Stripe onboarding |
| Default refund behavior (keep platform fee) is acceptable | PabloJVelez | No | Explicitly confirmed |

---

## Updated Environment Variables

```bash
# Platform (Developer's Stripe account)
STRIPE_API_KEY=sk_test_...                    # Platform's secret key

# Connected Account (ChefV)
STRIPE_CONNECTED_ACCOUNT_ID=acct_...          # ChefV's connected account ID

# Fee Configuration
PLATFORM_FEE_PERCENT=5                        # 5% platform fee

# Refund Configuration
REFUND_APPLICATION_FEE=false                  # Default: don't refund platform fee

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...               # Connect webhook secret
```

---

## Updated Spec Readiness Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Account ownership | ✅ Ready | Clarified - developer is platform, ChefV is connected |
| Single/multi vendor | ✅ Ready | Single chef model confirmed |
| Refund behavior | ✅ Ready | Config-driven approach defined |
| Overall | ✅ Ready for Planning | All critical gaps resolved |

---

## Handoff Note

All critical clarifications have been captured. The research document has been updated with:
- Corrected account ownership terminology
- Config-driven refund behavior
- Single-chef model confirmation
- Updated environment variables

**Ready for**: `devagent create-plan`
