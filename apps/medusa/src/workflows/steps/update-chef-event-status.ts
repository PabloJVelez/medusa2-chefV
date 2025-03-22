import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import ChefEventService from "../../modules/chef-event/service.js"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"

type UpdateChefEventStatusStepInput = {
  eventId: string
  status: string
  assignedChefId: string
}

export const updateChefEventStatusStep = createStep(
  "update-chef-event-status",
  async (data: UpdateChefEventStatusStepInput, { container }) => {
    const chefEventService: ChefEventService = container.resolve(CHEF_EVENT_MODULE)

    try {
      const updatedEvent = await chefEventService.updateChefEvents(data.eventId, {
        status: data.status,
        assignedChefId: data.assignedChefId
      })
      return new StepResponse(updatedEvent, updatedEvent)
    } catch (error) {
      throw error
    }
  }
) 