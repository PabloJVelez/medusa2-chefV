# Research Packet — Chef Receipt Feature Implementation

- Mode: Task
- Requested By: PabloJVelez
- Last Updated: 2026-01-15
- Related Task Plan: Not yet created
- Storage Path: `.devagent/workspace/tasks/active/2026-01-15_chef-send-receipt-to-host/research/2026-01-15_chef-receipt-feature-research.md`
- Stakeholders: Development team
- Notes: This research focuses on understanding the existing payment reminder implementation pattern to replicate it for the receipt feature.

## Request Overview
Enable chefs to send receipts to hosts for chef events. The feature should:
1. Add a "Send Receipt" button on the chef event detail page (similar to payment reminder button)
2. Only enable the button after the event has taken place OR all tickets have been purchased
3. Allow chefs to optionally include tip amounts (cash or Venmo) before sending
4. Send a receipt email to the host with event details and optional tip information

## Context Snapshot
- Task summary: Create receipt sending feature following the payment reminder implementation pattern
- Task reference: `2026-01-15_chef-send-receipt-to-host`
- Existing decisions: Feature will follow the same architectural pattern as payment reminder for consistency

## Research Questions
| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What is the complete implementation pattern for the payment reminder feature? | Answered | See findings section |
| RQ2 | How is button enablement logic implemented for payment reminders? | Answered | Button shown when `isConfirmed && productId && availableTickets > 0` |
| RQ3 | How to check if an event has "taken place" (date + time validation)? | Answered | Need to combine `requestedDate` (Date) + `requestedTime` (HH:mm string) and compare to current datetime |
| RQ4 | How to check if all tickets have been purchased? | Answered | `availableTickets === 0` when all tickets sold |
| RQ5 | What is the email template structure pattern? | Answered | Uses React Email components with customer, booking, event, product, chef data |
| RQ6 | How is email history tracked in the chef event model? | Answered | Via `emailHistory` JSON field storing array of email entries |

## Key Findings
- Payment reminder follows a clear pattern: API route → Workflow → Subscriber → Email template
- Button enablement checks status, productId, and available tickets
- Available tickets calculation uses inventory module (stocked - reserved quantities)
- Event date/time stored separately (`requestedDate` as Date, `requestedTime` as HH:mm string)
- Email templates use React Email components with standardized data structure
- Email history is tracked in `emailHistory` JSON field with type, recipients, notes, sentAt, sentBy

## Detailed Findings

### RQ1: Payment Reminder Implementation Pattern

**Summary:** The payment reminder feature follows a consistent 5-layer architecture: API Route → Workflow → Subscriber → Email Template → Admin UI.

**Supporting Evidence:**
1. **API Route** (`apps/medusa/src/api/admin/chef-events/[id]/send-payment-reminder/route.ts`):
   - Validates chef event exists and has `productId`
   - Checks event status is `'confirmed'`
   - Validates request body with Zod schema (`recipients?`, `notes?`)
   - Defaults recipients to host email if not provided
   - Executes `sendPaymentReminderWorkflow` and returns result

2. **Workflow** (`apps/medusa/src/workflows/send-payment-reminder.ts`):
   - Uses `createStep` and `createWorkflow` from `@medusajs/workflows-sdk`
   - Updates `emailHistory` with new entry (`type: "payment_reminder"`)
   - Sets `lastEmailSentAt` timestamp
   - Emits event `chef-event.payment-reminder` for subscriber

3. **Subscriber** (`apps/medusa/src/subscribers/chef-event-payment-reminder.ts`):
   - Listens for `chef-event.payment-reminder` event
   - Calculates remaining tickets via inventory module
   - Formats event data (dates, pricing, event types)
   - Sends email via notification service using `payment-reminder` template

4. **Email Template** (`apps/medusa/src/modules/resend/emails/payment-reminder.tsx`):
   - Uses React Email components (`@react-email/components`)
   - Receives structured props: `customer`, `booking`, `event`, `product`, `remainingTickets`, `chef`, `requestReference`, `customNotes`
   - Includes event details, pricing, purchase CTA, and custom notes section

5. **Admin UI** (`apps/medusa/src/admin/routes/chef-events/[id]/page.tsx`):
   - Button rendered conditionally based on `showPaymentReminderButton`
   - Uses `useAdminSendPaymentReminderMutation` hook
   - Shows loading state and toast notifications

6. **SDK/Hooks**:
   - SDK method: `sdk.admin.chefEvents.sendPaymentReminder()` (`apps/medusa/src/sdk/admin/admin-chef-events.ts`)
   - React hook: `useAdminSendPaymentReminderMutation()` (`apps/medusa/src/admin/hooks/chef-events.ts`)

**Freshness:** 2026-01-15

### RQ2: Button Enablement Logic

**Summary:** Payment reminder button is enabled when event is confirmed, has a productId, and has available tickets remaining.

**Supporting Evidence:**
```typescript
// From apps/medusa/src/admin/routes/chef-events/[id]/page.tsx (lines 138-141)
const isPending = chefEvent.status === 'pending';
const isConfirmed = chefEvent.status === 'confirmed';
const availableTickets = (chefEvent as any).availableTickets ?? 0;
const showPaymentReminderButton = isConfirmed && chefEvent.productId && availableTickets > 0;
```

**For Receipt Feature:** Button should be enabled when:
- `isConfirmed && chefEvent.productId` AND
- (`eventHasTakenPlace` OR `availableTickets === 0`)

**Freshness:** 2026-01-15

### RQ3: Event Date/Time Validation

**Summary:** Event date and time are stored separately. To check if event has taken place, need to combine `requestedDate` (Date) with `requestedTime` (HH:mm string) and compare to current datetime.

**Supporting Evidence:**
```typescript
// From apps/medusa/src/modules/chef-event/models/chef-event.ts (lines 14-15)
requestedDate: model.dateTime(),  // Date object
requestedTime: model.text(),      // Format: HH:mm (e.g., "14:30")
```

**Implementation approach:**
1. Parse `requestedDate` as Date object
2. Parse `requestedTime` as HH:mm string
3. Combine date + time to create full event datetime
4. Compare to `new Date()` to determine if event has passed

**Example validation logic:**
```typescript
function hasEventTakenPlace(chefEvent: ChefEvent): boolean {
  const eventDate = new Date(chefEvent.requestedDate);
  const [hours, minutes] = chefEvent.requestedTime.split(':').map(Number);
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate < new Date();
}
```

**Freshness:** 2026-01-15

### RQ4: All Tickets Purchased Check

**Summary:** All tickets are purchased when `availableTickets === 0`. Available tickets are calculated via inventory module checking stocked vs reserved quantities.

**Supporting Evidence:**
```typescript
// From apps/medusa/src/api/admin/chef-events/[id]/route.ts (lines 111-117)
// Sum available inventory (stocked - reserved)
for (const level of levels) {
  const stocked = Number(level.stocked_quantity || 0);
  const reserved = Number(level.reserved_quantity || 0);
  const available = stocked - reserved;
  availableTickets += Math.max(0, available);
}
```

**For Receipt Feature:** Check if `availableTickets === 0` to determine all tickets purchased.

**Freshness:** 2026-01-15

### RQ5: Email Template Structure

**Summary:** Email templates use React Email components with standardized prop structure including customer, booking, event, product, chef, and optional custom fields.

**Supporting Evidence:**
```typescript
// From apps/medusa/src/modules/resend/emails/payment-reminder.tsx (lines 16-51)
type PaymentReminderEmailProps = {
  customer: { first_name, last_name, email, phone };
  booking: { date, time, event_type, location_type, location_address, party_size, notes };
  event: { status, total_price, price_per_person };
  product: { id, handle, title, purchase_url } | null;
  remainingTickets: number;
  chef: { name, email, phone };
  requestReference: string;
  customNotes?: string;
};
```

**For Receipt Feature:** Should include similar structure but add:
- `tipAmount?: number` - Optional tip amount
- `tipMethod?: 'cash' | 'venmo'` - How tip was received
- Receipt-specific sections (line items, totals, etc.)

**Freshness:** 2026-01-15

### RQ6: Email History Tracking

**Summary:** Email history is tracked in `emailHistory` JSON field as an array of email entry objects with type, recipients, notes, sentAt, and sentBy fields.

**Supporting Evidence:**
```typescript
// From apps/medusa/src/modules/chef-event/models/chef-event.ts (lines 53)
emailHistory: model.json().nullable(), // Track sent emails with timestamps and recipients

// From apps/medusa/src/workflows/send-payment-reminder.ts (lines 36-42)
const newEmailEntry = {
  type: "payment_reminder",
  recipients: recipients,
  notes: input.notes,
  sentAt: new Date().toISOString(),
  sentBy: "chef_admin" // Could be dynamic based on user
}
```

**For Receipt Feature:** Should add entry with `type: "receipt"` and include tip information if provided.

**Freshness:** 2026-01-15

## Comparative / Alternatives Analysis

### Tip Amount Storage Options

**Option A: Store in emailHistory only**
- **Pros:** No schema changes, tip is event-specific metadata
- **Cons:** Hard to query/report on tips, tip not easily accessible in UI

**Option B: Store in chef event model as separate fields**
- **Pros:** Easy to query, can display tip info in UI, better for reporting
- **Cons:** Requires migration, adds fields that may not always be populated

**Option C: Store in both emailHistory and separate fields**
- **Pros:** Complete audit trail + easy access
- **Cons:** Potential data duplication, more complex updates

**Recommendation:** Option A for MVP (tip in emailHistory only) since tips are optional and primarily needed for receipt email. Can migrate to Option B later if reporting/analytics needs emerge.

## Implications for Implementation

### Scope Adjustments
1. **Tip Input Modal:** Need to add a modal/dialog before sending receipt that allows chef to optionally enter tip amount and method (cash/venmo)
2. **Validation Logic:** Need helper function to combine date + time and check if event has taken place
3. **Receipt Email Template:** New template needed with receipt-specific sections (event details, pricing breakdown, optional tip section)
4. **Workflow Input:** Add `tipAmount?` and `tipMethod?` to workflow input schema

### Acceptance Criteria Impacts
1. Button enablement: `isConfirmed && productId && (hasEventTakenPlace || availableTickets === 0)`
2. Tip input should be optional (user can skip and send without tip)
3. Tip amount should be numeric and non-negative
4. Tip method should be either 'cash' or 'venmo' if tip amount provided
5. Receipt email must include event details, pricing, and tip (if provided)

### Validation Needs
1. Validate tip amount is numeric and >= 0 if provided
2. Validate tip method is 'cash' or 'venmo' if tip amount provided
3. Validate event has taken place OR all tickets purchased before enabling button
4. Validate event is confirmed and has productId (same as payment reminder)

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| What should be included in receipt email? | Question | Product/Design | Clarify with stakeholders: line items, totals, breakdown, formatting | Before implementation |
| Should tip amount be stored permanently? | Question | Technical Lead | See "Tip Amount Storage Options" analysis above - recommend Option A for MVP | Before implementation |
| Exact validation for "event has taken place" - timezone handling? | Question | Developer | Use same timezone as requestedDate (likely UTC), test edge cases | During implementation |
| Should receipt email include order/cart details from Medusa? | Question | Product/Design | Determine if receipt should show individual ticket purchases or just event totals | Before implementation |
| How to handle multiple receipts sent (update vs. new entry)? | Question | Product/Design | Decide if chefs can send multiple receipts or just one per event | Before implementation |

## Recommended Follow-ups

1. **Clarify Receipt Email Contents:** Work with product/design to determine:
   - Exact line items to display (event fee, ticket purchases, tips)
   - Pricing breakdown format
   - Required vs. optional sections
   - Receipt numbering/ID system

2. **Tip Storage Decision:** Finalize approach for tip amount storage (recommend Option A for MVP)

3. **Timezone Handling:** Validate timezone assumptions for event date/time comparison

4. **Receipt Template Design:** Design receipt email template with tip section mockups

5. **Testing Strategy:** Plan edge case testing:
   - Event at midnight (timezone edge cases)
   - Event exactly at current time
   - Partial ticket purchases
   - Multiple receipt sends (if allowed)

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `apps/medusa/src/api/admin/chef-events/[id]/send-payment-reminder/route.ts` | Code | 2026-01-15 | Payment reminder API route pattern |
| `apps/medusa/src/workflows/send-payment-reminder.ts` | Code | 2026-01-15 | Workflow implementation pattern |
| `apps/medusa/src/subscribers/chef-event-payment-reminder.ts` | Code | 2026-01-15 | Email sending subscriber pattern |
| `apps/medusa/src/modules/resend/emails/payment-reminder.tsx` | Code | 2026-01-15 | Email template structure |
| `apps/medusa/src/admin/routes/chef-events/[id]/page.tsx` | Code | 2026-01-15 | Button enablement logic |
| `apps/medusa/src/modules/chef-event/models/chef-event.ts` | Code | 2026-01-15 | Chef event model structure |
| `apps/medusa/src/api/admin/chef-events/[id]/route.ts` | Code | 2026-01-15 | Available tickets calculation |
| `apps/medusa/src/sdk/admin/admin-chef-events.ts` | Code | 2026-01-15 | SDK method pattern |
| `apps/medusa/src/admin/hooks/chef-events.ts` | Code | 2026-01-15 | React hook pattern |
