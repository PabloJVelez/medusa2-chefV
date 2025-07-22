import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep, createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import ChefEventModuleService from "../modules/chef-event/service"

type AcceptChefEventWorkflowInput = {
  chefEventId: string
  chefNotes?: string
  acceptedBy?: string
}

type ChefEventData = {
  id: string
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style'
  firstName: string
  lastName: string
  requestedDate: Date
  requestedTime: string
  partySize: number
  locationAddress: string
}

const acceptChefEventStep = createStep(
  "accept-chef-event-step",
  async (input: AcceptChefEventWorkflowInput, { container }: { container: any }) => {
    const chefEventModuleService: ChefEventModuleService = container.resolve(CHEF_EVENT_MODULE)
    
    // First, retrieve the chef event to get all the data we need
    const chefEvent = await chefEventModuleService.retrieveChefEvent(input.chefEventId)
    
    if (!chefEvent) {
      throw new Error(`Chef event with id ${input.chefEventId} not found`)
    }
    
    // Update the chef event to confirmed status
    const updatedChefEvent = await chefEventModuleService.updateChefEvents({
      id: input.chefEventId,
      status: 'confirmed',
      acceptedAt: new Date(),
      acceptedBy: input.acceptedBy || 'chef',
      chefNotes: input.chefNotes
    })
    
    return new StepResponse({
      originalChefEvent: chefEvent,
      updatedChefEvent: updatedChefEvent
    })
  }
)

const createEventProductStep = createStep(
  "create-event-product-step",
  async (input: { originalChefEvent: ChefEventData }, { container }: { container: any }) => {
    const chefEvent = input.originalChefEvent
    
    // Helper functions
    function getEventTypeLabel(eventType: ChefEventData['eventType']): string {
      const eventTypeLabels: Record<ChefEventData['eventType'], string> = {
        'cooking_class': 'Cooking Class',
        'plated_dinner': 'Plated Dinner',
        'buffet_style': 'Buffet Style'
      }
      return eventTypeLabels[eventType]
    }

    function calculateTotalPrice(chefEvent: ChefEventData): number {
      const pricing: Record<ChefEventData['eventType'], number> = {
        'cooking_class': 119.99,
        'plated_dinner': 149.99,
        'buffet_style': 99.99
      }
      
      const pricePerPerson = pricing[chefEvent.eventType]
      return pricePerPerson * chefEvent.partySize
    }

    function createUrlSafeHandle(chefEvent: ChefEventData): string {
      const eventType = chefEvent.eventType.replace('_', '-')
      const date = new Date(chefEvent.requestedDate).toISOString().split('T')[0]
      const customerName = `${chefEvent.firstName}-${chefEvent.lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '')
      return `event-${eventType}-${customerName}-${date}`
    }
    
    // Create product using the createProductsWorkflow
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [{
          title: `${getEventTypeLabel(chefEvent.eventType)} - ${chefEvent.firstName} ${chefEvent.lastName} - ${new Date(chefEvent.requestedDate).toLocaleDateString()}`,
          handle: createUrlSafeHandle(chefEvent),
          description: `Private chef event for ${chefEvent.firstName} ${chefEvent.lastName} on ${new Date(chefEvent.requestedDate).toLocaleDateString()} at ${chefEvent.requestedTime}. Event type: ${getEventTypeLabel(chefEvent.eventType)}. Location: ${chefEvent.locationAddress}.`,
          status: 'published',
          options: [
            {
              title: 'Ticket Type',
              values: ['Event Ticket']
            }
          ],
          variants: [{
            title: 'Event Ticket',
            sku: `EVENT-${chefEvent.id}-${new Date(chefEvent.requestedDate).toISOString().split('T')[0]}-${chefEvent.eventType}`,
            manage_inventory: true,
            options: {
              'Ticket Type': 'Event Ticket'
            },
            prices: [{
              amount: Math.round(calculateTotalPrice(chefEvent) * 100), // Convert to cents
              currency_code: 'usd'
            }]
          }]
        }]
      }
    })
    
    return new StepResponse(result[0])
  }
)

const linkChefEventToProductStep = createStep(
  "link-chef-event-to-product-step",
  async (input: { originalChefEvent: ChefEventData, product: any }, { container }: { container: any }) => {
    const chefEventModuleService: ChefEventModuleService = container.resolve(CHEF_EVENT_MODULE)
    
    // Update chef event with product ID
    const updatedChefEvent = await chefEventModuleService.updateChefEvents({
      id: input.originalChefEvent.id,
      productId: input.product.id
    })
    
    return new StepResponse(updatedChefEvent)
  }
)

export const acceptChefEventWorkflow = createWorkflow(
  "accept-chef-event-workflow",
  function (input: AcceptChefEventWorkflowInput) {
    const chefEventData = acceptChefEventStep(input)
    const product = createEventProductStep({ originalChefEvent: chefEventData.originalChefEvent })
    const linkedChefEvent = linkChefEventToProductStep({ 
      originalChefEvent: chefEventData.originalChefEvent, 
      product 
    })
    
    // Emit event for email notifications
    emitEventStep({
      eventName: "chef-event.accepted",
      data: {
        chefEventId: chefEventData.originalChefEvent.id,
        productId: product.id
      }
    })
    
    return new WorkflowResponse({
      success: true,
      chefEventId: linkedChefEvent.id,
      productId: product.id
    })
  }
) 