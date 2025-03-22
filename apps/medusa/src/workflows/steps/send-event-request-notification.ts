import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { DateTime } from "luxon"
import { CreateNotificationDTO } from "@medusajs/types"

type SendEventRequestNotificationStepInput = {
  chefEvent: any
  templateProduct: any
  pricePerPerson: number
  totalPrice: number
  hasConflictingEvent: boolean
  customer: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  productName?: string
}

export const sendEventRequestNotificationStep = createStep(
  "send-event-request-notification",
  async (data: SendEventRequestNotificationStepInput, { container }) => {
    const notificationService = container.resolve(Modules.NOTIFICATION)

    // Format the date and time for display
    const formattedDate = DateTime.fromISO(data.chefEvent.requestedDate).toFormat('LLL d, yyyy')
    const formattedTime = DateTime.fromFormat(data.chefEvent.requestedTime, 'HH:mm').toFormat('h:mm a')

    // Get event type label
    const eventTypeMap: Record<string, string> = {
      cooking_class: "Chef's Cooking Class",
      plated_dinner: "Plated Dinner Service",
      buffet_style: "Buffet Style Service"
    }

    // Get location type label
    const locationTypeMap: Record<string, string> = {
      customer_location: "at Customer's Location",
      chef_location: "at Chef's Location"
    }

    await notificationService.createNotifications({
      to: "pablo_3@icloud.com",
      channel: "email",
      template: "d-c693ecebe49048d88e46d4dc26d30a19",
      data: {
        customer: {
          first_name: data.customer.firstName,
          last_name: data.customer.lastName,
          email: data.customer.email,
          phone: data.customer.phone || 'No phone provided'
        },
        booking: {
          date: formattedDate,
          time: formattedTime,
          menu: data.productName || data.templateProduct.title,
          event_type: eventTypeMap[data.chefEvent.eventType],
          location_type: locationTypeMap[data.chefEvent.locationType],
          location_address: data.chefEvent.locationAddress || 'At chef\'s location',
          party_size: data.chefEvent.partySize,
          notes: data.chefEvent.notes || 'No special requests',
          price_per_person: (data.pricePerPerson / 100).toFixed(2),
          total_price: (data.totalPrice / 100).toFixed(2),
          currency_code: "usd"
        },
        event: {
          id: data.chefEvent.id,
          status: "pending",
          total_price: data.totalPrice,
          price_per_person: data.pricePerPerson,
          deposit_paid: false,
          conflict: data.hasConflictingEvent
        },
        acceptUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/accept?eventId=${data.chefEvent.id}`,
        rejectUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/reject?eventId=${data.chefEvent.id}`
      }
    } as CreateNotificationDTO)

    return new StepResponse(true, true)
  }
) 