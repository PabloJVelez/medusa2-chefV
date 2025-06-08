import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"
import { CreateNotificationDTO } from "@medusajs/types"
import { DateTime } from "luxon"
import type { ChefEvent } from "../modules/chef-event/types"

type EventData = {
  chefEvent: ChefEvent
  templateProduct: {
    id: string
    title: string
  }
  pricePerPerson: number
  totalPrice: number
}

export default async function chefEventRequestedHandler({
  event: { data },
  container,
}: SubscriberArgs<EventData>) {
  console.log("CHEF EVENT SUBSCRIBER RUNNING WITH DATA --->", data)
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
        phone: data.chefEvent.phone || "Not provided"
      },
      booking: {
        date: formattedDate,
        time: formattedTime,
        menu: data.templateProduct.title,
        event_type: eventTypeMap[data.chefEvent.eventType] || data.chefEvent.eventType,
        location_type: locationTypeMap[data.chefEvent.locationType] || data.chefEvent.locationType,
        location_address: data.chefEvent.locationAddress || "Not provided",
        party_size: data.chefEvent.partySize,
        notes: data.chefEvent.notes || "No special notes provided"
      },
      event: {
        status: "Pending",
        total_price: data.chefEvent.totalPrice.toFixed(2),
        conflict: false // This can be handled separately if needed
      },
      acceptUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/${data.chefEvent.id}/accept`,
      rejectUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/${data.chefEvent.id}/reject`
    }
  } as CreateNotificationDTO)
}

export const config: SubscriberConfig = {
  event: "chef-event.requested",
} 