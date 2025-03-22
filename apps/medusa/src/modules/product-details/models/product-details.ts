import { model } from "@medusajs/framework/utils"

export enum ProductType {
  MENU = "menu",
  EVENT = "event",
}

export const ProductDetails = model.define("product_details", {
  id: model.id().primaryKey(),
  type: model.text()
}) 