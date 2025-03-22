import ProductDetailsModuleService from "./service"
import { Module } from "@medusajs/utils"

export const PRODUCT_DETAILS_MODULE = "productDetailsModuleService"

export default Module(PRODUCT_DETAILS_MODULE, {
  service: ProductDetailsModuleService,
})