import { MedusaService } from "@medusajs/framework/utils"
import LandingLead from "./models/landing-lead"

class LandingLeadModuleService extends MedusaService({
  LandingLead
}){
  // Mark lead as contacted
  async markAsContacted(leadId: string, notes?: string): Promise<void> {
    const lead = await this.retrieveLandingLead(leadId)
    await this.updateLandingLeads({
      id: leadId,
      status: 'contacted',
      lastContactedAt: new Date(),
      followUpCount: lead.followUpCount + 1,
      notes: notes || undefined
    })
  }

  // Mark lead as converted
  async markAsConverted(
    leadId: string, 
    eventId?: string, 
    orderId?: string
  ): Promise<void> {
    await this.updateLandingLeads({
      id: leadId,
      status: 'converted',
      convertedAt: new Date(),
      convertedToEventId: eventId || undefined,
      convertedToOrderId: orderId || undefined
    })
  }

  // Unsubscribe lead
  async unsubscribeLead(leadId: string): Promise<void> {
    await this.updateLandingLeads({
      id: leadId,
      status: 'unsubscribed',
      unsubscribedAt: new Date()
    })
  }

  // Find lead by email
  async findByEmail(email: string) {
    const leads = await this.listLandingLeads({ email })
    return leads.length > 0 ? leads[0] : null
  }

  // Get leads by status
  async getLeadsByStatus(status: string) {
    return await this.listLandingLeads({ status })
  }

  // Get unconverted leads for follow-up
  async getUnconvertedLeads(daysOld?: number) {
    const leads = await this.listLandingLeads({ 
      status: ['new', 'contacted', 'qualified'] 
    })
    
    if (daysOld) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      return leads.filter(lead => 
        new Date(lead.createdAt) <= cutoffDate
      )
    }
    
    return leads
  }
}

export default LandingLeadModuleService

