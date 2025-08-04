/**
 * Accept Chef Event Workflow
 * 
 * This workflow handles the acceptance of chef event requests and creates
 * corresponding event products. The workflow ensures:
 * 
 * 1. Chef event status is updated to 'confirmed'
 * 2. Digital shipping profile exists (for digital products)
 * 3. Digital sales channel exists (for product assignment)
 * 4. Digital location exists (for inventory management)
 * 5. Event product is created with proper sales channel assignment
 * 6. Inventory items are created and assigned to digital location
 * 7. Initial stock is set to party size for ticket sales
 * 8. Chef event is linked to the created product
 * 9. Acceptance email is sent (if enabled)
 * 
 * FIXED: Sales channel assignment - Event products are now automatically
 * assigned to the "Digital Sales Channel" to ensure they appear in the
 * correct sales channel in the admin interface.
 * 
 * FIXED: Inventory location assignment - Event products are now automatically
 * assigned to the "Digital Location" with initial stock equal to party size,
 * enabling proper inventory management and ticket sales.
 */

import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep, createProductsWorkflow, createShippingProfilesWorkflow, createSalesChannelsWorkflow, createStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import ChefEventModuleService from "../modules/chef-event/service"
import { Modules } from "@medusajs/framework/utils"

type AcceptChefEventWorkflowInput = {
  chefEventId: string
  chefNotes?: string
  acceptedBy?: string
  sendAcceptanceEmail?: boolean // New field
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
      chefNotes: input.chefNotes,
      sendAcceptanceEmail: input.sendAcceptanceEmail ?? true
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

const ensureDigitalSalesChannelStep = createStep(
  "ensure-digital-sales-channel-step",
  async (input: {}, { container }: { container: any }) => {
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    
    // Check if digital sales channel already exists
    const existingChannels = await salesChannelModuleService.listSalesChannels({
      name: "Digital Sales Channel"
    })
    
    if (existingChannels.length > 0) {
      return new StepResponse(existingChannels[0])
    }
    
    // Create digital sales channel if it doesn't exist
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Digital Sales Channel",
            description: "Channel for digital products and chef events"
          }
        ]
      }
    })
    
    return new StepResponse(result[0])
  }
)

const ensureDigitalLocationStep = createStep(
  "ensure-digital-location-step",
  async (input: {}, { container }: { container: any }) => {
    const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
    
    // Check if digital location already exists
    const existingLocations = await stockLocationModuleService.listStockLocations({
      name: "Digital Location"
    })
    
    if (existingLocations.length > 0) {
      return new StepResponse(existingLocations[0])
    }
    
    // Create digital location if it doesn't exist
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Digital Location",
            address: {
              city: "Digital",
              country_code: "US",
              province: "Digital",
              address_1: "Digital Product Location",
              postal_code: "00000",
            },
          },
        ],
      },
    })
    
    return new StepResponse(result[0])
  }
)

const createEventProductStep = createStep(
  "create-event-product-step",
  async (input: { originalChefEvent: ChefEventData, digitalShippingProfile: any, digitalSalesChannel: any, digitalLocation: any }, { container }: { container: any }) => {
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
    
    // Create product using the createProductsWorkflow
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [{
          title: `${getEventTypeLabel(chefEvent.eventType)} - ${chefEvent.firstName} ${chefEvent.lastName} - ${new Date(chefEvent.requestedDate).toLocaleDateString()}`,
          handle: createUrlSafeHandle(chefEvent),
          description: `Private chef event for ${chefEvent.firstName} ${chefEvent.lastName} on ${new Date(chefEvent.requestedDate).toLocaleDateString()} at ${chefEvent.requestedTime}. Event type: ${getEventTypeLabel(chefEvent.eventType)}. Location: ${chefEvent.locationAddress}.`,
          status: 'published',
          shipping_profile_id: input.digitalShippingProfile.id,
          sales_channels: [{ id: input.digitalSalesChannel.id }], // Assign sales channel
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
    
    const product = result[0]
    
    // Create inventory items directly in this step
    const inventoryModuleService = container.resolve(Modules.INVENTORY)
    const inventoryItems = []
    
    for (const variant of product.variants) {
      try {
        // Check if inventory item already exists for this SKU
        const existingInventoryItems = await inventoryModuleService.listInventoryItems({
          sku: variant.sku
        })
        
        let inventoryItem
        
        if (existingInventoryItems.length > 0) {
          // Use existing inventory item
          inventoryItem = existingInventoryItems[0]
          
        } else {
          // Create new inventory item
          inventoryItem = await inventoryModuleService.createInventoryItems({
            sku: variant.sku,
            origin_country: "US",
            hs_code: "",
            mid_code: "",
            material: "",
            weight: 0,
            length: 0,
            height: 0,
            width: 0,
            requires_shipping: false, // Digital products don't require shipping
            description: `Digital ticket for ${variant.title}`,
            title: variant.title,
          })
          
        }
        
        // Check if inventory level already exists for this item and location
        const existingLevels = await inventoryModuleService.listInventoryLevels({
          inventory_item_id: inventoryItem.id,
          location_id: input.digitalLocation.id
        })
        
        if (existingLevels.length === 0) {
          // Assign inventory item to digital location with initial stock
          await inventoryModuleService.createInventoryLevels({
            inventory_item_id: inventoryItem.id,
            location_id: input.digitalLocation.id,
            stocked_quantity: input.originalChefEvent.partySize, // Set initial stock to party size
            reserved_quantity: 0,
          })
          
        }
        inventoryItems.push(inventoryItem)
        
      } catch (error) {
        console.error(`❌ Error processing inventory for variant ${variant.title}:`, error)
        throw error
      }
    }
    
    return new StepResponse({
      product: product,
      inventoryItems: inventoryItems
    })
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
    const digitalSalesChannel = ensureDigitalSalesChannelStep() // Ensure digital sales channel exists
    const digitalLocation = ensureDigitalLocationStep() // Ensure digital location exists
    const productAndInventory = createEventProductStep({ 
      originalChefEvent: chefEventData.originalChefEvent,
      digitalShippingProfile,
      digitalSalesChannel, // Pass digital sales channel to product creation
      digitalLocation // Pass digital location to inventory creation
    })
    const linkedChefEvent = linkChefEventToProductStep({ 
      originalChefEvent: chefEventData.originalChefEvent, 
      product: productAndInventory.product // Use the product from the combined step
    })
    
    // Only emit event if email should be sent
    if (input.sendAcceptanceEmail ?? true) {
      emitEventStep({
        eventName: "chef-event.accepted",
        data: {
          chefEventId: linkedChefEvent.id,
          productId: productAndInventory.product.id
        }
      })
    }
    
    return new WorkflowResponse({
      success: true,
      chefEventId: linkedChefEvent.id,
      productId: productAndInventory.product.id,
      emailSent: input.sendAcceptanceEmail ?? true
    })
  }
) 