import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_DETAILS_MODULE } from "../modules/product-details"
import { createProductDetailsStep } from "./steps/create-product-details"

export type CreateProductDetailsWorkflowInput = {
  productId: string
  product_details: {
    type: string
  }
}

export const createProductDetailsWorkflow = createWorkflow(
  "create-product-details",
  (input: CreateProductDetailsWorkflowInput) => {
    console.log("CREATE PRODUCT DETAILS WORKFLOW RUNNING WITH INPUT", input)
    const productDetailsToCreate = transform(
      {
        input
      },
      (data) => data.input.product_details
    )
    const productDetails = createProductDetailsStep({
      product_details: productDetailsToCreate
    })
    console.log("PRODUCT DETAILS", productDetails)

    when(({ productDetails }), ({ productDetails }) => productDetails?.id !== undefined)
      .then(() => {
        createRemoteLinkStep([{
          [Modules.PRODUCT]: {
            product_id: input.productId
          },
          [PRODUCT_DETAILS_MODULE]: {
            product_details_id: productDetails.id
          }
        }])
      })

    return new WorkflowResponse({
      productDetails
    })
  }
)