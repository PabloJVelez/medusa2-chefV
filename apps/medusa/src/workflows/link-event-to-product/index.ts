import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"

export type LinkEventToProductWorkflowInput = {
  productId: string
  chefEventId: string
}

export const linkEventToProductWorkflow = createWorkflow(
  "link-event-to-product",
  (input: LinkEventToProductWorkflowInput) => {
    createRemoteLinkStep([{
      [Modules.PRODUCT]: {
        product_id: input.productId
      },
      [CHEF_EVENT_MODULE]: {
        chef_event_id: input.chefEventId
      }
    }])
  }
)