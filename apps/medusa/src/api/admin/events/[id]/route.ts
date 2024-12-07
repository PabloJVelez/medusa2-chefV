import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get the chef event with all necessary fields
  const { data: chefEvent } = await query.graph({
    entity: "chef_event",
    fields: [
      "*",
      "product.id"
    ],
    filters: {
      id: req.params.id
    }
  })

  if (!chefEvent) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Get the product with all menu details
  const { data: product } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "description",
      "handle",
      "thumbnail",
      "status",
      "collection_id",
      "created_at",
      "updated_at",
      "deleted_at",
      "metadata",
      "menu.id",
      "menu.name",
      "menu.courses.id",
      "menu.courses.name",
      "menu.courses.dishes.id",
      "menu.courses.dishes.name",
      "menu.courses.dishes.description"
    ],
    filters: {
      id: chefEvent[0].product.id
    }
  })

  // Transform the data to match the frontend expectations
  const fullChefEvent = {
    id: chefEvent[0].id,
    status: chefEvent[0].status,
    date: chefEvent[0].date,
    time: chefEvent[0].time,
    location: chefEvent[0].location,
    partySize: chefEvent[0].party_size,
    eventType: chefEvent[0].event_type,
    notes: chefEvent[0].notes,
    customer: chefEvent[0].customer ? {
      firstName: chefEvent[0].customer.first_name,
      lastName: chefEvent[0].customer.last_name,
      email: chefEvent[0].customer.email,
      phone: chefEvent[0].customer.phone,
    } : undefined,
    product: product[0]
  }

  res.json({ chefEvent: fullChefEvent })
}

export const AUTHENTICATE = false;