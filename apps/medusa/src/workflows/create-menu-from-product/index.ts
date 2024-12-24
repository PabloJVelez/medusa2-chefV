import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ProductDTO } from "@medusajs/framework/types"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { MENU_MODULE } from "../../modules/menu"
import { createMenuStep } from "./steps/create-menu"

//TODO: This does not need to create a new menu, additional_data should come in with a menuId and we use that Id to link the menu to the product??

export type CreateMenuFromProductWorkflowInput = {
  product: ProductDTO
  additional_data?: {
    menu?: {
      name: string
      courses: {
        name: string
        dishes: {
          name: string
          description: string
          ingredients: {
            name: string
            optional: boolean
          }[]
        }[]
      }[]
    }
  }
}



export const createMenuFromProductWorkflow = createWorkflow(
  "create-menu-from-product",
  (input: CreateMenuFromProductWorkflowInput) => {
    const menuToCreate = transform(
      {
        input
      },
      (data) => data.input.additional_data?.menu
    )
    const menu = createMenuStep({
      menu: menuToCreate
    })

    when(({ menu }), ({ menu }) => menu?.id !== undefined)
      .then(() => {
        createRemoteLinkStep([{
          [Modules.PRODUCT]: {
            product_id: input.product.id
          },
          [MENU_MODULE]: {
            menu_id: menu.id
          }
        }])
      })

    return new WorkflowResponse({
      menu
    })
  }
)