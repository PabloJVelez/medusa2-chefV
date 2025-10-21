import LandingLeadModuleService from "./service"
import { Module } from "@medusajs/utils"

export const LANDING_LEAD_MODULE = "landingLeadModuleService"

export default Module(LANDING_LEAD_MODULE, {
  service: LandingLeadModuleService,
})

