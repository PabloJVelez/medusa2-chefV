import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CheckEventConflictsStepInput = {
  requestedDate: string
  requestedTime: string
}

export const checkEventConflictsStep = createStep(
  "check-event-conflicts",
  async (data: CheckEventConflictsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: existingEvents } = await query.graph({
      entity: "chef_event",
      fields: ["id", "status", "requestedDate", "requestedTime"],
      filters: {
        status: ["pending", "confirmed"],
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime
      }
    })

    const hasConflictingEvent = existingEvents && existingEvents.length > 0
    return new StepResponse(hasConflictingEvent, hasConflictingEvent)
  }
) 