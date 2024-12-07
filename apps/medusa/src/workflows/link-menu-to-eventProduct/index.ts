import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { MENU_MODULE } from "../../modules/menu"

export type LinkMenuToEventProductWorkflowInput = {
  productId: string
  menuId: string
}

export const linkMenuToEventProductWorkflow = createWorkflow(
  "link-menu-to-event-product",
  (input: LinkMenuToEventProductWorkflowInput) => {
    // Create the remote link directly in the workflow
    createRemoteLinkStep([{
      [Modules.PRODUCT]: {
        product_id: input.productId
      },
      [MENU_MODULE]: {
        menu_id: input.menuId
      }
    }])

    return new WorkflowResponse({
      productId: input.productId,
      menuId: input.menuId
    })
  }
) 