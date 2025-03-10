import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import { updateChefEventStep } from "./steps/update-chef-event"

export type UpdateChefEventWorkflowInput = {
  chefEventId: string
  status: string
}

export const updateChefEventWorkflow = createWorkflow(
  "update-chef-event",
  (input: UpdateChefEventWorkflowInput) => {
    const { chefEventId, status } = input
    updateChefEventStep(input) 
  }
)