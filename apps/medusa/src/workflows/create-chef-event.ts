import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
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
    
    const chefEvent = await chefEventModuleService.createChefEvents({
      ...input,
      requestedDate: new Date(input.requestedDate),
      totalPrice: input.totalPrice || 0,
      depositPaid: input.depositPaid || false
    })
    
    return new StepResponse(chefEvent)
  }
)

export const createChefEventWorkflow = createWorkflow(
  "create-chef-event-workflow",
  function (input: CreateChefEventWorkflowInput) {
    const chefEvent = createChefEventStep(input)
    
    return new WorkflowResponse({
      chefEvent
    })
  }
) 