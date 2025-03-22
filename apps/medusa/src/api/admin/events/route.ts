import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: events } = await query.graph({
      entity: "chef_event",
      fields: ["*"],
    })

    if (!events) {
      res.status(404).json({
        message: "Event not found"
      });
      return;
    }

    res.status(200).json({
      events
    });
}