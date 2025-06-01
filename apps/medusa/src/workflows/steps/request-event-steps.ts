import { createStep, StepResponse } from "@medusajs/workflows-sdk"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"
import type { CreateChefEventInput, ChefEvent } from "../../modules/chef-event/types"

type GetTemplateProductInput = {
  productId: string
  partySize: string | number
}

type GetTemplateProductOutput = {
  product: any // Using any temporarily
  totalPrice: number
  pricePerPerson: number
}

export const getTemplateProductStep = createStep(
  "get-template-product",
  async ({ productId, partySize }: GetTemplateProductInput, { container }) => {
    const query = container.resolve("query")
    
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "*",
        "variants.*",
        "variants.prices.*"
      ],
      filters: {
        id: productId,
      },
    })

    const product = products[0]
    if (!product || !product.variants?.length || !product.variants[0].price_set) {
      throw new Error("Product, variants, or prices not found")
    }

    const totalPrice = Number(product.variants[0].price_set.calculated_price)
    
    return new StepResponse({
      product,
      totalPrice,
      pricePerPerson: totalPrice / Number(partySize)
    })
  }
)

export const createChefEventStep = createStep(
  "create-chef-event",
  async (input: CreateChefEventInput, { container }) => {
    const chefEventService = container.resolve(CHEF_EVENT_MODULE) as any
    const event = await chefEventService.create(input)
    return new StepResponse(event)
  }
)

// export const checkEventConflictsStep = createStep<
//   CheckEventConflictsInput,
//   boolean,
//   void
// >(
//   'check-event-conflicts',
//   async (data, { container }) => {
//     const chefEventService = container.resolve(CHEF_EVENT_MODULE) as any
//     const hasConflicts = await chefEventService.hasConflictingEvents(
//       data.requestedDate,
//       data.requestedTime
//     )
//     return new StepResponse(hasConflicts)
//   }
// )

// export const sendNotificationStep = createStep<
//   NotificationInput,
//   { success: boolean },
//   void
// >(
//   'send-notification',
//   async (data, { container }) => {
//     const notificationService = container.resolve('notification') as any
//     await notificationService.send('event-request', data)
//     return new StepResponse({ success: true })
//   }
// ) 