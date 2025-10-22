import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import LandingLeadModuleService from "../modules/landing-lead/service"
import { LANDING_LEAD_MODULE } from "../modules/landing-lead"

type EventData = {
  id: string
  email: string
  source?: string
  utmSource?: string
  utmCampaign?: string
  isNew?: boolean
}

export default async function landingLeadCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<EventData>) {
  // Only send emails for new leads
  if (!data.isNew) {
    console.log("📧 Skipping email for existing lead:", data.email)
    return
  }

  const notificationService = container.resolve(Modules.NOTIFICATION)
  const landingLeadModuleService: LandingLeadModuleService = container.resolve(LANDING_LEAD_MODULE)

  console.log("📧 Landing lead created:", data.email)

  try {
    // Get full lead details
    const lead = await landingLeadModuleService.retrieveLandingLead(data.id)

    // Send welcome email to the lead
    await notificationService.createNotifications({
      to: lead.email,
      channel: "email",
      template: "landing-lead-welcome",
      data: {
        email: lead.email,
        firstName: lead.firstName || "there",
        landingPage: lead.landingPage,
        interestedIn: lead.interestedIn,
      },
    })

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
    await notificationService.createNotifications({
      to: adminEmail,
      channel: "email",
      template: "landing-lead-notification",
      data: {
        leadId: lead.id,
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        source: lead.source,
        utmSource: lead.utmSource,
        utmCampaign: lead.utmCampaign,
        message: lead.message,
        interestedIn: lead.interestedIn,
        createdAt: lead.created_at,
        adminDashboardUrl: `${process.env.ADMIN_BACKEND_URL || 'http://localhost:9000'}/app/landing-leads/${lead.id}`,
      },
    })

    // Update lead with email sent timestamp
    await landingLeadModuleService.updateLandingLeads({
      id: lead.id,
      emailSentAt: new Date(),
    })

    console.log("✅ Landing lead emails sent successfully")
  } catch (error) {
    console.error("❌ Error sending landing lead emails:", error)
  }
}

export const config: SubscriberConfig = {
  event: "landing_lead.created",
}

