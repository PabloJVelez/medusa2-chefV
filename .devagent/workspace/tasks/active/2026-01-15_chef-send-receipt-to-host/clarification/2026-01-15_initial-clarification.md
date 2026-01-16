# Clarified Requirement Packet — Enable Chef to Send Receipts to Host for Chef Events

- Requestor: PabloJVelez
- Decision Maker: PabloJVelez
- Date: 2026-01-15
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-15_chef-send-receipt-to-host/`
- Notes: Clarification session in progress. Documenting answers incrementally.

## Task Overview

### Context
- **Task name/slug:** Enable Chef to Send Receipts to Host for Chef Events
- **Business context:** Chefs need to send receipts to hosts after events complete or when all tickets are purchased. Receipts should optionally include tip amounts received via cash or Venmo.
- **Stakeholders:** PabloJVelez (Owner/Decision Maker)
- **Prior work:** Research packet completed documenting payment reminder implementation pattern (`research/2026-01-15_chef-receipt-feature-research.md`)

### Clarification Sessions
- Session 1: 2026-01-15 — Initial clarification (complete)

---

## Clarified Requirements

*Documentation approach: Fill in sections incrementally as clarification progresses.*

---

### Scope & End Goal

**What needs to be done?**
Create a "Send Receipt" feature that enables chefs to send receipt emails to hosts for chef events. The feature should:
- Add a button on the chef event detail page (similar to payment reminder button)
- Enable button only after event date has passed OR all tickets have been purchased
- Allow chefs to optionally include tip amount and tip method (cash or other) before sending
- Send receipt email with event details, pricing breakdown, ticket purchases, and optional tip information
- Store tip information in chef event model as separate fields (tipAmount, tipMethod) for reporting/analytics

**What's the end goal architecture or state?**
- Receipt button appears on chef event detail page when conditions are met
- Clicking button opens modal/dialog for optional tip input
- Receipt email sent to host with complete event and financial information
- Tip data stored in chef event model for future reporting
- Email history tracked in emailHistory JSON field

**In-scope (must-have):**
- Receipt button on chef event detail page
- Button enablement logic (event date passed OR all tickets purchased)
- Tip input modal/dialog with amount and method (cash or other)
- Receipt email template with event details, pricing breakdown, ticket purchases, and optional tip
- Tip storage in chef event model (tipAmount, tipMethod fields)
- Email history tracking for receipts
- API route, workflow, subscriber, and email template following payment reminder pattern

**Out-of-scope (won't-have):**
- Receipt numbering/ID system (deferred)
- Tip reporting/analytics dashboard (future work)
- Separate field for custom tip method text (custom text stored directly in tipMethod field)

---

### Technical Constraints & Requirements

**Platform/technical constraints:**
- Must follow existing payment reminder implementation pattern for consistency
- Use Medusa v2 framework patterns (workflows, subscribers, API routes)
- Use React Email components for email template
- Use existing Resend notification service integration

**Architecture requirements:**
- Tip storage: Add `tipAmount` (number) and `tipMethod` (string) fields to chef event model
  - `tipMethod` stores: 'cash', 'venmo', 'zelle', 'paypal', or custom string exactly as entered by chef
  - Custom text stored directly in `tipMethod` field (no separate field needed)
- Event date validation: Consider event "taken place" if requestedDate has passed (ignore time component)
- Button enablement: `isConfirmed && productId && (hasEventTakenPlace || availableTickets === 0)`
- Multiple receipts: Allowed, but show warning/confirmation if receipt was previously sent

**Quality bars:**
- Tip amount must be numeric and non-negative if provided
- Tip method UI: Checkbox for "Cash", or dropdown (Venmo/Zelle/PayPal/Other) if not cash
- If "Other" selected in dropdown: show text input for custom method specification
- Custom text from "Other" input stored directly in `tipMethod` field (e.g., "Cash App", "Apple Pay")
- Receipt email must include all specified sections (event details, pricing, tickets, optional tip)
- Multiple receipts allowed with warning/confirmation if receipt previously sent

---

### Dependencies & Blockers

**Technical dependencies:**
- Chef event model migration: Add `tipAmount` and `tipMethod` fields
- Existing payment reminder implementation pattern (available)
- Resend notification service (available)
- Inventory module for ticket availability checking (available)

**Cross-team/external dependencies:**
- None identified

**Blockers or risks:**
- None identified

---

### Implementation Approach

**Implementation strategy:**
- Approach: Follow payment reminder implementation pattern for consistency
- Patterns: API Route → Workflow → Subscriber → Email Template → Admin UI
- Existing patterns: Reuse payment reminder architecture (`apps/medusa/src/api/admin/chef-events/[id]/send-payment-reminder/route.ts`)

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- Test cases:
  - Button appears when event date has passed (date-only check, ignoring time)
  - Button appears when all tickets are purchased (availableTickets === 0)
  - Button is disabled when neither condition is met
- Tip input modal opens when button is clicked
- Tip can be entered with amount and method:
  - Checkbox for "Cash" (if checked, method is "cash")
  - If not cash: dropdown with Venmo/Zelle/PayPal/Other options
  - If "Other" selected: text input appears for custom method
- Receipt can be sent without tip (optional)
- Warning/confirmation shown if receipt was previously sent for this event
  - Receipt email includes event details, pricing breakdown, ticket purchases
  - Receipt email includes tip section when tip provided
  - Tip data is stored in chef event model after sending
  - Email history is updated with receipt entry

**What does "done" look like?**
- [ ] Receipt button implemented and appears when conditions are met
- [ ] Tip input modal/dialog implemented with validation
- [ ] Receipt email template created with all required sections
- [ ] API route, workflow, and subscriber implemented
- [ ] Tip storage in chef event model working
- [ ] Email history tracking working
- [ ] All acceptance criteria tests passing

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| Feature will follow payment reminder pattern | PabloJVelez | No | Documented in research | 2026-01-15 | Validated |
| Event date validation uses date-only comparison (ignores time) | PabloJVelez | No | Clarified in session | 2026-01-15 | Validated |
| Tip method is 'cash' or 'other' (not specific payment methods) | PabloJVelez | No | Clarified in session | 2026-01-15 | Validated |
| Tip method UI uses checkbox for cash, dropdown for other methods | PabloJVelez | No | Clarified in session | 2026-01-15 | Validated |
| Multiple receipts allowed with warning if previously sent | PabloJVelez | No | Clarified in session | 2026-01-15 | Validated |

---

## Gaps Requiring Research

*No research gaps identified - research already completed.*

---

## Clarification Session Log

### Session 1: 2026-01-15
**Participants:** PabloJVelez

**Questions Asked:**

**1. What should be included in the receipt email?**
→ **Answer: D** - Event details + pricing breakdown + ticket purchases + tip amount (if provided)
- Receipt email must include: event details (date, time, location, party size), pricing breakdown (price per person, total event cost), individual ticket purchases (if applicable), and tip amount section (if tip was provided)

**2. For tip storage, which approach should we use?**
→ **Answer: B** - Store tip in chef event model as separate fields (tipAmount, tipMethod) for reporting/analytics
- Clarification: Tip method should be two types: 'cash' or 'other' (not specifically cash/venmo, but cash or other)
- Fields to add: `tipAmount` (number) and `tipMethod` ('cash' | 'other')

**3. For "event has taken place" validation, how should we handle edge cases?**
→ **Answer: C** - Consider event "taken place" if date has passed (ignore time), simpler logic
- Validation: Compare event `requestedDate` to current date (date-only comparison, ignoring time component)
- Simpler approach that avoids timezone complexity

**4. For the tip input UI, how should the modal/dialog work?**
→ **Answer: C** - Single optional field for tip amount, with a checkbox or toggle for "cash" vs "other" (if "other" selected, show text field)
- UI Flow: Optional tip amount field + checkbox for "Cash"
- If checkbox checked: tip method is "cash"
- If checkbox unchecked: show dropdown with options (Venmo, Zelle, PayPal, Other)
- If "Other" selected in dropdown: show text input field for custom method specification

**5. When tip method is "other", what should happen?**
→ **Answer: C** - Use a dropdown with common options (Venmo, Zelle, PayPal, Other) where "Other" opens a text field
- Dropdown options: Venmo, Zelle, PayPal, Other
- If "Other" selected: show text input field for chef to specify custom method
- Stored value: Selected option from dropdown, or custom text if "Other" was selected

**6. Can chefs send multiple receipts for the same event, or should it be limited to one receipt per event?**
→ **Answer: C** - Allow multiple receipts but show a warning/confirmation if receipt was already sent
- Multiple receipts allowed per event
- If receipt was previously sent: show warning/confirmation dialog before sending again
- Enables chefs to send updated receipts if tip information changes

**7. When "Other" is selected and a custom text is entered, what should be stored in the `tipMethod` field?**
→ **Answer: A** - Store the custom text exactly as entered (e.g., "Cash App", "Apple Pay")
- `tipMethod` field stores: 'cash', 'venmo', 'zelle', 'paypal', or custom string as entered by chef
- No separate field needed for custom text
- Custom text stored directly in `tipMethod` field

**Unresolved Items:**
- None - all critical gaps addressed

---

## Next Steps

### Spec Readiness Assessment
**Status:** ✅ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Plan Readiness Assessment:**
- Critical gaps addressed: ✅ Receipt email contents, ✅ tip storage approach, ✅ event date validation, ✅ tip input UI flow, ✅ multiple receipts handling
- Blockers: None identified
- Information status: Research complete, clarification complete

**Rationale:**
All critical requirements clarified:
- Receipt email contents: Event details + pricing breakdown + ticket purchases + optional tip
- Tip storage: Store in chef event model as `tipAmount` (number) and `tipMethod` (string: 'cash', 'venmo', 'zelle', 'paypal', or custom text)
- Event validation: Date-only comparison (ignore time)
- Tip input UI: Checkbox for cash, dropdown for other methods, text input for custom
- Multiple receipts: Allowed with warning/confirmation if previously sent
- Implementation pattern: Follow payment reminder architecture

Ready to proceed to plan creation.

### Recommended Actions

**Ready for plan creation:**
- [x] Research complete (`research/2026-01-15_chef-receipt-feature-research.md`)
- [x] Clarification complete (this packet)
- [ ] Proceed to `devagent create-plan` with this clarification packet
- [ ] Provide link to this clarification packet: `.devagent/workspace/tasks/active/2026-01-15_chef-send-receipt-to-host/clarification/2026-01-15_initial-clarification.md`

**Key decisions to highlight in plan:**
- Tip storage in chef event model (`tipAmount`, `tipMethod`)
- Event date validation: date-only comparison
- Tip input UI: checkbox + dropdown + custom text
- Multiple receipts allowed with warning
