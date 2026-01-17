import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { sendReceiptWorkflow } from "../../../../../workflows/send-receipt"
import { CHEF_EVENT_MODULE } from "../../../../../modules/chef-event"

const sendReceiptSchema = z.object({
  recipients: z.array(z.string().email()).optional(),
  notes: z.string().optional(),
  tipAmount: z.number().nonnegative().optional(),
  tipMethod: z.string().optional(),
  receiptDate: z.string().optional()
}).refine(
  (data) => {
    // If tipAmount is provided, tipMethod should also be provided
    if (data.tipAmount !== undefined && data.tipAmount > 0) {
      return data.tipMethod !== undefined && data.tipMethod.trim().length > 0
    }
    return true
  },
  {
    message: "Tip method is required when tip amount is provided",
    path: ["tipMethod"]
  }
)

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const validatedBody = sendReceiptSchema.parse(req.body)
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
        message: "Receipts can only be sent for confirmed events"
      })
    }
    
    // Default recipients to host email if not provided
    const recipients = validatedBody.recipients && validatedBody.recipients.length > 0
      ? validatedBody.recipients
      : [chefEvent.email]
    
    const { result } = await sendReceiptWorkflow(req.scope).run({
      input: {
        chefEventId: id,
        recipients: recipients,
        notes: validatedBody.notes,
        tipAmount: validatedBody.tipAmount,
        tipMethod: validatedBody.tipMethod,
        receiptDate: validatedBody.receiptDate
      }
    })
    
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error(`Error sending receipt: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      success: false,
      message: "Failed to send receipt",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
