import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const productService = req.scope.resolve(Modules.PRODUCT)
  const { id } = req.params;
  const product = await productService.retrieveProduct(id, {
    relations: ['variants', 'variants.inventory_item']
  })

  return res.json({ product })
}