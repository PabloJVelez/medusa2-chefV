import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1", 
  async () => {
    return new StepResponse(`Hello from step one!`)
  }
)