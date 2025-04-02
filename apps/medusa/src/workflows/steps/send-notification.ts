// import { createStep, StepResponse } from "@medusajs/workflows-sdk"
// import type { ChefEvent } from "../../modules/chef-event/types"

// type NotificationInput = {
//   chefEvent: ChefEvent
//   templateProduct: any
//   pricePerPerson: number
//   totalPrice: number
//   hasConflictingEvent: boolean
//   customer: {
//     firstName: string
//     lastName: string
//     email: string
//     phone?: string
//   }
//   productName?: string
// }

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