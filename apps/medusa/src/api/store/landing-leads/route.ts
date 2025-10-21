import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { MedusaError } from "@medusajs/framework/utils"
import LandingLeadModuleService from "../../../modules/landing-lead/service"
import { LANDING_LEAD_MODULE } from "../../../modules/landing-lead"

const createLandingLeadSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  interestedIn: z.array(z.string()).optional(),
  source: z.string().default('landing_page'),
  landingPage: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  referrer: z.string().optional(),
})

type CreateLandingLeadInput = z.infer<typeof createLandingLeadSchema>

/**
 * POST /store/landing-leads
 * Create a new landing page lead
 */
export async function POST(
  req: MedusaRequest<CreateLandingLeadInput>,
  res: MedusaResponse
) {
  const landingLeadModuleService: LandingLeadModuleService = req.scope.resolve(LANDING_LEAD_MODULE)
  const eventBusService = req.scope.resolve("eventBusModuleService")

  try {
    // Validate request body
    const validatedData = createLandingLeadSchema.parse(req.body)

    // Check if lead already exists
    const existingLead = await landingLeadModuleService.findByEmail(
      validatedData.email
    )

    if (existingLead) {
      // Update existing lead with new information
      const updatedLead = await landingLeadModuleService.updateLandingLeads({
        id: existingLead.id,
        ...validatedData,
        followUpCount: existingLead.followUpCount,
      })

      // Emit event for existing lead update
      await eventBusService.emit("landing_lead.updated", {
        id: updatedLead.id,
        email: updatedLead.email,
        isReturning: true,
      })

      return res.status(200).json({
        lead: updatedLead,
        message: "Lead updated successfully",
      })
    }

    // Create new lead
    const lead = await landingLeadModuleService.createLandingLeads({
      ...validatedData,
      status: 'new',
      followUpCount: 0,
    })

    // Emit event for new lead
    await eventBusService.emit("landing_lead.created", {
      id: lead.id,
      email: lead.email,
      source: lead.source,
      utmSource: lead.utmSource,
      utmCampaign: lead.utmCampaign,
    })

    return res.status(201).json({
      lead,
      message: "Lead created successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error.errors.map(e => e.message).join(", ")
      )
    }

    console.error("Error creating landing lead:", error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Failed to create landing lead"
    )
  }
}

