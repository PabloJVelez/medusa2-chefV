import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { 
  createMenuFromProductWorkflow, 
  CreateMenuFromProductWorkflowInput
} from "../create-menu-from-product"

createProductsWorkflow.hooks.productsCreated(
	async ({ products, additional_data }, { container }) => {
    const workflow = createMenuFromProductWorkflow(container)
    
    for (let product of products) {
      await workflow.run({
        input: {
          product,
          additional_data
        } as CreateMenuFromProductWorkflowInput
      })
    }
	}
)