# Enable Chef to Send Receipts to Host for Chef Events Plan

- Owner: PabloJVelez
- Last Updated: 2026-01-15
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-15_chef-send-receipt-to-host/`
- Stakeholders: PabloJVelez (Owner/Decision Maker)
- Notes: Implementation plan following payment reminder pattern for consistency.

---

## PART 1: PRODUCT CONTEXT

### Summary
Enable chefs to send receipt emails to hosts for chef events after the event has taken place or all tickets have been purchased. The feature includes optional tip amount tracking (cash or other payment methods) that can be included in the receipt email. This provides hosts with complete financial documentation for their event and enables chefs to track tips received.

### Context & Problem
Currently, chefs have no way to send formal receipts to hosts after events complete. Hosts may need receipts for expense reimbursement or tax purposes. Additionally, chefs often receive tips via cash or direct payment apps (Venmo, Zelle, etc.) on the day of the event, and there's no systematic way to include this information in receipts. The payment reminder feature provides a good architectural pattern to follow for consistency.

**Research Reference:** `research/2026-01-15_chef-receipt-feature-research.md` documents the payment reminder implementation pattern that will be replicated.

### Objectives & Success Metrics
- **Primary Objective:** Chefs can send receipt emails to hosts with complete event and financial information
- **Secondary Objective:** Tip amounts can be optionally included in receipts and stored for reporting
- **Success Criteria:**
  - Receipt button appears when event date has passed OR all tickets purchased
  - Chefs can optionally add tip information before sending receipt
  - Receipt emails include all required information (event details, pricing, tickets, optional tip)
  - Tip data is stored in chef event model for future reporting
  - Email history tracks all receipt sends

### Users & Insights
- **Primary User:** Chefs using the admin interface to manage events
- **Secondary User:** Hosts receiving receipt emails
- **Key Insight:** Tips are often received on the day of the event via cash or direct payment apps, so the ability to add tip information after the event is important

### Solution Principles
- Follow existing payment reminder implementation pattern for consistency
- Keep tip input optional (chefs can send receipts without tips)
- Store tip data in chef event model for reporting/analytics
- Allow multiple receipts per event (with warning if previously sent)
- Use date-only comparison for event validation (simpler, avoids timezone issues)

### Scope Definition
- **In Scope:**
  - Receipt button on chef event detail page
  - Button enablement logic (event date passed OR all tickets purchased)
  - Tip input modal with checkbox (cash) and dropdown (other methods)
  - Receipt email template with all required sections
  - Tip storage in chef event model (`tipAmount`, `tipMethod` fields)
  - Email history tracking
  - API route, workflow, subscriber following payment reminder pattern
  - SDK method and React hook for admin UI

- **Out of Scope / Future:**
  - Receipt numbering/ID system
  - Tip reporting/analytics dashboard
  - Separate field for custom tip method text (custom text stored directly in `tipMethod` field)

### Functional Narrative

#### Flow: Send Receipt with Optional Tip
- **Trigger:** Chef clicks "Send Receipt" button on chef event detail page
- **Experience narrative:**
  1. Button is enabled when event date has passed OR all tickets are purchased
  2. Clicking button opens modal/dialog with optional tip input fields
  3. Chef can optionally enter tip amount and select tip method:
     - Checkbox for "Cash" (if checked, method is "cash")
     - If not cash: dropdown with Venmo/Zelle/PayPal/Other options
     - If "Other" selected: text input appears for custom method
  4. If receipt was previously sent: warning/confirmation dialog appears
  5. Chef confirms and receipt email is sent to host
  6. Receipt email includes: event details, pricing breakdown, ticket purchases, optional tip section
  7. Tip data is stored in chef event model
  8. Email history is updated with receipt entry
- **Acceptance criteria:**
  - Button appears when conditions are met
  - Tip input is optional (can send without tip)
  - Tip validation: amount must be numeric and non-negative if provided
  - Receipt email includes all required sections
  - Tip data stored correctly in chef event model
  - Email history updated with receipt entry

### Technical Notes & Dependencies
- **Data Model Changes:** Add `tipAmount` (number, nullable) and `tipMethod` (string, nullable) fields to chef event model
- **Migration Required:** Create migration to add tip fields to `chef_event` table
- **Integration Points:** 
  - Resend notification service (existing)
  - Inventory module for ticket availability checking (existing)
  - Chef event module service (existing)
- **Event Validation:** Date-only comparison (ignore time component) using `requestedDate` field
- **Architecture Pattern:** Follow payment reminder pattern: API Route → Workflow → Subscriber → Email Template → Admin UI

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Full feature implementation following payment reminder pattern
- **Key assumptions:**
  - Payment reminder implementation pattern is stable and can be replicated
  - Resend notification service supports new email template
  - Inventory module provides accurate ticket availability data
  - Event date validation using date-only comparison is acceptable (no timezone handling needed)
- **Out of scope:** Receipt numbering, tip analytics dashboard, separate custom tip method field

### Implementation Tasks

#### Task 1: Add Tip Fields to Chef Event Model and Create Migration
- **Objective:** Extend chef event model with `tipAmount` and `tipMethod` fields and create database migration
- **Impacted Modules/Files:**
  - `apps/medusa/src/modules/chef-event/models/chef-event.ts` - Add tip fields to model definition
  - `apps/medusa/src/modules/chef-event/migrations/Migration{timestamp}.ts` - Create new migration file
  - `apps/medusa/src/sdk/admin/admin-chef-events.ts` - Update TypeScript types for tip fields
- **References:**
  - Clarification packet: `clarification/2026-01-15_initial-clarification.md` - Tip storage approach
  - Research packet: `research/2026-01-15_chef-receipt-feature-research.md` - Model structure
  - Existing migration: `apps/medusa/src/modules/chef-event/migrations/Migration20250731025214.ts` - Migration pattern
- **Dependencies:** None (foundational change)
- **Acceptance Criteria:**
  - `tipAmount` field added to model (number, nullable)
  - `tipMethod` field added to model (string, nullable)
  - Migration file created with proper timestamp
  - Migration adds columns to `chef_event` table
  - Migration includes `down()` method for rollback
  - TypeScript types updated in SDK
- **Testing Criteria:**
  - Migration runs successfully without errors
  - Migration can be rolled back successfully
  - Model definition includes new fields
  - TypeScript types compile without errors
- **Subtasks:**
  1. Add `tipAmount: model.number().nullable()` to chef event model
  2. Add `tipMethod: model.text().nullable()` to chef event model
  3. Generate migration file with timestamp using Medusa migration generator
  4. Write migration SQL to add `tipAmount` (numeric, nullable) and `tipMethod` (text, nullable) columns
  5. Add `down()` method to migration for rollback
  6. Update `AdminChefEventDTO` interface in SDK to include tip fields
  7. Update `ChefEventType` type definition to include tip fields
- **Validation Plan:**
  - Run migration and verify columns exist in database
  - Verify model can be used with new fields
  - Run TypeScript compiler to verify type definitions

#### Task 2: Create Send Receipt Workflow
- **Objective:** Create workflow that updates email history and emits event for receipt sending
- **Impacted Modules/Files:**
  - `apps/medusa/src/workflows/send-receipt.ts` - New workflow file
- **References:**
  - Payment reminder workflow: `apps/medusa/src/workflows/send-payment-reminder.ts` - Pattern to follow
  - Clarification packet: `clarification/2026-01-15_initial-clarification.md` - Workflow requirements
- **Dependencies:** Task 1 (tip fields must exist in model)
- **Acceptance Criteria:**
  - Workflow accepts input: `chefEventId`, `recipients?`, `notes?`, `tipAmount?`, `tipMethod?`
  - Workflow updates `emailHistory` with receipt entry (`type: "receipt"`)
  - Workflow updates `tipAmount` and `tipMethod` in chef event if provided
  - Workflow sets `lastEmailSentAt` timestamp
  - Workflow emits `chef-event.receipt` event for subscriber
  - Workflow returns updated chef event and email sent status
- **Testing Criteria:**
  - Workflow executes without errors
  - Email history updated correctly
  - Tip fields updated when provided
  - Event emitted with correct data
- **Subtasks:**
  1. Create `send-receipt.ts` workflow file
  2. Define `SendReceiptWorkflowInput` type with tip fields
  3. Create step to update email history with receipt entry
  4. Create step to update tip fields in chef event (if provided)
  5. Use `emitEventStep` to emit `chef-event.receipt` event
  6. Return workflow response with updated chef event
- **Validation Plan:**
  - Unit test workflow with various input combinations
  - Verify email history structure matches expected format
  - Verify tip fields are updated correctly

#### Task 3: Create Receipt Email Subscriber
- **Objective:** Create subscriber that listens for receipt event and sends receipt email
- **Impacted Modules/Files:**
  - `apps/medusa/src/subscribers/chef-event-receipt.ts` - New subscriber file
- **References:**
  - Payment reminder subscriber: `apps/medusa/src/subscribers/chef-event-payment-reminder.ts` - Pattern to follow
  - Clarification packet: `clarification/2026-01-15_initial-clarification.md` - Email contents requirements
- **Dependencies:** Task 2 (workflow must emit event)
- **Acceptance Criteria:**
  - Subscriber listens for `chef-event.receipt` event
  - Subscriber retrieves chef event and product details
  - Subscriber calculates pricing and ticket information
  - Subscriber formats data for email template (including tip if provided)
  - Subscriber sends email via notification service using `receipt` template
  - Subscriber handles errors gracefully
- **Testing Criteria:**
  - Subscriber receives event and processes correctly
  - Email data formatted correctly with all required fields
  - Tip information included when provided
  - Email sent successfully via notification service
- **Subtasks:**
  1. Create `chef-event-receipt.ts` subscriber file
  2. Define event data type with tip fields
  3. Implement subscriber handler function
  4. Retrieve chef event and product details
  5. Calculate pricing and ticket information
  6. Format email data including tip section (if provided)
  7. Send email via notification service with `receipt` template
  8. Add error handling and logging
  9. Export subscriber config with event name
- **Validation Plan:**
  - Test subscriber with event emission
  - Verify email data structure matches template expectations
  - Verify email is sent successfully

#### Task 4: Create Receipt Email Template
- **Objective:** Create React Email template for receipt emails with all required sections
- **Impacted Modules/Files:**
  - `apps/medusa/src/modules/resend/emails/receipt.tsx` - New email template file
- **References:**
  - Payment reminder template: `apps/medusa/src/modules/resend/emails/payment-reminder.tsx` - Structure to follow
  - Clarification packet: `clarification/2026-01-15_initial-clarification.md` - Email contents requirements
- **Dependencies:** Task 3 (subscriber must reference template)
- **Acceptance Criteria:**
  - Template uses React Email components
  - Template includes event details section (date, time, location, party size, event type)
  - Template includes pricing breakdown section (price per person, total event cost)
  - Template includes ticket purchases section (if applicable)
  - Template includes optional tip section (only shown when tip provided)
  - Template includes chef contact information
  - Template includes request reference number
  - Template is responsive and accessible
- **Testing Criteria:**
  - Template renders correctly with all data
  - Tip section only appears when tip data provided
  - All sections display correct information
  - Template is responsive on mobile devices
- **Subtasks:**
  1. Create `receipt.tsx` email template file
  2. Define `ReceiptEmailProps` type with tip fields
  3. Create header section with receipt branding
  4. Create event details section
  5. Create pricing breakdown section
  6. Create ticket purchases section (if applicable)
  7. Create conditional tip section (only if tipAmount provided)
  8. Create footer section with chef contact info
  9. Export template function
- **Validation Plan:**
  - Render template with sample data
  - Verify all sections display correctly
  - Test with and without tip data
  - Verify responsive design

#### Task 5: Create Send Receipt API Route
- **Objective:** Create API route that validates request and executes receipt workflow
- **Impacted Modules/Files:**
  - `apps/medusa/src/api/admin/chef-events/[id]/send-receipt/route.ts` - New API route file
- **References:**
  - Payment reminder route: `apps/medusa/src/api/admin/chef-events/[id]/send-payment-reminder/route.ts` - Pattern to follow
  - Clarification packet: `clarification/2026-01-15_initial-clarification.md` - Validation requirements
- **Dependencies:** Task 2 (workflow must exist)
- **Acceptance Criteria:**
  - Route validates chef event exists and has `productId`
  - Route checks event status is `'confirmed'`
  - Route validates request body with Zod schema (recipients?, notes?, tipAmount?, tipMethod?)
  - Route validates tip amount is numeric and non-negative if provided
  - Route validates tip method is string if tip amount provided
  - Route defaults recipients to host email if not provided
  - Route executes `sendReceiptWorkflow` and returns result
  - Route handles errors gracefully with appropriate status codes
- **Testing Criteria:**
  - Route validates input correctly
  - Route returns 404 if chef event not found
  - Route returns 400 if validation fails
  - Route returns 200 with success response on success
  - Route handles errors gracefully
- **Subtasks:**
  1. Create `send-receipt/route.ts` file
  2. Define Zod schema for request body validation
  3. Implement POST handler
  4. Validate chef event exists and has productId
  5. Validate event status is confirmed
  6. Validate and parse request body
  7. Validate tip amount if provided (numeric, non-negative)
  8. Default recipients to host email if not provided
  9. Execute sendReceiptWorkflow
  10. Return success response
  11. Add error handling with appropriate status codes
- **Validation Plan:**
  - Test API route with valid requests
  - Test validation with invalid inputs
  - Test error cases (event not found, invalid status, etc.)
  - Verify workflow is called correctly

#### Task 6: Add Send Receipt SDK Method and React Hook
- **Objective:** Add SDK method and React hook for sending receipts from admin UI
- **Impacted Modules/Files:**
  - `apps/medusa/src/sdk/admin/admin-chef-events.ts` - Add `sendReceipt` method
  - `apps/medusa/src/admin/hooks/chef-events.ts` - Add `useAdminSendReceiptMutation` hook
- **References:**
  - Payment reminder SDK: `apps/medusa/src/sdk/admin/admin-chef-events.ts` - Method pattern
  - Payment reminder hook: `apps/medusa/src/admin/hooks/chef-events.ts` - Hook pattern
- **Dependencies:** Task 5 (API route must exist)
- **Acceptance Criteria:**
  - SDK method `sendReceipt` added to `AdminChefEventsResource` class
  - Method accepts chef event ID and optional data (recipients, notes, tipAmount, tipMethod)
  - Method calls `/admin/chef-events/{id}/send-receipt` endpoint
  - React hook `useAdminSendReceiptMutation` created
  - Hook uses React Query mutation pattern
  - Hook invalidates chef events queries on success
  - TypeScript types updated for tip fields
- **Testing Criteria:**
  - SDK method calls correct endpoint with correct data
  - Hook mutation executes successfully
  - Query invalidation works correctly
  - TypeScript types are correct
- **Subtasks:**
  1. Add `AdminSendReceiptDTO` interface with tip fields
  2. Add `sendReceipt` method to `AdminChefEventsResource` class
  3. Create `useAdminSendReceiptMutation` hook
  4. Implement mutation function with tip data support
  5. Add query invalidation on success
  6. Export hook from hooks file
- **Validation Plan:**
  - Test SDK method with various inputs
  - Test hook mutation in component
  - Verify query invalidation works

#### Task 7: Add Receipt Button and Tip Input Modal to Admin UI
- **Objective:** Add receipt button to chef event detail page with tip input modal
- **Impacted Modules/Files:**
  - `apps/medusa/src/admin/routes/chef-events/[id]/page.tsx` - Add receipt button and modal
- **References:**
  - Payment reminder button: `apps/medusa/src/admin/routes/chef-events/[id]/page.tsx` - Button pattern
  - Clarification packet: `clarification/2026-01-15_initial-clarification.md` - UI requirements
- **Dependencies:** Task 6 (hook must exist), Task 1 (tip fields must exist)
- **Acceptance Criteria:**
  - Receipt button appears when `isConfirmed && productId && (hasEventTakenPlace || availableTickets === 0)`
  - Button uses `useAdminSendReceiptMutation` hook
  - Clicking button opens modal/dialog with tip input fields
  - Modal includes optional tip amount field (number input)
  - Modal includes checkbox for "Cash" tip method
  - Modal shows dropdown (Venmo/Zelle/PayPal/Other) when cash checkbox unchecked
  - Modal shows text input when "Other" selected in dropdown
  - Modal shows warning/confirmation if receipt was previously sent
  - Modal validates tip amount (numeric, non-negative)
  - Button shows loading state during mutation
  - Toast notifications shown on success/error
- **Testing Criteria:**
  - Button appears when conditions are met
  - Button is disabled when conditions not met
  - Modal opens correctly with all fields
  - Tip input validation works correctly
  - Warning shown if receipt previously sent
  - Receipt sent successfully with tip data
  - Toast notifications appear correctly
- **Subtasks:**
  1. Add helper function to check if event has taken place (date-only comparison)
  2. Add state for receipt button visibility logic
  3. Add state for tip input modal visibility
  4. Add state for tip amount and tip method
  5. Add state for "Other" custom method text
  6. Add receipt button to UI (next to payment reminder button)
  7. Create tip input modal component with all fields
  8. Implement tip method checkbox logic
  9. Implement dropdown logic for other methods
  10. Implement "Other" text input logic
  11. Add validation for tip amount
  12. Add warning/confirmation if receipt previously sent
  13. Implement send receipt handler with tip data
  14. Add loading states and toast notifications
- **Validation Plan:**
  - Test button visibility with various event states
  - Test tip input modal with all combinations
  - Test validation and error handling
  - Test receipt sending with and without tip
  - Test warning when receipt previously sent

#### Task 8: Register Receipt Email Template in Resend Module
- **Objective:** Register receipt email template in Resend notification service
- **Impacted Modules/Files:**
  - `apps/medusa/src/modules/resend/service.ts` - Register receipt template
- **References:**
  - Payment reminder template registration: `apps/medusa/src/modules/resend/service.ts` - Pattern to follow
- **Dependencies:** Task 4 (email template must exist)
- **Acceptance Criteria:**
  - Receipt template registered in Resend service
  - Template mapped to 'receipt' template name
  - Template export matches expected format
- **Testing Criteria:**
  - Template registered correctly
  - Template can be referenced by name in notification service
- **Subtasks:**
  1. Import receipt email template
  2. Add receipt template to template mapping
  3. Verify template registration
- **Validation Plan:**
  - Verify template is registered
  - Test template can be used by notification service

### Implementation Guidance

**From `.cursor/rules/medusa-development.mdc` → Medusa v2 Architecture:**
- Use `MedusaService` pattern for service classes with dependency injection
- Follow API route patterns: validate inputs, resolve services from container, handle errors gracefully
- Use workflows for multi-step business processes: `createStep`, `createWorkflow`, `emitEventStep`
- Use subscribers for event-driven handlers: `SubscriberArgs`, `SubscriberConfig`
- Model definitions use `model.define()` with proper field types

**From `.cursor/rules/typescript-patterns.mdc` → Type Definitions:**
- Use interfaces for object shapes (e.g., `SendReceiptWorkflowInput`)
- Use Zod for runtime validation in API routes
- Use proper type guards and validation
- Avoid `any` type unless absolutely necessary

**From `.cursor/rules/medusa-development.mdc` → Model Definitions:**
```typescript
// Model pattern
export const ChefEvent = model.define("chef_event", {
  tipAmount: model.number().nullable(),
  tipMethod: model.text().nullable(),
})
```

**From `.cursor/rules/medusa-development.mdc` → API Route Patterns:**
```typescript
// API route validation pattern
const schema = z.object({
  recipients: z.array(z.string().email()).optional(),
  notes: z.string().optional(),
  tipAmount: z.number().nonnegative().optional(),
  tipMethod: z.string().optional(),
})
```

**From existing payment reminder implementation:**
- Workflow pattern: `apps/medusa/src/workflows/send-payment-reminder.ts`
- Subscriber pattern: `apps/medusa/src/subscribers/chef-event-payment-reminder.ts`
- Email template pattern: `apps/medusa/src/modules/resend/emails/payment-reminder.tsx`
- API route pattern: `apps/medusa/src/api/admin/chef-events/[id]/send-payment-reminder/route.ts`

**From existing migration pattern:**
- Migration file naming: `Migration{timestamp}.ts`
- Use `this.addSql()` for SQL statements
- Include `up()` and `down()` methods
- Reference: `apps/medusa/src/modules/chef-event/migrations/Migration20250731025214.ts`

### Release & Delivery Strategy
- **Implementation Order:** Tasks should be completed in sequence (1 → 2 → 3 → 4 → 5 → 6 → 7 → 8) as each builds on previous work
- **Testing Strategy:** Each task includes validation plan; integration testing after all tasks complete
- **Rollout:** Feature can be deployed incrementally (backend first, then frontend) or as complete feature
- **Review Gates:** Code review required for each task; integration testing before production deployment

### Approval & Ops Readiness
- **Required Approvals:** Code review by development team
- **Operational Checklist:**
  - Migration tested in development environment
  - Email template tested with sample data
  - API route tested with various inputs
  - Admin UI tested with different event states
  - Error handling verified

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Migration conflicts if other migrations added | Risk | Developer | Test migration in isolation, coordinate with team | Before deployment |
| Email template rendering issues | Risk | Developer | Test template with various data combinations | During Task 4 |
| Tip validation edge cases | Risk | Developer | Comprehensive validation testing | During Task 7 |
| Multiple receipt sends causing confusion | Risk | Product | Warning/confirmation implemented in Task 7 | Addressed in clarification |
| Event date validation timezone edge cases | Question | Developer | Using date-only comparison avoids timezone issues | Addressed in clarification |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- `AGENTS.md` (root) - Standard workflow instructions
- `.devagent/core/AGENTS.md` - DevAgent core documentation

### Coding Standards and Conventions
- `.cursor/rules/medusa-development.mdc` - Medusa v2 development patterns
- `.cursor/rules/typescript-patterns.mdc` - TypeScript best practices
- `.cursor/rules/remix-storefront-components.mdc` - React component patterns (for admin UI)

### Related Documentation
- Research packet: `research/2026-01-15_chef-receipt-feature-research.md`
- Clarification packet: `clarification/2026-01-15_initial-clarification.md`
- Payment reminder implementation: `apps/medusa/src/api/admin/chef-events/[id]/send-payment-reminder/route.ts`

### Related Implementation Files
- Payment reminder workflow: `apps/medusa/src/workflows/send-payment-reminder.ts`
- Payment reminder subscriber: `apps/medusa/src/subscribers/chef-event-payment-reminder.ts`
- Payment reminder email template: `apps/medusa/src/modules/resend/emails/payment-reminder.tsx`
- Payment reminder API route: `apps/medusa/src/api/admin/chef-events/[id]/send-payment-reminder/route.ts`
- Chef event detail page: `apps/medusa/src/admin/routes/chef-events/[id]/page.tsx`
- Chef event model: `apps/medusa/src/modules/chef-event/models/chef-event.ts`
- Chef event migrations: `apps/medusa/src/modules/chef-event/migrations/`
