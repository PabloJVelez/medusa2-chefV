import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"
import ChefEventService from "../../modules/chef-event/service"
import { UpdateChefEventWorkflowInput } from "../update-chef-event"

export const updateChefEventStep = createStep(
  "update-chef-event",
  async (data:  UpdateChefEventWorkflowInput, { container }) => {
    const chefEventService: ChefEventService = container.resolve(CHEF_EVENT_MODULE)
    const { chefEventId, status } = data
    const updatedEvent = await chefEventService.updateChefEvents(chefEventId, status)
    return new StepResponse(updatedEvent)
  }
)