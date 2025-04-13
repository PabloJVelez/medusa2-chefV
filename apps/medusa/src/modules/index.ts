import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ChefEventModule from "./chef-event"
import MenuModule from "./menu"
import ProductDetailsModule from "./product-details"

// Define one-to-one links
export const productToChefEvent = defineLink(
  ProductModule.linkable.product,
  ChefEventModule.linkable.chefEvent
)

export const productToMenu = defineLink(
  ProductModule.linkable.product,
  MenuModule.linkable.menu
)

export const productToProductDetails = defineLink(
  ProductModule.linkable.product,
  ProductDetailsModule.linkable.productDetails
)

// Export all links
export const links = [
  productToChefEvent,
  productToMenu,
  productToProductDetails,
] 