import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { CHEF_EVENT_MODULE } from "../modules/chef-event"
import { DateTime } from "luxon"
import { CreateNotificationDTO } from "@medusajs/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createChefEventStep } from "./steps/create-chef-event"
import { checkEventConflictsStep } from "./steps/check-event-conflicts"
import { sendEventRequestNotificationStep } from "./steps/send-event-request-notification"

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

export const requestEventWorkflow = createWorkflow(
  "request-event",
  (input: RequestEventWorkflowInput) => {
    const templateProduct = transform(
      {
        input
      },
      async (data, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const { data: [product] } = await query.graph({
          entity: "product",
          fields: ["id", "title", "variants.id", "variants.prices.*", "menu.id"],
          filters: {
            id: data.input.productId
          }
        })

        if (!product) {
          throw new Error("Template product not found")
        }

        const templateVariant = product.variants?.[0]
        if (!templateVariant || !templateVariant.prices?.length) {
          throw new Error("Template product has no price information")
        }

        return {
          product,
          pricePerPerson: templateVariant.prices[0].amount,
          totalPrice: templateVariant.prices[0].amount * Number(data.input.partySize)
        }
      }
    )

    const hasConflictingEvent = transform(
      {
        input
      },
      async (data) => {
        return await checkEventConflictsStep({
          requestedDate: data.input.requestedDate,
          requestedTime: data.input.requestedTime
        })
      }
    )

    const chefEvent = transform(
      {
        input,
        templateProduct,
        hasConflictingEvent
      },
      async (data) => {
        return await createChefEventStep({
          status: "pending",
          requestedDate: data.input.requestedDate,
          requestedTime: data.input.requestedTime,
          partySize: Number(data.input.partySize),
          eventType: data.input.eventType,
          locationType: data.input.locationType,
          locationAddress: data.input.locationAddress || "",
          firstName: data.input.firstName,
          lastName: data.input.lastName,
          email: data.input.email,
          phone: data.input.phone || "",
          notes: data.input.notes || "",
          totalPrice: data.templateProduct.totalPrice,
          depositPaid: false,
          specialRequirements: "",
          estimatedDuration: 180,
          assignedChefId: "",
          templateProductId: data.templateProduct.product.id
        })
      }
    )

    transform(
      {
        chefEvent,
        templateProduct,
        input,
        hasConflictingEvent
      },
      async (data) => {
        await sendEventRequestNotificationStep({
          chefEvent: data.chefEvent,
          templateProduct: data.templateProduct.product,
          pricePerPerson: data.templateProduct.pricePerPerson,
          totalPrice: data.templateProduct.totalPrice,
          hasConflictingEvent: data.hasConflictingEvent,
          customer: {
            firstName: data.input.firstName,
            lastName: data.input.lastName,
            email: data.input.email,
            phone: data.input.phone
          },
          productName: data.input.productName
        })
      }
    )

    return new WorkflowResponse({
      chefEvent,
      totalPrice: templateProduct.totalPrice,
      hasConflictingEvent
    })
  }
) 