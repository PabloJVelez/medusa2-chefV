import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import ProductDetailsModuleService from "../../modules/product-details/service.js"
import { PRODUCT_DETAILS_MODULE } from "../../modules/product-details"

type CreateProductDetailsStepInput = {
  product_details: {
    type: string
  } 
}

export const createProductDetailsStep = createStep(
  "create-product-details",
  async (data: CreateProductDetailsStepInput, { container }) => {
    console.log("CREATE PRODUCT DETAILS STEP RUNNING WITH DATA", data)
    if (!data?.product_details) {
      return
    }

    const productDetailsModuleService: ProductDetailsModuleService = container.resolve(
      PRODUCT_DETAILS_MODULE
    )

    try {
      console.log("CREATING PRODUCT DETAILS")
      const productDetails = await productDetailsModuleService.createProductDetails(data.product_details)
      return new StepResponse(productDetails, productDetails)
    } catch (error) {
      throw error
    }
  },
  async (productDetails, { container }) => {
    const productDetailsModuleService: ProductDetailsModuleService = container.resolve(
      PRODUCT_DETAILS_MODULE
    )

    await productDetailsModuleService.deleteProductDetails(productDetails.id)
  }
)