import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../../../../modules/chef-event"
import { DateTime } from "luxon"
import { CreateNotificationDTO } from "@medusajs/types"
import ChefEventService from "../../../../modules/chef-event/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

interface RequestEventBody {
  productId: string;
  requestedDate: string;
  requestedTime: string;
  partySize: number | string;
  eventType: string;
  locationType: string;
  locationAddress?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  productName?: string;
}

export async function POST(
  req: MedusaRequest<RequestEventBody>,
  res: MedusaResponse
): Promise<void> {
  const {
    productId,
    requestedDate,
    requestedTime,
    partySize,
    eventType,
    locationType,
    locationAddress,
    firstName,
    lastName,
    email,
    phone,
    notes,
    productName
  } = req.body;

  try {
    const notificationService = req.scope.resolve(Modules.NOTIFICATION);
    const chefEventService: ChefEventService = req.scope.resolve(CHEF_EVENT_MODULE);
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { data: [templateProduct] } = await query.graph({
      entity: "product",
      fields: ["id", "title", "variants.id", "variants.prices.*", "menu.id"],
      filters: {
        id: productId
      }
    });

    if (!templateProduct) {
      res.status(404).json({
        message: "Template product not found"
      });
      return;
    }

    const templateVariant = templateProduct.variants?.[0];
    if (!templateVariant || !templateVariant.prices?.length) {
      res.status(400).json({
        message: "Template product has no price information"
      });
      return;
    }

    const { data: existingEvents } = await query.graph({
      entity: "chef_event",
      fields: ["id", "status", "requestedDate", "requestedTime"],
      filters: {
        status: ["pending", "confirmed"],
        requestedDate,
        requestedTime
      }
    });
    let hasConflictingEvent = false;
    if (existingEvents && existingEvents.length > 0) {
      hasConflictingEvent = true;
    }

    const templatePrice = templateVariant.prices[0];
    const pricePerPerson = templatePrice.amount;
    const totalPrice = pricePerPerson * Number(partySize);

    // Format the date and time for display
    const formattedDate = DateTime.fromISO(requestedDate).toFormat('LLL d, yyyy');
    const formattedTime = DateTime.fromFormat(requestedTime, 'HH:mm').toFormat('h:mm a');

    // Get event type label
    const eventTypeMap: Record<string, string> = {
      cooking_class: "Chef's Cooking Class",
      plated_dinner: "Plated Dinner Service",
      buffet_style: "Buffet Style Service"
    };

    // Get location type label
    const locationTypeMap: Record<string, string> = {
      customer_location: "at Customer's Location",
      chef_location: "at Chef's Location"
    };

    // Create chef event record
    const chefEvent = await chefEventService.createChefEvents({
      status: "pending",
      requestedDate,
      requestedTime,
      partySize: Number(partySize),
      eventType,
      locationType,
      locationAddress: locationAddress || "",
      firstName,
      lastName,
      email,
      phone: phone || "",
      notes: notes || "",
      totalPrice,
      depositPaid: false,
      specialRequirements: "",
      estimatedDuration: 180,
      assignedChefId: "",
      templateProductId: templateProduct.id
    });

    console.log("CHEF EVENT CREATED", chefEvent);

    // Send notification to chef
    await notificationService.createNotifications({
      to: "pablo_3@icloud.com",
      channel: "email",
      template: "d-c693ecebe49048d88e46d4dc26d30a19",
      data: {
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone || 'No phone provided'
        },
        booking: {
          date: formattedDate,
          time: formattedTime,
          menu: productName || templateProduct.title,
          event_type: eventTypeMap[eventType],
          location_type: locationTypeMap[locationType],
          location_address: locationAddress || 'At chef\'s location',
          party_size: partySize,
          notes: notes || 'No special requests',
          price_per_person: (pricePerPerson / 100).toFixed(2),
          total_price: (totalPrice / 100).toFixed(2),
          currency_code: templatePrice.currency_code
        },
        event: {
          id: chefEvent.id,
          status: "pending",
          total_price: totalPrice,
          price_per_person: pricePerPerson,
          deposit_paid: false,
          conflict: hasConflictingEvent
        },
        acceptUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/accept?eventId=${chefEvent.id}`,
        rejectUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/reject?eventId=${chefEvent.id}`
      }
    } as CreateNotificationDTO);

    res.status(200).json({
      success: true,
      message: "Chef event request sent successfully",
      data: {
        requestId: chefEvent.id,
        status: "pending",
        customerName: `${firstName} ${lastName}`,
        eventDetails: {
          date: formattedDate,
          time: formattedTime,
          productName: productName || templateProduct.title
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send chef event request",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
