# Implement Stripe Connect with 5% Platform Fee Progress Tracker

- Owner: PabloJVelez
- Last Updated: 2026-01-17
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-01-17_stripe-connect-platform-fees/`

## Summary

This task involves refactoring the current Stripe payment integration to use **Stripe Connect** so the platform can collect a **5% application fee** on all transactions. 

Currently, the Medusa backend is configured with a standard Stripe integration (`@medusajs/medusa/payment-stripe`) where the chef's Stripe account receives 100% of payments directly. The goal is to transition to a Stripe Connect model where:

1. **Platform Account**: The developer's (Pablo's) personal/business Stripe account becomes the merchant of record
2. **Connected Account**: ChefV's Stripe account becomes a connected account under the platform
3. **Fee Splitting**: 5% of each transaction is automatically retained by the platform, with 95% transferred to ChefV's connected account
4. **Configurability**: The platform fee percentage and refund behavior should be configurable via environment variables

> **Account Clarification (2026-01-17)**: 
> - **Platform** = Developer's personal/business Stripe account (collects 5% fee)
> - **Connected Account** = ChefV (receives 95% of payments)
> - **Model** = Single chef only (no multi-vendor support planned)

Key implementation considerations:
- Configure Stripe Connect accounts (platform and connected)
- Store the connected account ID and fee percentage in environment variables
- Modify the PaymentIntent creation to include `transfer_data[destination]` and `application_fee_amount`
- Handle webhooks, refunds, and error scenarios under the Connect model
- Test thoroughly using Stripe's test mode with test connected accounts

**Reference Materials:**
- Attached PDF: "Implementing Stripe Connect for Platform Fees in a Medusa Project"
- Blog: https://blog.perseides.org/medusa-marketplace-5-stripe-connect

**Note**: The reference to PabloJVelez/medusa repo in the PDF should be ignored per user preference.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-17] Decision: Task created to implement Stripe Connect for platform fees. Will follow the approach outlined in the provided PDF reference material and blog post.
- [2026-01-17] Decision: Developer's personal/business Stripe account is the platform account (collects 5% fee). ChefV is the connected account (receives 95%).
- [2026-01-17] Decision: Refund behavior is config-driven via `REFUND_APPLICATION_FEE` env var. Default is `false` (platform keeps fee on refunds).

## Progress Log
- [2026-01-17] Task Created: Scaffolded task hub for implementing Stripe Connect with 5% platform fee. Current Stripe configuration located at `apps/medusa/medusa-config.ts` using standard `@medusajs/medusa/payment-stripe` provider.
- [2026-01-17] Research Completed: Created comprehensive research document covering Stripe Connect charge types, Medusa v2 payment provider patterns, implementation approach, and detailed next steps. Recommendation: Create new custom Stripe Connect payment provider module using destination charges. See `research/2026-01-17_stripe-connect-implementation-research.md`.
- [2026-01-17] Clarification Completed: Corrected account ownership (developer is platform, ChefV is connected account). Added config-driven refund behavior (default: don't refund platform fee). Confirmed single-chef model. See `clarification/2026-01-17_gap-fill-account-ownership.md`.
- [2026-01-17] Plan Created: Implementation plan with 5 tasks covering provider service, module definition, config update, environment variables, and E2E testing. See `plan/2026-01-17_stripe-connect-implementation-plan.md`.

## Implementation Checklist
- [x] Research: Review Stripe Connect documentation and Medusa payment provider patterns
- [x] Clarification: Confirm account ownership and refund behavior requirements
- [ ] Stripe Setup: Enable Stripe Connect on platform account and create/connect ChefV's connected account
- [ ] Environment Config: Add `STRIPE_CONNECTED_ACCOUNT_ID`, `PLATFORM_FEE_PERCENT`, and `REFUND_APPLICATION_FEE` environment variables
- [ ] Provider Customization: Modify/extend Stripe payment provider to include `transfer_data` and `application_fee_amount`
- [ ] Webhook Handling: Update webhooks to handle Connect-specific events (transfers, disputes, etc.)
- [ ] Testing: Test payment flow in Stripe test mode with test connected accounts
- [ ] Error Handling: Implement proper error handling for Connect-specific scenarios
- [ ] Documentation: Document the new payment flow and configuration requirements

## Open Questions
- ~~What Stripe Connect account type should be used for the chef? (Express vs Custom)~~ **RESOLVED**: Use Express accounts - Stripe handles onboarding, simpler setup
- ~~Should we support multiple connected accounts in the future?~~ **RESOLVED**: No - single chef model (ChefV only)
- ~~How should refunds be handled under the Connect model?~~ **RESOLVED**: Config-driven via `REFUND_APPLICATION_FEE` env var (default: `false` = keep platform fee)
- ~~Who is the platform vs connected account?~~ **RESOLVED**: Developer's Stripe account is platform, ChefV is connected account
- Should the platform fee be visible to customers during checkout? - Owner: PabloJVelez
- What happens if the connected account is not fully onboarded? - Owner: PabloJVelez
- How to handle disputes/chargebacks under Connect model? - Owner: PabloJVelez

## References

### Internal Project References
- **Current Stripe Config**: `apps/medusa/medusa-config.ts` (lines 139-152) - Current standard Stripe integration
- **Payment-related files**: Found in `apps/medusa/src/` including payment reminder workflows and chef-event payment handling
- **Medusa Config**: Uses `@medusajs/medusa/payment-stripe` provider with `STRIPE_API_KEY` env var

### External References
- **PDF Guide**: "Implementing Stripe Connect for Platform Fees in a Medusa Project" (attached)
- **Blog Post**: https://blog.perseides.org/medusa-marketplace-5-stripe-connect
- **Stripe Connect Docs**: https://docs.stripe.com/connect
- **Stripe Connect Testing**: https://docs.stripe.com/connect/testing
- **Stripe Destination Charges**: https://docs.stripe.com/connect/marketplace/tasks/accept-payment/destination-charges
- **Stripe Application Fees**: https://docs.stripe.com/connect/marketplace/tasks/app-fees

### Task Artifacts
- Plan: [`plan/2026-01-17_stripe-connect-implementation-plan.md`](./plan/2026-01-17_stripe-connect-implementation-plan.md)
- Research: [`research/2026-01-17_stripe-connect-implementation-research.md`](./research/2026-01-17_stripe-connect-implementation-research.md)
- Clarification: [`clarification/2026-01-17_gap-fill-account-ownership.md`](./clarification/2026-01-17_gap-fill-account-ownership.md)

## Next Steps

Recommended workflow commands to proceed with this task:

1. ~~**Research Phase**~~ ✅ Completed - See `research/2026-01-17_stripe-connect-implementation-research.md`

2. ~~**Clarification Phase**~~ ✅ Completed - See `clarification/2026-01-17_gap-fill-account-ownership.md`

3. ~~**Create Plan**~~ ✅ Completed - See `plan/2026-01-17_stripe-connect-implementation-plan.md`

4. **Execute Implementation** - Ready to implement:
   ```
   devagent implement-plan
   ```
