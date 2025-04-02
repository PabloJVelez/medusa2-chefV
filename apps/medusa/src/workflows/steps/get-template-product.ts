// import { StepResponse, createStep } from "@medusajs/workflows-sdk"
// import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

// type GetTemplateProductInput = {
//   productId: string
//   partySize: string | number
// }

// type GetTemplateProductOutput = {
//   product: any // Using any temporarily
//   totalPrice: number
//   pricePerPerson: number
// }

// export const getTemplateProductStepId = 'get-template-product-step'

// export const getTemplateProductStep = createStep<
//   GetTemplateProductInput,
//   GetTemplateProductOutput,
//   string
// >(
//   getTemplateProductStepId,
//   async (data, { container }) => {
//     // console.log("GET TEMPLATE PRODUCT STEP")
//     // const { data: products } = useQueryGraphStep({
//     //   entity: "product",
//     //   fields: [
//     //     "id",
//     //     "title",
//     //     "variants.id",
//     //     "variants.prices.*",
//     //     "menu.id"
//     //   ],
//     //   filters: {
//     //     id: data.productId
//     //   }
//     // })

//     // const product = products[0]
//     // if (!product) {
//     //   throw new Error("Template product not found")
//     // }

//     // console.log("PRODUCT FROM STEP", product)

//     // const templateVariant = product.variants?.[0]
//     // if (!templateVariant || !templateVariant.prices?.length) {
//     //   throw new Error("Template product has no price information")
//     // }

//     // console.log("TEMPLATE VARIANT FROM STEP", templateVariant)

//     // const result = {
//     //   product,
//     //   pricePerPerson: templateVariant.prices[0].amount,
//     //   totalPrice: templateVariant.prices[0].amount * Number(data.partySize)
//     // }
//     // console.log("RESULT FROM STEP", result)
//     // return new StepResponse(result, product.id)

//         //Return mock data for now
//     return new StepResponse({
//       product: {
//         id: "123",
//         title: "Mock Product",
//         variants: [{ id: "123", prices: [{ amount: 100 }] }]
//       },
//       totalPrice: 100,
//       pricePerPerson: 100
//     }, "123")

//   },
//   async (productId, { container }) => {
//     if (!productId) return
//     console.error("Compensating for get-template-product step failure", {
//       productId,
//       error: "Step failed, no actual cleanup needed for read operation"
//     })
//     return new StepResponse({ success: true })
//   }
// ) 



import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type GetTemplateProductInput = {
  productId: string
  partySize: string | number
}

type GetTemplateProductOutput = {
  product: any // Using any temporarily
  totalPrice: number
  pricePerPerson: number
}

export const getTemplateProductStepId = 'get-template-product-step'

export const getTemplateProductStep = createStep<
  GetTemplateProductInput,
  GetTemplateProductOutput,
  string
>(
  getTemplateProductStepId,
  async (data, { container }) => {
    // Your step implementation...
    return new StepResponse({
      product: {
        id: "123",
        title: "Mock Product",
        variants: [{ id: "123", prices: [{ amount: 100 }] }]
      },
      totalPrice: 100,
      pricePerPerson: 100
    }, "123")
  },
  // Add compensation function or close the parenthesis
  async (productId) => {
    // Optional compensation logic if needed
    // This runs if the workflow fails after this step
  }
)