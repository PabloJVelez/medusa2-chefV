import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/utils"
import { AdminUpdateMenuDTO } from "../../../../sdk/admin/admin-menus"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: menu } = await query.graph({
    entity: "menu",
    fields: ["*", "courses.*", "courses.dishes.*", "courses.dishes.ingredients.*"],
    filters: {
      id: { $eq: id }
    }
  })

  if (!menu || menu.length === 0) {
    res.status(404).json({
      message: "Menu not found"
    })
    return
  }

  res.status(200).json({
    menu: menu[0]
  })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const data = req.body as AdminUpdateMenuDTO
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: menu } = await query.graph({
    entity: "menu",
    fields: ["*"],
    filters: { id: { $eq: id } }
  })

  if (!menu || menu.length === 0) {
    res.status(404).json({
      message: "Menu not found"
    })
    return
  }

  // Update the product with the menu data
  const productService = req.scope.resolve("productService") as any
  
  await productService.update(id, {
    title: data.name,
    additional_data: {
      menu: data
    }
  })

  // Fetch the updated menu
  const { data: updatedMenu } = await query.graph({
    entity: "menu",
    fields: ["*", "courses.*", "courses.dishes.*", "courses.dishes.ingredients.*"],
    filters: {
      id: { $eq: id }
    }
  })

  res.status(200).json({
    menu: updatedMenu[0]
  })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  
  // Delete the product
  const productService = req.scope.resolve("productService") as any
  await productService.delete(id)

  res.status(204).send()
} 