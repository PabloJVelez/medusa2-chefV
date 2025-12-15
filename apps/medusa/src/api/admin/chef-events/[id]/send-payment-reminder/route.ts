import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { sendPaymentReminderWorkflow } from "../../../../../workflows/send-payment-reminder"
import { CHEF_EVENT_MODULE } from "../../../../../modules/chef-event"

const sendPaymentReminderSchema = z.object({
  recipients: z.array(z.string().email()).optional(),
  notes: z.string().optional()
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const validatedBody = sendPaymentReminderSchema.parse(req.body)
  const logger = req.scope.resolve("logger")
  
  try {
    // Validate that chef event exists and has productId
    const chefEventModuleService = req.scope.resolve(CHEF_EVENT_MODULE) as any
    const chefEvent = await chefEventModuleService.retrieveChefEvent(id)
    
    if (!chefEvent) {
      return res.status(404).json({
        success: false,
        message: "Chef event not found"
      })
    }
    
    if (!chefEvent.productId) {
      return res.status(400).json({
        success: false,
        message: "Chef event does not have an associated product. Please accept the event first."
      })
    }
    
    if (chefEvent.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Payment reminders can only be sent for confirmed events"
      })
    }
    
    // Default recipients to host email if not provided
    const recipients = validatedBody.recipients && validatedBody.recipients.length > 0
      ? validatedBody.recipients
      : [chefEvent.email]
    
    const { result } = await sendPaymentReminderWorkflow(req.scope).run({
      input: {
        chefEventId: id,
        recipients: recipients,
        notes: validatedBody.notes
      }
    })
    
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error(`Error sending payment reminder: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      success: false,
      message: "Failed to send payment reminder",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
