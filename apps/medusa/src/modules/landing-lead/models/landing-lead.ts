import { model } from "@medusajs/framework/utils"

export const LandingLead = model.define("landing_lead", {
  id: model.id().primaryKey(),
  
  // Contact Information
  email: model.text(),
  firstName: model.text().nullable(),
  lastName: model.text().nullable(),
  phone: model.text().nullable(),
  
  // Lead Source & Tracking
  source: model.text().default('landing_page'),
  referrer: model.text().nullable(),
  utmSource: model.text().nullable(),
  utmMedium: model.text().nullable(),
  utmCampaign: model.text().nullable(),
  utmTerm: model.text().nullable(),
  utmContent: model.text().nullable(),
  landingPage: model.text().nullable(),
  
  // Additional Context
  interestedIn: model.json().nullable(),
  message: model.text().nullable(),
  metadata: model.json().nullable(),
  
  // Lead Status & Follow-up
  status: model.enum([
    'new',
    'contacted',
    'qualified',
    'converted',
    'unsubscribed',
    'spam'
  ]).default('new'),
  
  // Conversion Tracking
  convertedAt: model.dateTime().nullable(),
  convertedToEventId: model.text().nullable(),
  convertedToOrderId: model.text().nullable(),
  
  // Communication History
  emailSentAt: model.dateTime().nullable(),
  followUpCount: model.number().default(0),
  lastContactedAt: model.dateTime().nullable(),
  unsubscribedAt: model.dateTime().nullable(),
  
  // Admin Notes
  notes: model.text().nullable(),
  assignedTo: model.text().nullable(),
  
}).cascades({
  delete: []
})

export default LandingLead

export type LandingLeadType = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  source: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  landingPage?: string
  interestedIn?: string[]
  message?: string
  metadata?: Record<string, any>
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'unsubscribed' | 'spam'
  convertedAt?: Date
  convertedToEventId?: string
  convertedToOrderId?: string
  emailSentAt?: Date
  followUpCount: number
  lastContactedAt?: Date
  unsubscribedAt?: Date
  notes?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

