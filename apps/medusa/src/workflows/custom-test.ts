import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

type WorkflowInput = {
  name: string
}

const step1 = createStep(
  "step-1", 
  async () => {
    return new StepResponse(`Hello from step one!`)
  }
)

const step2 = createStep(
  "step-2", 
  async ({ name }: WorkflowInput) => {
    return new StepResponse(`Hello ${name} from step two!`)
  }
)

const myWorkflow = createWorkflow(
  "hello-world",
  function (input: WorkflowInput) {
    const str1 = step1()
    // to pass input
    const str2 = step2(input)

    return new WorkflowResponse({
      message: str2,
    })
  }
)

export default myWorkflow


/* WORKING WORKFLOW FOR CHEF EVENT

import { 
  createStep,
  createWorkflow, 
  StepResponse,
  transform,
  WorkflowResponse,
  type WorkflowData
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep, emitEventStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import type { ChefEvent } from "../modules/chef-event/types"
// import { checkEventConflictsStep } from "./steps/check-event-conflicts"
// import { sendNotificationStep } from "./steps/send-notification"

export type RequestEventWorkflowInput = {
  productId: string
  requestedDate: string
  requestedTime: string
  partySize: number | string
  eventType: string
  locationType: string
  locationAddress?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  productName?: string
} 

// Define steps inside the workflow file
const getTemplateProduct = createStep(
  "get-template-product",
  async ({ productId, partySize }: { productId: string, partySize: string | number }) => {
    console.log("RUNNING STEP 1 --->")
    // For now, using mock data
    return new StepResponse({
      product: {
        id: productId,
        title: "Mock Product",
      },
      totalPrice: 100,
      pricePerPerson: 100
    })
  },
  async (compensationData, { container }) => {
    // Compensation logic (optional)
  }
)



export const requestEventWorkflow = createWorkflow(
  "request-event",
  function (input: WorkflowData<RequestEventWorkflowInput>) {
    // Execute steps
    console.log("RUNNING WORKFLOW --->", input)
    const templateProductResult = getTemplateProduct({
      productId: input.productId,
      partySize: input.partySize
    })

    const result = transform(
    {
      templateProductResult
    },
    (input) => {
      console.log("INPUT --->", input)
      return {
        message: `${input.templateProductResult}`
      }
    })

    
    return new WorkflowResponse({
      message: result.message
    })
  }
)

export default requestEventWorkflow





*/