import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import ChefEventModuleService from "../modules/chef-event/service"

type SendPaymentReminderWorkflowInput = {
  chefEventId: string
  recipients?: string[]
  notes?: string
}

const updateEmailHistoryStep = createStep(
  "update-email-history-step",
  async (input: SendPaymentReminderWorkflowInput, { container }) => {
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
      type: "payment_reminder",
      recipients: recipients,
      notes: input.notes,
      sentAt: new Date().toISOString(),
      sentBy: "chef_admin" // Could be dynamic based on user
    }
    
    const updatedHistory = Array.isArray(currentHistory) ? [...currentHistory, newEmailEntry] : [newEmailEntry]
    
    const updatedChefEvent = await chefEventModuleService.updateChefEvents({
      id: input.chefEventId,
      emailHistory: updatedHistory as any,
      lastEmailSentAt: new Date()
    })
    
    return new StepResponse({
      updatedChefEvent,
      recipients
    })
  }
)

export const sendPaymentReminderWorkflow = createWorkflow(
  "send-payment-reminder-workflow",
  function (input: SendPaymentReminderWorkflowInput) {
    const result = updateEmailHistoryStep(input)
    
    // Emit event for email notifications
    emitEventStep({
      eventName: "chef-event.payment-reminder",
      data: {
        chefEventId: input.chefEventId,
        recipients: result.recipients,
        notes: input.notes
      }
    })
    
    return new WorkflowResponse({
      chefEvent: result.updatedChefEvent,
      emailSent: true
    })
  }
)
