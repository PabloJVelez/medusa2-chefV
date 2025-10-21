import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { MedusaError } from "@medusajs/framework/utils"
import LandingLeadModuleService from "../../../../modules/landing-lead/service"
import { LANDING_LEAD_MODULE } from "../../../../modules/landing-lead"

const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'unsubscribed', 'spam']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
})

/**
 * GET /admin/landing-leads/:id
 * Get a single lead
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const landingLeadModuleService: LandingLeadModuleService = req.scope.resolve(LANDING_LEAD_MODULE)
  const { id } = req.params

  try {
    const lead = await landingLeadModuleService.retrieveLandingLead(id)
    return res.json({ lead })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Lead with id ${id} not found`
    )
  }
}

/**
 * POST /admin/landing-leads/:id
 * Update a lead
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const landingLeadModuleService: LandingLeadModuleService = req.scope.resolve(LANDING_LEAD_MODULE)
  const { id } = req.params

  try {
    const validatedData = updateLeadSchema.parse(req.body)
    
    const updatedLead = await landingLeadModuleService.updateLandingLeads({
      id,
      ...validatedData,
      lastContactedAt: validatedData.status === 'contacted' 
        ? new Date() 
        : undefined,
    })

    return res.json({ lead: updatedLead })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error.errors.map(e => e.message).join(", ")
      )
    }
    throw error
  }
}

/**
 * DELETE /admin/landing-leads/:id
 * Delete a lead
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const landingLeadModuleService: LandingLeadModuleService = req.scope.resolve(LANDING_LEAD_MODULE)
  const { id } = req.params

  try {
    await landingLeadModuleService.deleteLandingLeads(id)
    return res.json({ success: true, id })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Lead with id ${id} not found`
    )
  }
}
