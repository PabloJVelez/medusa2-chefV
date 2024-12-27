import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ProductDTO } from "@medusajs/framework/types"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"
import { createChefEventStep } from "./steps/create-chefEvent"

export type LinkEventToProductWorkflowInput = {
  product: ProductDTO
  chefEvent: {
    status: string
    requestedDate: string
    requestedTime: string
    partySize: number
    eventType: string
    locationType: string
    locationAddress: string
    firstName: string
    lastName: string
    email: string
    phone: string
    notes: string
    totalPrice: number
    depositPaid: boolean
    specialRequirements: string
    estimatedDuration: number
    templateProductId: string
  }
}

export const linkEventToProductWorkflow = createWorkflow(
  "link-event-to-product",
  (input: LinkEventToProductWorkflowInput) => {
    const eventToCreate = transform(
      {
        input
      },
      (data) => data.input.chefEvent
    )
    const chefEvent = createChefEventStep({
      chefEvent: eventToCreate
    })
    when(({ chefEvent }), ({ chefEvent }) => chefEvent?.id !== undefined)
      .then(() => {
        createRemoteLinkStep([{
          [Modules.PRODUCT]: {
            product_id: input.product.id
          },
          [CHEF_EVENT_MODULE]: {
            chef_event_id: chefEvent.id
          }
        }])
      })

    return new WorkflowResponse({
      chefEvent
    })
  }
)