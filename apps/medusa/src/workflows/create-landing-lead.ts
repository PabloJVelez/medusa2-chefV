import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { LANDING_LEAD_MODULE } from "../modules/landing-lead"
import LandingLeadModuleService from "../modules/landing-lead/service"

type CreateLandingLeadWorkflowInput = {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  message?: string
  interestedIn?: string[]
  source: string
  landingPage?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  referrer?: string
}

const createOrUpdateLandingLeadStep = createStep(
  "create-or-update-landing-lead-step",
  async (input: CreateLandingLeadWorkflowInput, { container }) => {
    const landingLeadModuleService: LandingLeadModuleService = container.resolve(LANDING_LEAD_MODULE)
    
    // Normalize email to lowercase to prevent duplicates
    const normalizedEmail = input.email.toLowerCase().trim()
    
    // Check if lead already exists
    const existingLead = await landingLeadModuleService.findByEmail(normalizedEmail)
    
    if (existingLead) {
      // Update existing lead
      const updateData: any = {
        id: existingLead.id,
        email: normalizedEmail,
        firstName: input.firstName || null,
        lastName: input.lastName || null,
        phone: input.phone || null,
        message: input.message || null,
        source: input.source,
        landingPage: input.landingPage || null,
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
        utmTerm: input.utmTerm || null,
        utmContent: input.utmContent || null,
        referrer: input.referrer || null,
        interestedIn: input.interestedIn ? { items: input.interestedIn } : null,
      }
      
      const updatedLead = await landingLeadModuleService.updateLandingLeads(updateData)
      
      return new StepResponse({
        lead: updatedLead,
        isNew: false
      })
    }
    
    // Create new lead
    const createData: any = {
      email: normalizedEmail,
      firstName: input.firstName || null,
      lastName: input.lastName || null,
      phone: input.phone || null,
      message: input.message || null,
      source: input.source,
      landingPage: input.landingPage || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      utmTerm: input.utmTerm || null,
      utmContent: input.utmContent || null,
      referrer: input.referrer || null,
      interestedIn: input.interestedIn ? { items: input.interestedIn } : null,
      status: 'new',
      followUpCount: 0,
    }
    
    const lead = await landingLeadModuleService.createLandingLeads(createData)
    
    return new StepResponse({
      lead,
      isNew: true
    })
  }
)

export const createLandingLeadWorkflow = createWorkflow(
  "create-landing-lead-workflow",
  function (input: CreateLandingLeadWorkflowInput) {
    const result = createOrUpdateLandingLeadStep(input)
    
    // Emit event for notifications (only for new leads)
    emitEventStep({
      eventName: "landing_lead.created",
      data: {
        id: result.lead.id,
        email: result.lead.email,
        source: result.lead.source,
        utmSource: result.lead.utmSource,
        utmCampaign: result.lead.utmCampaign,
        isNew: result.isNew,
      }
    })
    
    return new WorkflowResponse({
      lead: result.lead,
      isNew: result.isNew
    })
  }
)

