import { createStep, StepResponse } from "@medusajs/workflows-sdk"
import { CHEF_EVENT_MODULE } from "../../modules/chef-event"
import type { CreateChefEventInput, ChefEvent } from "../../modules/chef-event/types"

export const createChefEventStep = createStep<
  CreateChefEventInput,
  ChefEvent,
  ChefEvent
>(
  "create-chef-event",
  async (input, { container }) => {
    const chefEventService = container.resolve(CHEF_EVENT_MODULE) as any
    const event = await chefEventService.create(input)
    return new StepResponse(event)
  },
  async (event, { container }) => {
    const chefEventService = container.resolve(CHEF_EVENT_MODULE) as any
    await chefEventService.delete(event.id)
  }
) 