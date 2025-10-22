import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import LandingLeadModuleService from "../../../modules/landing-lead/service"
import { LANDING_LEAD_MODULE } from "../../../modules/landing-lead"

/**
 * GET /admin/landing-leads
 * List all landing leads with filtering
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const landingLeadModuleService: LandingLeadModuleService = req.scope.resolve(LANDING_LEAD_MODULE)

  const {
    status,
    source,
    limit = 50,
    offset = 0,
    q,
  } = req.query as {
    status?: string | string[]
    source?: string | string[]
    limit?: number
    offset?: number
    q?: string
  }

  const filter: any = {}
  if (status) filter.status = Array.isArray(status) ? status : [status]
  if (source) filter.source = Array.isArray(source) ? source : [source]
  if (q) filter.q = q

    const [leads, count] = await landingLeadModuleService.listAndCountLandingLeads(
      filter,
      {
        take: Number(limit),
        skip: Number(offset),
      }
    )
  
  res.json({ 
    leads, 
    count,
    limit: Number(limit),
    offset: Number(offset)
  })
}

