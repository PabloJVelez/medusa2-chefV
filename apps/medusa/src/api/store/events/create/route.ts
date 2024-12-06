import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { linkEventToProductWorkflow } from "../../../../workflows/link-event-to-product"
import { Modules } from "@medusajs/framework/utils"
import { DateTime } from "luxon"
import { CreateProductDTO, CreateProductOptionDTO, CreateProductVariantDTO, INotificationModuleService, CreateNotificationDTO } from "@medusajs/types"


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
    // Get the template product
    const templateProduct = await productService.retrieveProduct(productId);
    console.log("TEMPLATE PRODUCT RETRIEVED", templateProduct.id);

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
    const options: CreateProductOptionDTO[] = templateProduct.options?.map(option => ({
      title: option.title,
      values: option.values.map(value => value.value)
    })) || [];

    // Calculate inventory based on party size
    const inventoryQuantity = Math.ceil(Number(partySize) / 4); // 1 unit per 4 guests

    // Create the product DTO
    const productDTO: CreateProductDTO = {
      title: newProductTitle,
      description: newProductDescription,
      status: 'published',
      collection_id: templateProduct.collection_id,
      type_id: templateProduct.type_id,
      options,
      variants: [{
        title: templateProduct.variants?.[0]?.title || 'Default Variant',
      }],
      metadata: {
        template_product_id: templateProduct.id,
        event_type: eventType,
        event_date: requestedDate,
        event_time: requestedTime,
      }
    };

    // Create new product for this specific event
    const [createdProduct] = await productService.createProducts([productDTO]);

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

    // Send notification to chef
    await notificationService.createNotifications({
      to: email,
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
        }
      }
    } as CreateNotificationDTO);

    // Also send a copy to the chef
    await notificationService.createNotifications({
      to: "pabsv003@gmail.com",
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
        }
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