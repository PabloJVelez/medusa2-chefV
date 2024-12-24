import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../../../../modules/chef-event"
import { DateTime } from "luxon"
import { CreateNotificationDTO } from "@medusajs/types"
import ChefEventService from "../../../../modules/chef-event/service"

interface AcceptEventBody {
  eventId?: string;
}
enum ChefEventStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export async function GET(
  req: MedusaRequest<AcceptEventBody>,
  res: MedusaResponse
): Promise<void> {
  try {
    const eventId = req.query.eventId;

    if (!eventId) {
      res.status(400).json({
        message: "Event ID is required"
      });
      return;
    }

    const chefEventService: ChefEventService = req.scope.resolve(CHEF_EVENT_MODULE);
    const notificationService = req.scope.resolve(Modules.NOTIFICATION);
    const event = await chefEventService.retrieveChefEvent(eventId as string);

    if (!event) {
      res.status(404).json({
        message: "Event not found"
      });
      return;
    }
    const updatedEvent = await chefEventService.updateChefEvents({
      id: eventId as string,
      status: ChefEventStatus.CONFIRMED
    });

    const formattedDate = DateTime.fromISO(event.requestedDate.toISOString()).toFormat('LLL d, yyyy');
    const formattedTime = DateTime.fromFormat(event.requestedTime, 'HH:mm').toFormat('h:mm a');

    await notificationService.createNotifications({
      to: event.email,
      channel: "email",
      template: "d-f077d97e69aa43bfa690f88dd372a779", 
      data: {
        customer: {
          first_name: event.firstName,
          last_name: event.lastName,
          email: event.email,
          phone: event.phone || 'No phone provided'
        },
        booking: {
          date: formattedDate,
          time: formattedTime,
          status: "Accepted",
          event_type: event.eventType,
          location_type: event.locationType,
          location_address: event.locationAddress || "Chef's Location",
          party_size: event.partySize,
          total_price: event.totalPrice,
          deposit_required: event.totalPrice * 0.3 
        },
        payment: {
          deposit_amount: event.totalPrice * 0.3,
          payment_link: `${process.env.STORE_FRONT}/events/${event.id}`
        }
      }
    } as CreateNotificationDTO);

    res.status(200).json({
      message: "Event accepted successfully",
      event: updatedEvent
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to accept event",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export const config = {
  bodyParser: {
    json: {
      limit: '1mb'
    }
  }
}

export const AUTHENTICATE = false;