import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/utils"
import { CHEF_EVENT_MODULE } from "../../../../modules/chef-event"
import ChefEventModuleService from "../../../../modules/chef-event/service.js"
import { AdminChefEventDTO } from "src/sdk/admin/admin-chef-events"
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

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const data = req.body as AdminChefEventDTO
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: event } = await query.graph({
    entity: "chef_event",
    fields: ["*"],
    filters: { id: { $eq: id } }
  })

  if (!event) {
    res.status(404).json({
      message: "Event not found"
    })
    return
  }

  const chefEventService: ChefEventModuleService = req.scope.resolve(CHEF_EVENT_MODULE)
  const updatedEvent = await chefEventService.updateChefEvents({
    ...data,
    requestedDate: data.requestedDate ? new Date(data.requestedDate) : undefined
  })

  res.status(200).json({
    event: updatedEvent
  })
}   
