import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: event } = await query.graph({
    entity: "chef_event",
    fields: ["*"],
    filters: {
      id: { $eq: id }
    }
  })

  if (!event || event.length === 0) {
    res.status(404).json({
      message: "Event not found"
    })
    return
  }

  res.status(200).json({
    event: event[0]
  })
}
