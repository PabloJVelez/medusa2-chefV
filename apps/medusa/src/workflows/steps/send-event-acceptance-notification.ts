import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { DateTime } from "luxon"
import { CreateNotificationDTO } from "@medusajs/types"

type SendEventAcceptanceNotificationStepInput = {
  chefEvent: any
  eventProduct: any
}

export const sendEventAcceptanceNotificationStep = createStep(
  "send-event-acceptance-notification",
  async (data: SendEventAcceptanceNotificationStepInput, { container }) => {
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
      to: data.chefEvent.email,
      channel: "email",
      template: "d-c693ecebe49048d88e46d4dc26d30a19",
      data: {
        customer: {
          first_name: data.chefEvent.firstName,
          last_name: data.chefEvent.lastName,
          email: data.chefEvent.email,
          phone: data.chefEvent.phone || 'No phone provided'
        },
        booking: {
          date: formattedDate,
          time: formattedTime,
          menu: data.eventProduct.title,
          event_type: eventTypeMap[data.chefEvent.eventType],
          location_type: locationTypeMap[data.chefEvent.locationType],
          location_address: data.chefEvent.locationAddress || 'At chef\'s location',
          party_size: data.chefEvent.partySize,
          notes: data.chefEvent.notes || 'No special requests',
          price_per_person: (data.chefEvent.totalPrice / data.chefEvent.partySize / 100).toFixed(2),
          total_price: (data.chefEvent.totalPrice / 100).toFixed(2),
          currency_code: "usd"
        },
        event: {
          id: data.chefEvent.id,
          status: "confirmed",
          total_price: data.chefEvent.totalPrice,
          price_per_person: data.chefEvent.totalPrice / data.chefEvent.partySize,
          deposit_paid: data.chefEvent.depositPaid,
          conflict: false
        },
        acceptUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/accept?eventId=${data.chefEvent.id}`,
        rejectUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/reject?eventId=${data.chefEvent.id}`
      }
    } as CreateNotificationDTO)

    return new StepResponse(true, true)
  }
) 