import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { 
  createMenuFromProductWorkflow, 
  CreateMenuFromProductWorkflowInput
} from "../create-menu-from-product"
import {
  linkEventToProductWorkflow,
  LinkEventToProductWorkflowInput
} from "../link-event-to-product"
import { createProductDetailsWorkflow, CreateProductDetailsWorkflowInput } from "../create-product-details"
createProductsWorkflow.hooks.productsCreated(
	async ({ products, additional_data }, { container }) => {
    const menuWorkflow = createMenuFromProductWorkflow(container)
    const chefEventWorkflow = linkEventToProductWorkflow(container)
    const productDetailsWorkflow = createProductDetailsWorkflow(container)
    for (let product of products) {
      if (additional_data?.menu) {
        await menuWorkflow.run({
          input: {
            product,
            additional_data
          } as CreateMenuFromProductWorkflowInput
        })
      }

      if (additional_data?.chefEvent) {
        await chefEventWorkflow.run({
          input: {
            productId: product.id,
            chefEventId: (additional_data?.chefEvent as any)?.id || ''
          } as LinkEventToProductWorkflowInput
        })
      }

      if (additional_data?.productDetails) {

        console.log("MADE IT HERE", additional_data?.productDetails)
        await productDetailsWorkflow.run({
          input: {
            productId: product.id,
            product_details: additional_data?.productDetails
          } as CreateProductDetailsWorkflowInput
        })
      }
    }
  }
)