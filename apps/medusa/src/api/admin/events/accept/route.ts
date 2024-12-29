import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../../../../modules/chef-event"
import { DateTime } from "luxon"
import { CreateNotificationDTO } from "@medusajs/types"
import ChefEventService from "../../../../modules/chef-event/service"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { linkMenuToEventProductWorkflow } from "../../../../workflows/link-menu-to-eventProduct"
import { linkEventToProductWorkflow } from "../../../../workflows/link-event-to-product"
import { ProductStatus } from "@medusajs/utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"

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
  //TODO: THIS ALL NEEDS TO BE REFACTORED TO BE A WORKFLOW
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

    const inventoryService = req.scope.resolve(Modules.INVENTORY);
    const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL)
    const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const defaultSalesChannels = await salesChannelModuleService.listSalesChannels({
      name: 'Default Sales Channel',
    });

    if (!defaultSalesChannels.length) {
      throw new Error("Default sales channel not found");
    }

    const defaultSalesChannel = defaultSalesChannels[0];

    const {data: [templateProduct]} = await query.graph({
      entity: "product",
      fields: ["id", "title", "description", "menu.*", "menu.courses.*", "menu.courses.dishes.*", "variants.id", "variants.prices.*"],
      filters: {
        id: event.templateProductId
      }
    })

    const formattedDate = DateTime.fromISO(event.requestedDate.toISOString()).toFormat('LLL d, yyyy');
    const formattedTime = DateTime.fromFormat(event.requestedTime, 'HH:mm').toFormat('h:mm a');
    const eventTypeMap = {
      cooking_class: "Chef's Cooking Class",
      plated_dinner: "Plated Dinner Service",
      buffet_style: "Buffet Style Service"
    };
    const newProductTitle = `${templateProduct.title} - ${eventTypeMap[event.eventType]} (${formattedDate})`;
    const newProductDescription = `
${templateProduct.description || ''}

Event Details:
• Date: ${formattedDate}
• Time: ${formattedTime}
• Type: ${eventTypeMap[event.eventType]}
• Location: ${event.locationType === 'customer_location' ? 'at Customer\'s Location' : 'at Chef\'s Location'}
${event.locationAddress ? `• Address: ${event.locationAddress}` : ''}
• Party Size: ${event.partySize} guests
• Total Price: ${event.totalPrice / 100} ${templateProduct.variants[0].prices[0].currency_code}
    `.trim();

    const productInput = {
      title: newProductTitle,
      description: newProductDescription,
      status: ProductStatus.PUBLISHED,
      options: [{
        title: "Event Type",
        values: ["Chef Event"]
      }],
      variants: [{
        title: 'Chef Event Ticket',
        manage_inventory: true,
        allow_backorder: false,
        sku: `EVENT-${event.id}`,
        prices: [{
          amount: event.totalPrice / event.partySize,
          currency_code: templateProduct.variants[0].prices[0].currency_code
        }]
      }],
      metadata: {
        template_product_id: templateProduct.id,
        event_type: event.eventType,
        event_date: event.requestedDate,
        event_time: event.requestedTime,
        party_size: event.partySize,
        is_event_product: true
      },
      sales_channels: [{ id: defaultSalesChannel.id }],
    };
    const { result: [createdProduct] } = await createProductsWorkflow(req.scope).run({
      input: { products: [productInput] }
    });
    
    const { result: [eventLocation] } = await createStockLocationsWorkflow(req.scope).run({
      input: {
        locations: [{
          name: `Event Location - ${newProductTitle}`,
        }]
      }
    });

    await linkSalesChannelsToStockLocationWorkflow(req.scope).run({
      input: {
        id: eventLocation.id,
        add: [defaultSalesChannel.id],
      }
    });

    const [inventoryItem] = await inventoryService.listInventoryItems({
      sku: `EVENT-${event.id}`
    });

    await inventoryService.createInventoryLevels([{
      inventory_item_id: inventoryItem.id,
      location_id: eventLocation.id,
      stocked_quantity: event.partySize
    }]);

    await remoteLink.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: eventLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: 'manual_manual',
      },
    });

    
    await linkMenuToEventProductWorkflow(req.scope).run({
      input: {
        productId: createdProduct.id,
        menuId: templateProduct.menu?.id
      }
    });
    const chefEvent = {
      ...event,
      requestedDate: event.requestedDate.toISOString(),
      requestedTime: event.requestedTime,
      templateProductId: templateProduct.id,
      status: "confirmed",
      depositPaid: false,
      specialRequirements: event.specialRequirements || "",
    }

    try {
      const result = await linkEventToProductWorkflow(req.scope).run({
        input: {
          productId: createdProduct.id,
          chefEventId: chefEvent.id
        }
      });
    } catch (error) {
      throw error;
    }
    const updatedEvent = await chefEventService.updateChefEvents({
      id: eventId as string,
      status: ChefEventStatus.CONFIRMED
    });

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