import { MedusaService } from "@medusajs/framework/utils"
import { ProductDetails } from "./models/product-details"

class ProductDetailsModuleService extends MedusaService({
  ProductDetails
}){
}

export default ProductDetailsModuleService
