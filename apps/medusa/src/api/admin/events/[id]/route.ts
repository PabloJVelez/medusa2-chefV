import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { Modules } from "@medusajs/framework/utils"
import ChefEventModuleService from "../../../../modules/chef-event/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const chefEventService: ChefEventModuleService = req.scope.resolve(
    "chefEventModuleService"
  )
  const inventoryModuleService = req.scope.resolve(Modules.INVENTORY)
  const productService = req.scope.resolve(Modules.PRODUCT)
  const pricingService = req.scope.resolve(Modules.PRICING)

  // Get the region_id from the request query params or default to a fallback
  const regionId = req.query.region_id as string || "reg_01JF9CGC15NG5EKP3V3HCG6PP2";
  const currencyCode = req.query.currency_code as string || "usd";

  // First, get the chef event data

  const chefEvent = await chefEventService.retrieveChefEvent(req.params.id)
  console.log("CHEF EVENT WE GOT BACK IN ROUTE FROM SERVICE", chefEvent)

  const { data: chefProductEvent } = await query.graph({
    entity: "chef_event",
    fields: [
      "*",
      "product.id"
    ],
    filters: {
      id: req.params.id
    }
  })

  console.log("CHEF PRODUCT EVENT WE GOT BACK IN ROUTE FROM SERVICE", chefProductEvent)

  if (!chefEvent) {
    return res.status(404).json({ message: "Event not found" });
  }

  //TODO: THIS ROUTE SHOULD ONLY RETURN THE CHEF EVENT DATA THE PRODUCT DATA SHOULD BE FETCHED SEPARATELY IN THE events.$eventId.tsx
  // // Get the product data using product service
  // const product = await productService.retrieveProduct(chefEvent[0].product.id, {
  //   relations: [
  //     "variants",
  //     "options",
  //     "images",
  //     "tags",
  //     "type",
  //     "collection"
  //   ]
  // })

  // Get the menu data using graph
  // const { data: menuData } = await query.graph({
  //   entity: "product",
  //   fields: [
  //     "menu.id",
  //     "menu.name",
  //     "menu.courses.id",
  //     "menu.courses.name",
  //     "menu.courses.dishes.id",
  //     "menu.courses.dishes.name",
  //     "menu.courses.dishes.description"
  //   ],
  //   filters: {
  //     id: chefEvent[0].product.id
  //   }
  // })

  // Calculate prices for variants
  // const variantIds = product.variants.map(v => v.id)
  // console.log("Calculating prices for variants:", variantIds)
  // console.log("Region ID:", regionId)
  // console.log("Currency Code:", currencyCode)

  // const calculatedPrices = await pricingService.calculatePrices(
  //   {
  //     id: variantIds
  //   },
  //   {
  //     context: {
  //       currency_code: currencyCode,
  //       region_id: regionId,
  //       quantity: 1
  //     }
  //   }
  // )

  // console.log("Calculated prices:", calculatedPrices)

  // Create a map of variant IDs to calculated prices
  // const priceMap = calculatedPrices.reduce((acc, price) => {
  //   acc[price.id] = price
  //   return acc
  // }, {})

  // // Attach the pricing information to the variants
  // const variantsWithPrices = product.variants.map((variant: ProductVariantDTO) => {
  //   const calculatedPrice = priceMap[variant.id]
  //   console.log("Price for variant", variant.id, ":", calculatedPrice)

  //   return {
  //     ...variant,
  //     calculated_price: calculatedPrice?.calculated_amount || null,
  //     original_price: calculatedPrice?.original_amount || null
  //   }
  // })

  // console.log("Product with pricing:", {
  //   id: product.id,
  //   title: product.title,
  //   variants: variantsWithPrices.map(v => ({
  //     id: v.id,
  //     calculated_price: v.calculated_price,
  //     original_price: v.original_price
  //   }))
  // })

  // Get inventory data
  // const inventoryItem = await inventoryModuleService.listInventoryItems({
  //   sku: `${chefEvent[0].product.id}-${product.variants[0].id}`
  // })

  // const inventoryLevel = await inventoryModuleService.listInventoryLevels({
  //   inventory_item_id: inventoryItem[0].id
  // })

  // Merge product data with menu data and set inventory
  // const completeProduct = {
  //   ...product,
  //   menu: menuData[0].menu,
  //   variants: variantsWithPrices.map((variant, index) => {
  //     if (index === 0) {
  //       return {
  //         ...variant,
  //         inventory_quantity: inventoryLevel[0].stocked_quantity
  //       }
  //     }
  //     return variant
  //   })
  // }

  const fullChefEvent = {
    id: chefProductEvent[0].id,
    status: chefProductEvent[0].status,
    date: chefProductEvent[0].requestedDate,
    time: chefProductEvent[0].requestedTime,
    location: chefProductEvent[0].locationAddress,
    partySize: chefProductEvent[0].partySize,
    eventType: chefProductEvent[0].eventType,
    notes: chefProductEvent[0].notes,
    product_id: chefProductEvent[0].product.id
  }
  console.log("FULL CHEF EVENT +++++++>>>>", fullChefEvent)

  res.json({ chefEvent: fullChefEvent })
}

export const AUTHENTICATE = false;