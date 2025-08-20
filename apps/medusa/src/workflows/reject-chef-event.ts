import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import ChefEventModuleService from "../modules/chef-event/service"

type RejectChefEventWorkflowInput = {
  chefEventId: string
  rejectionReason: string
  chefNotes?: string
  rejectedBy?: string
}

const rejectChefEventStep = createStep(
  "reject-chef-event-step",
  async (input: RejectChefEventWorkflowInput, { container }: { container: any }) => {
    const chefEventModuleService: ChefEventModuleService = container.resolve(CHEF_EVENT_MODULE)
    
    // First, retrieve the chef event to verify it exists
    const chefEvent = await chefEventModuleService.retrieveChefEvent(input.chefEventId)
    
    if (!chefEvent) {
      throw new Error(`Chef event with id ${input.chefEventId} not found`)
    }
    
    // Update the chef event to cancelled status
    const updatedChefEvent = await chefEventModuleService.updateChefEvents({
      id: input.chefEventId,
      status: 'cancelled',
      rejectionReason: input.rejectionReason,
      chefNotes: input.chefNotes
    })
    
    return new StepResponse(updatedChefEvent)
  }
)

export const rejectChefEventWorkflow = createWorkflow(
  "reject-chef-event-workflow",
  function (input: RejectChefEventWorkflowInput) {
    const chefEvent = rejectChefEventStep(input)
    
    // Emit event for email notifications
    emitEventStep({
      eventName: "chef-event.rejected",
      data: {
        chefEventId: chefEvent.id,
        rejectionReason: input.rejectionReason
      }
    })
    
    return new WorkflowResponse({
      chefEvent
    })
  }
) 