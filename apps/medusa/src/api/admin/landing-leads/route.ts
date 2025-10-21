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
  } = req.query as {
    status?: string
    source?: string
    limit?: number
    offset?: number
  }

  const filters: any = {}
  if (status) filters.status = status
  if (source) filters.source = source

  const [leads, count] = await landingLeadModuleService.listAndCountLandingLeads(filters)

  return res.json({
    leads: leads.slice(Number(offset), Number(offset) + Number(limit)),
    count,
    limit: Number(limit),
    offset: Number(offset),
  })
}

