import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { rejectChefEventWorkflow } from "../../../../../workflows/reject-chef-event"

const rejectChefEventSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
  chefNotes: z.string().optional(),
  rejectedBy: z.string().optional()
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const validatedBody = rejectChefEventSchema.parse(req.body)
  
  try {
    const { result } = await rejectChefEventWorkflow(req.scope).run({
      input: {
        chefEventId: id,
        rejectionReason: validatedBody.rejectionReason,
        chefNotes: validatedBody.chefNotes,
        rejectedBy: validatedBody.rejectedBy || 'chef'
      }
    })
    
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Error rejecting chef event:", error)
    res.status(500).json({
      success: false,
      message: "Failed to reject chef event",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 