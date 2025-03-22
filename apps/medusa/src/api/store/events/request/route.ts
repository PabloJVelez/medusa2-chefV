import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { requestEventWorkflow, RequestEventWorkflowInput } from "../../../../workflows/request-event"

interface RequestEventBody {
  productId: string
  requestedDate: string
  requestedTime: string
  partySize: number | string
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style' | 'custom'
  locationType: 'customer_location' | 'chef_location'
  locationAddress?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  productName?: string
}

export async function POST(
  req: MedusaRequest<RequestEventWorkflowInput>,
  res: MedusaResponse
): Promise<void> {
  try {
    const result = await requestEventWorkflow.run({
      input: req.body
    } as RequestEventWorkflowInput)

    res.status(200).json({
      success: true,
      message: "Chef event request sent successfully",
      data: {
        requestId: result.chefEvent.id,
        status: "pending",
        customerName: `${result.chefEvent.firstName} ${result.chefEvent.lastName}`,
        eventDetails: {
          date: new Date(result.chefEvent.requestedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: new Date(`2000-01-01T${result.chefEvent.requestedTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send chef event request",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
