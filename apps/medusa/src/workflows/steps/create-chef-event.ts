import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import ChefEventService from "../../modules/chef-event/service.js"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"

type CreateChefEventStepInput = {
  status: string
  requestedDate: string
  requestedTime: string
  partySize: number
  eventType: string
  locationType: string
  locationAddress: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  totalPrice: number
  depositPaid: boolean
  specialRequirements: string
  estimatedDuration: number
  assignedChefId: string
  templateProductId: string
}

export const createChefEventStep = createStep(
  "create-chef-event",
  async (data: CreateChefEventStepInput, { container }) => {
    const chefEventService: ChefEventService = container.resolve(CHEF_EVENT_MODULE)

    try {
      const chefEvent = await chefEventService.createChefEvents(data)
      return new StepResponse(chefEvent, chefEvent)
    } catch (error) {
      throw error
    }
  },
  async (chefEvent, { container }) => {
    const chefEventService: ChefEventService = container.resolve(CHEF_EVENT_MODULE)
    await chefEventService.deleteChefEvents(chefEvent.id)
  }
) 