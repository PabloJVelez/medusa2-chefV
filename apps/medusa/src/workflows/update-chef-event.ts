import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import ChefEventService from "../modules/chef-event/service"

export type UpdateChefEventWorkflowInput = {
  chefEventId: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  assignedChefId?: string
}

export const updateChefEventWorkflow = createWorkflow(
  "update-chef-event",
  (input: UpdateChefEventWorkflowInput) => {
    const updatedEvent = transform(
      {
        input
      },
      async (data, { container }) => {
        const chefEventService: ChefEventService = container.resolve(CHEF_EVENT_MODULE)
        const updatedEvent = await chefEventService.updateChefEvents({
          ...data.input
        })
        return updatedEvent
      }
    )

    return new WorkflowResponse({
      chefEvent: updatedEvent
    })
  }
)