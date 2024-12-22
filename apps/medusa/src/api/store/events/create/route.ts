import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { linkEventToProductWorkflow } from "../../../../workflows/link-event-to-product"
import { Modules } from "@medusajs/framework/utils"
import { DateTime } from "luxon"
import { CreateProductDTO, CreateProductOptionDTO, CreateProductVariantDTO, INotificationModuleService, CreateNotificationDTO, ProductDTO, CreateProductWorkflowInputDTO } from "@medusajs/types"
import { ProductStatus } from "@medusajs/utils"
import { Menu } from "../../../../modules/menu/models/menu"
import {ContainerRegistrationKeys} from "@medusajs/framework/utils"
import { linkMenuToEventProductWorkflow, LinkMenuToEventProductWorkflowInput } from "../../../../workflows/link-menu-to-eventProduct"
import { linkSalesChannelsToStockLocationWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows"

import { MENU_MODULE } from "src/modules/menu"

interface CreateChefEventBody {
  productId: string
  requestedDate: string
  requestedTime: string
  partySize: number | string
  eventType: string
  locationType: string
  locationAddress?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  productName?: string
}

interface ExtendedProductDTO extends ProductDTO {
  menu?: typeof Menu
}

export async function POST(
  req: MedusaRequest<CreateChefEventBody>,
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
  } = req.body

  try {
    const productService = req.scope.resolve(Modules.PRODUCT);
    const notificationService = req.scope.resolve(Modules.NOTIFICATION);
    const inventoryService = req.scope.resolve(Modules.INVENTORY);
    const stockLocationModuleService = req.scope.resolve(Modules.STOCK_LOCATION)
    const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL)
    const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const {data: [templateProduct]} = await query.graph({
      entity: "product",
      fields: ["id", "title", "description", "menu.*", "menu.courses.*", "menu.courses.dishes.*"],
      filters: {
        id: productId
      }
    })


    if (!templateProduct) {
      res.status(404).json({
        message: "Template product not found"
      });
      return;
    }

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

    // Create new product title and description
    const newProductTitle = `${productName || templateProduct.title} - ${eventTypeMap[eventType]} (${formattedDate})`;
    const newProductDescription = `
${templateProduct.description || ''}

Event Details:
• Date: ${formattedDate}
• Time: ${formattedTime}
• Type: ${eventTypeMap[eventType]}
• Location: ${locationTypeMap[locationType]}
${locationAddress ? `• Address: ${locationAddress}` : ''}
• Party Size: ${partySize} guests

Customer Information:
• Name: ${firstName} ${lastName}
• Email: ${email}
${phone ? `• Phone: ${phone}` : ''}
${notes ? `\nSpecial Notes:\n${notes}` : ''}
    `.trim();

    // Convert product options to CreateProductOptionDTO format
    //TODO: we only need one option for the event product which will be the event type
    

    const options: CreateProductOptionDTO[] = [{
      title: "Event Type",
      values: ["Chef Event"]
    }];
    // Create the product input
    const productInput: CreateProductWorkflowInputDTO = {
      title: newProductTitle,
      description: newProductDescription,
      status: ProductStatus.PUBLISHED,
      collection_id: templateProduct.collection_id,
      type_id: templateProduct.type_id,
      options: [{
        title: "Event Type",
        values: ["Chef Event"]
      }],
      variants: [{
        title: 'Chef Event',
        manage_inventory: true,
        allow_backorder: false,
        options: {
          "Event Type": "Chef Event"
        },
        prices: [{
          amount: 1800,
          currency_code: "USD"
        }]
      }],
      metadata: {
        template_product_id: templateProduct.id,
        event_type: eventType,
        event_date: requestedDate,
        event_time: requestedTime,
        party_size: partySize
      }
    };

    console.log("PRODUCT DTO ====>>>", productInput)

    // Use createProductsWorkflow with correct input structure
    const { result: [createdProduct] } = await createProductsWorkflow(req.scope).run({
      input: {
        products: [productInput]
      }
    });

    const variantId = createdProduct.variants?.[0]?.id;

    // Create a unique location ID for this event
    const eventLocationId = `loc_event_${createdProduct.id}`;

    // First create the inventory item
    const [inventoryItem] = await inventoryService.createInventoryItems([{
      sku: `${createdProduct.id}-${variantId}`
    }]);

    // Then create inventory level with the location, using party size as the quantity
    await inventoryService.createInventoryLevels({
      inventory_item_id: inventoryItem.id,
      location_id: eventLocationId,
      stocked_quantity: Number(partySize)  // Set to party size to track guest capacity
    });

    // Link the inventory item to the variant using remote link
    await remoteLink.create({
      [Modules.PRODUCT]: {
        variant_id: variantId
      },
      [Modules.INVENTORY]: {
        inventory_item_id: inventoryItem.id
      }
    });

    const salesChannel = await salesChannelModuleService.listSalesChannels()
    console.log("SALES CHANNEL #######################", salesChannel)

    const stockLocation = await stockLocationModuleService.listStockLocations({})
    console.log("STOCK LOCATION #######################", stockLocation)

    const test = await linkSalesChannelsToStockLocationWorkflow(req.scope).run({
      input: {
        id: stockLocation[0].id,
        add: [salesChannel[0].id]
      }
    })

    console.log("TEST RESULT #######################", test)

    // Link the menu to the new product
    await linkMenuToEventProductWorkflow(req.scope).run({
      input: {
        productId: createdProduct.id as string,
        menuId: templateProduct.menu?.id as string
      }
    })

    const workflowInput = {
      input: {
        product: createdProduct,
        chefEvent: {
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
          totalPrice: 1800,
          depositPaid: false,
          specialRequirements: "",
          estimatedDuration: 180,
          assignedChefId: ""
        }
      }
    };
    console.log("GOING TO RUN WORKFLOW")
    const { result } = await linkEventToProductWorkflow(req.scope).run(workflowInput)

    console.log("SENDING NOTIFICATION")
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
          notes: notes || 'No special requests'
        },
        event: {
          id: result.chefEvent.id,
          status: "pending",
          total_price: result.chefEvent.totalPrice,
          deposit_paid: false
        },
        acceptUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/accept?eventId=${result.chefEvent.id}`,
        rejectUrl: `${process.env.ADMIN_BACKEND_URL}/admin/events/reject?eventId=${result.chefEvent.id}`
      }
    } as CreateNotificationDTO);

    res.status(200).json({
      result,
      eventProduct: createdProduct,
      message: "Chef event created successfully"
    })
  } catch (error) {
    console.error("Error creating chef event:", error)
    res.status(500).json({
      message: "Failed to create chef event",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export const config = {
  bodyParser: {
    json: {
      limit: '1mb'
    }
  }
}