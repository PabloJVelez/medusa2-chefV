// import { createStep, StepResponse } from "@medusajs/workflows-sdk"
// import { CHEF_EVENT_MODULE } from "../../modules/chef-event"

// type CheckEventConflictsInput = {
//   requestedDate: string
//   requestedTime: string
// }

// export const checkEventConflictsStep = createStep<
//   CheckEventConflictsInput,
//   boolean,
//   void
// >(
//   'check-event-conflicts',
//   async (data, { container }) => {
//     const chefEventService = container.resolve(CHEF_EVENT_MODULE) as any
//     const hasConflicts = await chefEventService.hasConflictingEvents(
//       data.requestedDate,
//       data.requestedTime
//     )
//     return new StepResponse(hasConflicts)
//   },
//   // Compensation function - read operation, just log
//   async (data: boolean, { container }) => {
//     console.error("Compensating for check-event-conflicts step failure", {
//       error: "Step failed, no actual cleanup needed for read operation"
//     })
//   }
// ) 