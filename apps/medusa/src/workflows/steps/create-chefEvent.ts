import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"
import ChefEventService from "../../modules/chef-event/service.js"

type CreateChefEventStepInput = {
  chefEvent: {
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
    templateProductId: string
  }
}

export const createChefEventStep = createStep(
  "create-chef-event",
  async (data: CreateChefEventStepInput, { container }) => {
    if (!data.chefEvent) {
      return
    }

    const chefEventService: ChefEventService = container.resolve(
      CHEF_EVENT_MODULE
    )
    const chefEventData = {
      status: data.chefEvent.status || 'pending',
      requestedDate: data.chefEvent.requestedDate,
      requestedTime: data.chefEvent.requestedTime,
      partySize: data.chefEvent.partySize,
      eventType: data.chefEvent.eventType,
      locationType: data.chefEvent.locationType,
      locationAddress: data.chefEvent.locationAddress || '',
      firstName: data.chefEvent.firstName,
      lastName: data.chefEvent.lastName,
      email: data.chefEvent.email,
      phone: data.chefEvent.phone || '',
      notes: data.chefEvent.notes || '',
      totalPrice: data.chefEvent.totalPrice || 0,
      depositPaid: data.chefEvent.depositPaid || false,
      specialRequirements: data.chefEvent.specialRequirements || '',
      estimatedDuration: data.chefEvent.estimatedDuration || 180,
      templateProductId: data.chefEvent.templateProductId,
    }

    const chefEvent = await chefEventService.createChefEvents(chefEventData)

    return new StepResponse(chefEvent, chefEvent)
  },
  async (chefEvent, { container }) => {
    const chefEventService: ChefEventService = container.resolve(
      CHEF_EVENT_MODULE
    )

    if (chefEvent?.id) {
      await chefEventService.deleteChefEvents(chefEvent.id)
    }
  }
)