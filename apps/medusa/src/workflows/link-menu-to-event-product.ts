import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { MENU_MODULE } from "../modules/menu"
import { Modules } from "@medusajs/framework/utils"

export type LinkMenuToEventProductWorkflowInput = {
  productId: string
  menuId: string
}

export const linkMenuToEventProductWorkflow = createWorkflow(
  "link-menu-to-event-product",
  (input: LinkMenuToEventProductWorkflowInput) => {
    createRemoteLinkStep([{
      [Modules.PRODUCT]: {
        product_id: input.productId
      },
      [MENU_MODULE]: {
        menu_id: input.menuId
      }
    }])
  }
)