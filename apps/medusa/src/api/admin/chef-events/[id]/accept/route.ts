import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { acceptChefEventWorkflow } from "../../../../../workflows/accept-chef-event"

const acceptChefEventSchema = z.object({
  chefNotes: z.string().optional(),
  acceptedBy: z.string().optional(),
  sendAcceptanceEmail: z.boolean().default(true) // New field
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const validatedBody = acceptChefEventSchema.parse(req.body)
  
  try {
    console.log('validatedBody', validatedBody)
    console.log('id', id)
    const { result } = await acceptChefEventWorkflow(req.scope).run({
      input: {
        chefEventId: id,
        chefNotes: validatedBody.chefNotes,
        acceptedBy: validatedBody.acceptedBy || 'chef',
        sendAcceptanceEmail: validatedBody.sendAcceptanceEmail
      }
    })
    
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Error accepting chef event:", error)
    res.status(500).json({
      success: false,
      message: "Failed to accept chef event",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 