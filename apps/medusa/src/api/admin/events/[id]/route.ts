import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryModuleService = req.scope.resolve(Modules.INVENTORY)

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
  const { data: product } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "description",
      "handle",
      "thumbnail",
      "status",
      "variants.*",
      "options.*",
      "images.*",
      "collection_id",
      "profile_id",
      "type_id",
      "type.*",
      "tags.*",
      "discountable",
      "external_id",
      "sales_channels.*",
      "is_giftcard",
      "weight",
      "length",
      "height",
      "width",
      "hs_code",
      "origin_country",
      "mid_code",
      "material",
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


  //TODO: Apply this fix to lambdacurry starter
  const inventoryItem = await inventoryModuleService.listInventoryItems({
    sku: `${chefEvent[0].product.id}-${product[0].variants[0].id}`
  })

  const inventoryLevel = await inventoryModuleService.listInventoryLevels({
    inventory_item_id: inventoryItem[0].id
  })

  product[0].variants[0].inventory_quantity = inventoryLevel[0].stocked_quantity

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