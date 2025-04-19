import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/utils"
import { Modules } from "@medusajs/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["*", "menu.*", "menu.courses.*", "menu.courses.dishes.*"],
    filters: req.query.product_ids ? {
      id: {
        $in: req.query.product_ids
      }
    } : undefined
  })

  if (!products || products.length === 0) {
    res.status(404).json({
      message: "Menus not found"
    });
    return;
  }
  const menus = products.map(product => ({
    id: product.id,
    name: product.title,
    courses: product.menu?.courses || [],
    createdAt: product.created_at,
    updatedAt: product.updated_at
  }))

  res.status(200).json({
    menus
  });
} 