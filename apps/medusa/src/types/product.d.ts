import { Product as MedusaProduct } from "@medusajs/types"
import { MenuDTO } from "../modules/menu/types"

declare module "@medusajs/types" {
  interface Product extends MedusaProduct {
    menu?: MenuDTO
  }
}