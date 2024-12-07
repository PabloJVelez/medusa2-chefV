import { ProductDTO as MedusaProductDTO } from "@medusajs/types"
import { MenuDTO } from "../modules/menu/types"

declare module "@medusajs/types" {
  interface ProductDTO extends MedusaProductDTO {
    menu?: MenuDTO
  }
}