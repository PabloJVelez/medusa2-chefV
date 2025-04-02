import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { createStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"
import { linkMenuToEventProductWorkflow } from "./link-menu-to-event-product"
import { linkEventToProductWorkflow } from "./link-event-to-product"
import { updateChefEventWorkflow } from "./update-chef-event"
import { ProductStatus } from "@medusajs/utils"
import { DateTime } from "luxon"

export type AcceptEventWorkflowInput = {
  eventId: string
  assignedChefId: string
}

export const acceptEventWorkflow = createWorkflow(
  "accept-event",
  (input: AcceptEventWorkflowInput) => {
    const event = transform(
      {
        input
      },
      async (data, { container }) => {
        const query = container.resolve("query")
        const { data: [event] } = await query.graph({
          entity: "chef_event",
          fields: ["*"],
          filters: {
            id: data.input.eventId
          }
        })

        if (!event) {
          throw new Error("Event not found")
        }

        return event
      }
    )

    const templateProduct = transform(
      {
        event
      },
      async (data, { container }) => {
        const query = container.resolve("query")
        const { data: [templateProduct] } = await query.graph({
          entity: "product",
          fields: ["id", "title", "description", "menu.*", "menu.courses.*", "menu.courses.dishes.*", "variants.id", "variants.prices.*"],
          filters: {
            id: data.event.templateProductId
          }
        })

        return templateProduct
      }
    )

    const formattedDate = transform(
      {
        event
      },
      (data) => DateTime.fromISO(data.event.requestedDate.toISOString()).toFormat('LLL d, yyyy')
    )

    const formattedTime = transform(
      {
        event
      },
      (data) => DateTime.fromFormat(data.event.requestedTime, 'HH:mm').toFormat('h:mm a')
    )

    const eventTypeMap = {
      cooking_class: "Chef's Cooking Class",
      plated_dinner: "Plated Dinner Service",
      buffet_style: "Buffet Style Service"
    }

    const newProductTitle = transform(
      {
        event,
        templateProduct,
        formattedDate,
        formattedTime
      },
      (data) => {
        const shortEventId = data.event.id.substring(0, 8)
        return `${data.templateProduct.title} - ${eventTypeMap[data.event.eventType]} (${data.formattedDate} at ${data.formattedTime}) #${shortEventId}`
      }
    )

    const newProductDescription = transform(
      {
        event,
        templateProduct,
        formattedDate,
        formattedTime
      },
      (data) => `
${data.templateProduct.description || ''}

Event Details:
• Date: ${data.formattedDate}
• Time: ${data.formattedTime}
• Type: ${eventTypeMap[data.event.eventType]}
• Location: ${data.event.locationType === 'customer_location' ? 'at Customer\'s Location' : 'at Chef\'s Location'}
${data.event.locationAddress ? `• Address: ${data.event.locationAddress}` : ''}
• Party Size: ${data.event.partySize} guests
• Total Price: ${data.event.totalPrice / 100} ${data.templateProduct.variants[0].prices[0].currency_code}
      `.trim()
    )

    const productInput = transform(
      {
        event,
        templateProduct,
        newProductTitle,
        newProductDescription
      },
      (data) => ({
        title: data.newProductTitle,
        description: data.newProductDescription,
        status: ProductStatus.PUBLISHED,
        options: [{
          title: "Event Type",
          values: ["Chef Event"]
        }],
        variants: [{
          title: 'Chef Event Ticket',
          manage_inventory: true,
          allow_backorder: false,
          sku: `EVENT-${data.event.id}`,
          prices: [{
            amount: data.event.totalPrice / data.event.partySize,
            currency_code: data.templateProduct.variants[0].prices[0].currency_code
          }]
        }],
        type: "event",
        metadata: {
          template_product_id: data.templateProduct.id,
          event_type: data.event.eventType,
          event_date: data.event.requestedDate,
          event_time: data.event.requestedTime,
          party_size: data.event.partySize,
          is_event_product: true
        }
      })
    )

    const createdProduct = transform(
      {
        productInput
      },
      async (data, { container }) => {
        const { result: [createdProduct] } = await createProductsWorkflow(container).run({
          input: { products: [data.productInput] }
        })
        return createdProduct
      }
    )

    const eventLocation = transform(
      {
        newProductTitle
      },
      async (data, { container }) => {
        const { result: [eventLocation] } = await createStockLocationsWorkflow(container).run({
          input: {
            locations: [{
              name: `Event Location - ${data.newProductTitle}`,
            }]
          }
        })
        return eventLocation
      }
    )

    transform(
      {
        eventLocation,
        event
      },
      async (data, { container }) => {
        await linkSalesChannelsToStockLocationWorkflow(container).run({
          input: {
            id: data.eventLocation.id,
            add: [data.event.salesChannelId],
          }
        })
      }
    )

    transform(
      {
        createdProduct,
        templateProduct
      },
      async (data, { container }) => {
        await linkMenuToEventProductWorkflow(container).run({
          input: {
            productId: data.createdProduct.id,
            menuId: data.templateProduct.menu?.id
          }
        })
      }
    )

    transform(
      {
        createdProduct,
        event
      },
      async (data, { container }) => {
        await linkEventToProductWorkflow(container).run({
          input: {
            productId: data.createdProduct.id,
            chefEventId: data.event.id
          }
        })
      }
    )

    const updatedEvent = transform(
      {
        event,
        input
      },
      async (data, { container }) => {
        const updatedEvent = await updateChefEventWorkflow(container).run({
          input: {
            chefEventId: data.event.id,
            status: "confirmed",
            assignedChefId: data.input.assignedChefId
          }
        })
        return updatedEvent
      }
    )

    return new WorkflowResponse({
      chefEvent: updatedEvent,
      eventProduct: createdProduct
    })
  }
) 