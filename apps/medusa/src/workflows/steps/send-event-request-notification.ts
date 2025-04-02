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
    console.log("SENDING DATA", data)

    await notificationService.createNotifications({
      to: data.customer.email,
      channel: "email",
      template: "d-c693ecebe49048d88e46d4dc26d30a19",
      data: {
        customer: {
          first_name: data.customer.firstName,
          last_name: data.customer.lastName,
          email: data.customer.email,
          phone: data.customer.phone || "Not provided"
        },
        booking: {
          date: formattedDate,
          time: formattedTime,
          menu: data.productName,
          event_type: eventTypeMap[data.chefEvent.eventType] || data.chefEvent.eventType,
          location_type: locationTypeMap[data.chefEvent.locationType] || data.chefEvent.locationType,
          location_address: data.chefEvent.locationAddress || "Not provided",
          party_size: data.chefEvent.partySize,
          notes: data.chefEvent.notes || "No special notes provided"
        },
        event: {
          status: "Pending",
          total_price: data.totalPrice.toFixed(2),
          conflict: data.hasConflictingEvent
        },

        // These URLs should be provided by your application

        acceptUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/${data.chefEvent.id}/accept`,

        rejectUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/${data.chefEvent.id}/reject`
      }
    } as CreateNotificationDTO)

    // Return the input data for compensation
    return new StepResponse<SendEventRequestNotificationStepInput, SendEventRequestNotificationStepInput>(
      data,
      data
    )
  },
  // Compensation function - send cancellation notification
  async (data: SendEventRequestNotificationStepInput, { container }) => {
    try {
      const notificationService = container.resolve(Modules.NOTIFICATION)
      await notificationService.createNotifications({
        to: data.customer.email,
        channel: "email",
        template: "event-request-cancelled",
        data: {
          customer: data.customer,
          event: {
            product_name: data.productName,
            formatted_date: DateTime.fromISO(data.chefEvent.requestedDate).toFormat('LLL d, yyyy'),
            formatted_time: DateTime.fromFormat(data.chefEvent.requestedTime, 'HH:mm').toFormat('h:mm a')
          }
        }
      } as CreateNotificationDTO)
      
      console.log("Successfully sent compensation notification", {
        email: data.customer.email
      })
    } catch (error) {
      console.error("Error sending compensation notification", {
        email: data.customer.email,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
) 