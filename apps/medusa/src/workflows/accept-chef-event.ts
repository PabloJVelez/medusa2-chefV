import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep, createProductsWorkflow, createShippingProfilesWorkflow } from "@medusajs/medusa/core-flows"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import ChefEventModuleService from "../modules/chef-event/service"
import { Modules } from "@medusajs/framework/utils"

type AcceptChefEventWorkflowInput = {
  chefEventId: string
  chefNotes?: string
  acceptedBy?: string
}

type ChefEventData = {
  id: string
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style'
  requestedDate: Date
  requestedTime: string
  partySize: number
  firstName: string
  lastName: string
  locationAddress: string
}

const acceptChefEventStep = createStep(
  "accept-chef-event-step",
  async (input: AcceptChefEventWorkflowInput, { container }: { container: any }) => {
    const chefEventModuleService: ChefEventModuleService = container.resolve(CHEF_EVENT_MODULE)
    
    // Get the original chef event data
    const originalChefEvent = await chefEventModuleService.retrieveChefEvent(input.chefEventId)
    
    // Update the chef event status to confirmed
    const updatedChefEvent = await chefEventModuleService.updateChefEvents({
      id: input.chefEventId,
      status: 'confirmed',
      acceptedAt: new Date(),
      acceptedBy: input.acceptedBy || 'chef',
      chefNotes: input.chefNotes
    })
    
    return new StepResponse({
      updatedChefEvent,
      originalChefEvent
    })
  }
)

const ensureDigitalShippingProfileStep = createStep(
  "ensure-digital-shipping-profile-step",
  async (input: {}, { container }: { container: any }) => {
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    
    // Check if digital shipping profile already exists
    const existingProfiles = await fulfillmentModuleService.listShippingProfiles({
      name: "Digital Products"
    })
    
    if (existingProfiles.length > 0) {
      return new StepResponse(existingProfiles[0])
    }
    
    // Create digital shipping profile if it doesn't exist
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Digital Products",
            type: "digital"
          }
        ]
      }
    })
    
    return new StepResponse(result[0])
  }
)

const createEventProductStep = createStep(
  "create-event-product-step",
  async (input: { originalChefEvent: ChefEventData, digitalShippingProfile: any }, { container }: { container: any }) => {
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

    function calculatePricePerPerson(chefEvent: ChefEventData): number {
      const pricing: Record<ChefEventData['eventType'], number> = {
        'cooking_class': 119.99,
        'plated_dinner': 149.99,
        'buffet_style': 99.99
      }
      
      return pricing[chefEvent.eventType]
    }

    function calculateTotalPrice(chefEvent: ChefEventData): number {
      const pricePerPerson = calculatePricePerPerson(chefEvent)
      return pricePerPerson * chefEvent.partySize
    }

    function createUrlSafeHandle(chefEvent: ChefEventData): string {
      const eventType = chefEvent.eventType.replace('_', '-')
      const date = new Date(chefEvent.requestedDate).toISOString().split('T')[0]
      const customerName = `${chefEvent.firstName}-${chefEvent.lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '')
      return `event-${eventType}-${customerName}-${date}`
    }
    
    // Calculate pricing
    const pricePerPerson = calculatePricePerPerson(chefEvent)
    const totalPrice = calculateTotalPrice(chefEvent)
    
    console.log('💰 PRICING DEBUG:', {
      eventType: chefEvent.eventType,
      partySize: chefEvent.partySize,
      pricePerPerson: pricePerPerson,
      totalPrice: totalPrice,
      priceInDollars: pricePerPerson
    })
    
    // Create product using the createProductsWorkflow
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [{
          title: `${getEventTypeLabel(chefEvent.eventType)} - ${chefEvent.firstName} ${chefEvent.lastName} - ${new Date(chefEvent.requestedDate).toLocaleDateString()}`,
          handle: createUrlSafeHandle(chefEvent),
          description: `Private chef event for ${chefEvent.firstName} ${chefEvent.lastName} on ${new Date(chefEvent.requestedDate).toLocaleDateString()} at ${chefEvent.requestedTime}. Event type: ${getEventTypeLabel(chefEvent.eventType)}. Location: ${chefEvent.locationAddress}.`,
          status: 'published',
          shipping_profile_id: input.digitalShippingProfile.id,
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
              amount: pricePerPerson,
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
    const digitalShippingProfile = ensureDigitalShippingProfileStep()
    const product = createEventProductStep({ 
      originalChefEvent: chefEventData.originalChefEvent,
      digitalShippingProfile 
    })
    const linkedChefEvent = linkChefEventToProductStep({ 
      originalChefEvent: chefEventData.originalChefEvent, 
      product 
    })
    
    // TODO: Emit event for email notifications
    // emitEventStep("chef-event.accepted", {
    //   chefEventId: chefEventData.originalChefEvent.id,
    //   productId: product.id
    // })
    
    return new WorkflowResponse({
      success: true,
      chefEventId: linkedChefEvent.id,
      productId: product.id
    })
  }
) 