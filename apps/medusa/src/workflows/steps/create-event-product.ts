// import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
// import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
// import { DateTime } from "luxon"

// type CreateEventProductStepInput = {
//   chefEvent: any
// }

// export const createEventProductStep = createStep(
//   "create-event-product",
//   async (data: CreateEventProductStepInput, { container }) => {
//     const query = container.resolve(ContainerRegistrationKeys.QUERY)
//     const { data: [eventType] } = await query.graph({
//       entity: "product_type",
//       fields: ["id"],
//       filters: {
//         value: "event"
//       }
//     })

//     if (!eventType) {
//       throw new Error("Event product type not found")
//     }

//     // Format date and time
//     const formattedDate = DateTime.fromISO(data.chefEvent.requestedDate).toFormat('LLL d, yyyy')
//     const formattedTime = DateTime.fromFormat(data.chefEvent.requestedTime, 'HH:mm').toFormat('h:mm a')

//     // Get event type label
//     const eventTypeMap: Record<string, string> = {
//       cooking_class: "Chef's Cooking Class",
//       plated_dinner: "Plated Dinner Service",
//       buffet_style: "Buffet Style Service"
//     }

//     // Create the product
//     const { data: product } = await query.graph({
//       entity: "product",
//       fields: ["*"],
//       data: {
//         title: `${eventTypeMap[data.chefEvent.eventType]} - ${formattedDate}`,
//         description: `
// Event Details:
// • Date: ${formattedDate}
// • Time: ${formattedTime}
// • Type: ${eventTypeMap[data.chefEvent.eventType]}
// • Location: ${data.chefEvent.locationType === 'customer_location' ? 'at Customer\'s Location' : 'at Chef\'s Location'}
// ${data.chefEvent.locationAddress ? `• Address: ${data.chefEvent.locationAddress}` : ''}
// • Party Size: ${data.chefEvent.partySize} guests
// • Total Price: ${data.chefEvent.totalPrice / 100} USD
//         `.trim(),
//         status: "published",
//         options: [{
//           title: "Event Type",
//           values: ["Chef Event"]
//         }],
//         variants: [{
//           title: 'Chef Event Ticket',
//           manage_inventory: true,
//           allow_backorder: false,
//           sku: `EVENT-${Date.now()}`,
//           prices: [{
//             amount: data.chefEvent.totalPrice / data.chefEvent.partySize,
//             currency_code: "usd"
//           }]
//         }],
//         type_id: eventType.id,
//         metadata: {
//           event_type: data.chefEvent.eventType,
//           event_date: data.chefEvent.requestedDate,
//           event_time: data.chefEvent.requestedTime,
//           party_size: data.chefEvent.partySize,
//           is_event_product: true
//         },
//         additional_data: {
//           chefEvent: {
//             status: "confirmed",
//             requestedDate: data.chefEvent.requestedDate,
//             requestedTime: data.chefEvent.requestedTime,
//             partySize: data.chefEvent.partySize,
//             eventType: data.chefEvent.eventType,
//             locationType: data.chefEvent.locationType,
//             locationAddress: data.chefEvent.locationAddress,
//             firstName: data.chefEvent.firstName,
//             lastName: data.chefEvent.lastName,
//             email: data.chefEvent.email,
//             phone: data.chefEvent.phone,
//             notes: data.chefEvent.notes,
//             totalPrice: data.chefEvent.totalPrice,
//             depositPaid: data.chefEvent.depositPaid,
//             specialRequirements: data.chefEvent.specialRequirements,
//             estimatedDuration: data.chefEvent.estimatedDuration
//           },
//           product_details: {
//             type: "event"
//           }
//         }
//       }
//     })

//     return new StepResponse(product, product)
//   }
// ) 