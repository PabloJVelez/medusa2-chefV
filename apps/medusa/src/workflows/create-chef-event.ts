import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"

type CreateChefEventWorkflowInput = {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  requestedDate: string
  requestedTime: string
  partySize: number
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style'
  templateProductId?: string
  locationType: 'customer_location' | 'chef_location'
  locationAddress: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  totalPrice?: number
  depositPaid?: boolean
  specialRequirements?: string
  estimatedDuration?: number
}

const createChefEventStep = createStep(
  "create-chef-event-step",
  async (input: CreateChefEventWorkflowInput, { container }: { container: any }) => {
    const chefEventModuleService = container.resolve(CHEF_EVENT_MODULE)
    
    // Provide default estimated duration based on event type if not provided
    const defaultDurations = {
      'cooking_class': 180, // 3 hours
      'plated_dinner': 240, // 4 hours  
      'buffet_style': 150   // 2.5 hours
    }
    
    const chefEvent = await chefEventModuleService.createChefEvents({
      ...input,
      requestedDate: new Date(input.requestedDate),
      totalPrice: input.totalPrice || 0,
      depositPaid: input.depositPaid || false,
      estimatedDuration: input.estimatedDuration || defaultDurations[input.eventType]
    })
    
    return new StepResponse(chefEvent)
  }
)

export const createChefEventWorkflow = createWorkflow(
  "create-chef-event-workflow",
  function (input: CreateChefEventWorkflowInput) {
    const chefEvent = createChefEventStep(input)
    
    emitEventStep({
      eventName: "chef-event.requested",
      data: {
        chefEventId: chefEvent.id
      }
    })
    
    return new WorkflowResponse({
      chefEvent
    })
  }
) 