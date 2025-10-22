import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { MedusaError } from "@medusajs/framework/utils"
import { createLandingLeadWorkflow } from "../../../workflows/create-landing-lead"

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
  try {
    // Validate request body
    const validatedData = createLandingLeadSchema.parse(req.body)

    // Run workflow to create/update lead and emit event
    const { result } = await createLandingLeadWorkflow(req.scope).run({
      input: validatedData
    })

    return res.status(result.isNew ? 201 : 200).json({
      lead: result.lead,
      message: result.isNew ? "Lead created successfully" : "Lead updated successfully",
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

