import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "*",
      "product_details.*"
    ],
    filters: {
      id: req.params.id,
    }
  })


  if (!products) {
    return res.status(404).json({ message: "Products not found" });
  }

  //console.log("PRODUCTS", products)
  const menuProducts = products.filter((product) => product.product_details !== undefined)
  console.log("MENU PRODUCTS", menuProducts)
  res.json({ products })
}

export const AUTHENTICATE = false;