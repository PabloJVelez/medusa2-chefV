// import {
//   MedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework/http"
// import {
//   ContainerRegistrationKeys,
// } from "@medusajs/framework/utils"

// export async function GET(
//   req: MedusaRequest,
//   res: MedusaResponse
// ) {
//   const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
//   console.log("RUNNING EVENTS ROUTE")

//   const { data: products } = await query.graph({
//     entity: "product",
//     fields: [
//       "*",
//       "product_details.*"
//     ]
//   })


//   if (!products) {
//     return res.status(404).json({ message: "Products not found" });
//   }

//   //console.log("PRODUCTS", products)
//   const menuProducts = products.filter((product) => product.product_details !== undefined)
//   console.log("MENU PRODUCTS", menuProducts)
//   res.json({ products })
// }

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { DateTime } from "luxon"
import { CreateNotificationDTO } from "@medusajs/types"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { linkMenuToEventProductWorkflow } from "../../../../../workflows/link-menu-to-event-product"
import { linkEventToProductWorkflow } from "../../../../../workflows/link-event-to-product"
import { ProductStatus } from "@medusajs/utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"
import { updateChefEventWorkflow } from "../../../../../workflows/update-chef-event"
import { acceptEventWorkflow } from "../../../../../workflows/accept-event"

interface AcceptEventBody {
  eventId: string
  assignedChefId: string
}

enum ChefEventStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  //TODO: THIS ALL NEEDS TO BE REFACTORED TO BE A WORKFLOW
  console.log("ACCEPT EVENT STARTING")
  try {
    const eventId = req.params.id;
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    if (!eventId) {
      res.status(400).json({
        message: "Event ID is required"
      });
      return;
    }

    const notificationService = req.scope.resolve(Modules.NOTIFICATION);
    const { data: [event] } = await query.graph({
      entity: "chef_event",
      fields: ["*"],
      filters: {
        id: eventId as string
      }
    })
    


    if (!event) {
      res.status(404).json({
        message: "Event not found"
      });
      return;
    }

    const inventoryService = req.scope.resolve(Modules.INVENTORY);
    const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL)
    const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);
    

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
    console.log("MADE IT HERE 2")

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
      //TODO: Query the product type id from the product type service instead of hardcoding it
      type: "ptyp_01JPKEQ001TBD3TDT1K7G3PPBX",
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

    const updatedEvent = await updateChefEventWorkflow(req.scope).run({
      input: {
        chefEventId: chefEvent.id,
        status: ChefEventStatus.CONFIRMED
      }
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
      error: error.message
    });
  }
}



export const AUTHENTICATE = false;