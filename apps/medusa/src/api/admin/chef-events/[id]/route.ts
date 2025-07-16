import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { updateChefEventWorkflow } from "../../../../workflows/update-chef-event"
import { deleteChefEventWorkflow } from "../../../../workflows/delete-chef-event"
import { CHEF_EVENT_MODULE } from "../../../../modules/chef-event"

const updateChefEventSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  requestedDate: z.string().optional(),
  requestedTime: z.string().optional(),
  partySize: z.number().min(1).max(50).optional(),
  eventType: z.enum(['cooking_class', 'plated_dinner', 'buffet_style']).optional(),
  templateProductId: z.string().optional(),
  locationType: z.enum(['customer_location', 'chef_location']).optional(),
  locationAddress: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  totalPrice: z.number().optional(),
  depositPaid: z.boolean().optional(),
  specialRequirements: z.string().optional(),
  estimatedDuration: z.number().optional()
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const chefEventModuleService = req.scope.resolve(CHEF_EVENT_MODULE)
  const { id } = req.params
  
  const chefEvent = await chefEventModuleService.retrieveChefEvent(id)
  
  if (!chefEvent) {
    return res.status(404).json({ message: "Chef event not found" })
  }
  
  res.json({ chefEvent })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const validatedBody = updateChefEventSchema.parse(req.body)
  
  const { result } = await updateChefEventWorkflow(req.scope).run({
    input: {
      id,
      ...validatedBody
    }
  })
  
  res.json({ chefEvent: result.chefEvent })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  
  const { result } = await deleteChefEventWorkflow(req.scope).run({
    input: { id }
  })
  
  res.json({ deleted: result.result.deleted })
} 