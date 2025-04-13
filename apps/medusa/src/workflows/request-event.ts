import { 
  createStep,
  createWorkflow, 
  StepResponse,
  transform,
  WorkflowResponse,
  type WorkflowData
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep, emitEventStep } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import type { ChefEvent } from "../modules/chef-event/types"
import ChefEventService from "../modules/chef-event/service"
import { Product } from "@medusajs/medusa"
import { sendEventRequestNotificationStep } from "./steps/send-event-request-notification"
// import { checkEventConflictsStep } from "./steps/check-event-conflicts"
// import { sendNotificationStep } from "./steps/send-notification"

export type RequestEventWorkflowInput = {
  productId: string
  requestedDate: string
  requestedTime: string
  partySize: number | string
  eventType: string
  locationType: string
  locationAddress?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  productName?: string
} 

type ChefEventData = {
  chefEvent: Partial<ChefEvent>
  templateProduct: Product
  pricePerPerson: number
  totalPrice: number
}

// Define steps inside the workflow file
const getTemplateProduct = createStep(
  "get-template-product",
  async ({ productId, partySize }: { productId: string, partySize: string | number }, { container }) => {
  
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const { data: [product] } = await query.graph({
          entity: "product",
          fields: ["id", "title", "variants.id", "variants.prices.*", "menu.id"],
          filters: {
            id: productId
          }
        })

        if (!product) {
          throw new Error("Template product not found")
        }

        const templateVariant = product.variants?.[0]
        if (!templateVariant || !templateVariant.prices?.length) {
          throw new Error("Template product has no price information")
        }

        console.log("TEMPLATE VARIANT --->", templateVariant)

    return new StepResponse({
      product: {
        id: productId,
        title: product.title,
      },
      totalPrice: templateVariant.prices[0].amount,
      pricePerPerson: templateVariant.prices[0].amount / Number(partySize)
    })
  },
  async (compensationData, { container }) => {
    // Compensation logic (optional)
  }
)

const createChefEventStep = createStep(
  "create-chef-event",
  async (data: ChefEventData, { container }) => {
    const chefEventService: ChefEventService = container.resolve(
      CHEF_EVENT_MODULE
    )
    const chefEventData = {
      status: data.chefEvent.status || 'pending',
      requestedDate: data.chefEvent.requestedDate,
      requestedTime: data.chefEvent.requestedTime,
      partySize: data.chefEvent.partySize,
      eventType: data.chefEvent.eventType,
      locationType: data.chefEvent.locationType,
      locationAddress: data.chefEvent.locationAddress || '',
      firstName: data.chefEvent.firstName,
      lastName: data.chefEvent.lastName,
      email: data.chefEvent.email,
      phone: data.chefEvent.phone || '',
      notes: data.chefEvent.notes || '',
      totalPrice: data.chefEvent.totalPrice || 0,
      depositPaid: data.chefEvent.depositPaid || false,
      specialRequirements: data.chefEvent.specialRequirements || '',
      estimatedDuration: data.chefEvent.estimatedDuration || 180,
      templateProductId: data.chefEvent.templateProductId,
    }

    const chefEvent = await chefEventService.createChefEvents(chefEventData)
    console.log("CHEF EVENT CREATED ---> ", chefEvent)

    return new StepResponse(chefEvent)
  },
  async (compensationData, { container }) => {

  }
)


export const requestEventWorkflow = createWorkflow(
  "request-event",
  function (input: WorkflowData<RequestEventWorkflowInput>) {
    
    const templateProductResult = getTemplateProduct({
      productId: input.productId,
      partySize: input.partySize
    })

    // Build chef event using template product data
    const chefEventResult = createChefEventStep({
      chefEvent: {
        status: "pending",
        requestedDate: input.requestedDate,
        requestedTime: input.requestedTime,
        partySize: input.partySize as number,
        eventType: input.eventType as 'cooking_class' | 'plated_dinner' | 'buffet_style',
        locationType: input.locationType as 'customer_location' | 'chef_location',
        locationAddress: input.locationAddress || "",
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone || "",
        notes: input.notes || "",
        totalPrice: templateProductResult.totalPrice,
        depositPaid: false,
        specialRequirements: "",
        estimatedDuration: 180,
        templateProductId: templateProductResult.product.id,
      },
      templateProduct: templateProductResult.product,
      pricePerPerson: templateProductResult.pricePerPerson,
      totalPrice: templateProductResult.totalPrice
    })

    emitEventStep({
      eventName: "chef-event.requested",
      data: {
        chefEvent: chefEventResult,
        templateProduct: templateProductResult.product,
      }
    })
    const result = transform(
      {
        templateProductResult,
        chefEventResult
      },
      (data) => {
        return {
          product: data.templateProductResult.product,
          chefEvent: data.chefEventResult
        }
      }
    )
    
    return new WorkflowResponse(result)
  }
)

export default requestEventWorkflow