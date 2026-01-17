import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import ChefEventModuleService from "../modules/chef-event/service"

type SendReceiptWorkflowInput = {
  chefEventId: string
  recipients?: string[]
  notes?: string
  tipAmount?: number
  tipMethod?: string
  receiptDate?: string
}

const updateEmailHistoryAndTipStep = createStep(
  "update-email-history-and-tip-step",
  async (input: SendReceiptWorkflowInput, { container }) => {
    const chefEventModuleService: ChefEventModuleService = container.resolve(CHEF_EVENT_MODULE)
    
    // Get current chef event
    const chefEvent = await chefEventModuleService.retrieveChefEvent(input.chefEventId)
    
    if (!chefEvent) {
      throw new Error(`Chef event not found: ${input.chefEventId}`)
    }
    
    // Default recipients to host email if not provided
    const recipients = input.recipients && input.recipients.length > 0 
      ? input.recipients 
      : [chefEvent.email]
    
    // Update email history
    const currentHistory = chefEvent.emailHistory || []
    const newEmailEntry = {
      type: "receipt",
      recipients: recipients,
      notes: input.notes,
      sentAt: new Date().toISOString(),
      sentBy: "chef_admin" // Could be dynamic based on user
    }
    
    const updatedHistory = Array.isArray(currentHistory) ? [...currentHistory, newEmailEntry] : [newEmailEntry]
    
    // Prepare update data
    const updateData: any = {
      id: input.chefEventId,
      emailHistory: updatedHistory as any,
      lastEmailSentAt: new Date()
    }
    
    // Update tip fields if provided
    if (input.tipAmount !== undefined) {
      updateData.tipAmount = input.tipAmount
    }
    if (input.tipMethod !== undefined) {
      updateData.tipMethod = input.tipMethod
    }
    
    const updatedChefEvent = await chefEventModuleService.updateChefEvents(updateData)
    
    return new StepResponse({
      updatedChefEvent,
      recipients
    })
  }
)

export const sendReceiptWorkflow = createWorkflow(
  "send-receipt-workflow",
  function (input: SendReceiptWorkflowInput) {
    const result = updateEmailHistoryAndTipStep(input)
    
    // Emit event for email notifications
    emitEventStep({
      eventName: "chef-event.receipt",
      data: {
        chefEventId: input.chefEventId,
        recipients: result.recipients,
        notes: input.notes,
        tipAmount: input.tipAmount,
        tipMethod: input.tipMethod,
        receiptDate: input.receiptDate
      }
    })
    
    return new WorkflowResponse({
      chefEvent: result.updatedChefEvent,
      emailSent: true
    })
  }
)
