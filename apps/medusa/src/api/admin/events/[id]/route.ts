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

  const { data: chefProductEvent } = await query.graph({
    entity: "chef_event",
    fields: [
      "*",
      "product.id"
    ],
    filters: {
      id: req.params.id
    }
  })

  if (!chefProductEvent) {
    return res.status(404).json({ message: "Event not found" });
  }

  const fullChefEvent = {
    id: chefProductEvent[0].id,
    status: chefProductEvent[0].status,
    date: chefProductEvent[0].requestedDate,
    time: chefProductEvent[0].requestedTime,
    location: chefProductEvent[0].locationAddress,
    partySize: chefProductEvent[0].partySize,
    eventType: chefProductEvent[0].eventType,
    notes: chefProductEvent[0].notes,
    product_id: chefProductEvent[0].product.id
  }

  res.json({ chefEvent: fullChefEvent })
}

export const AUTHENTICATE = false;