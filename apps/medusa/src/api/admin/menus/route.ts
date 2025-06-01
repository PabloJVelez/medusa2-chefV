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
        $in: req.query.product_ids as string[]
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

// export async function POST(
//   req: MedusaRequest,
//   res: MedusaResponse
// ): Promise<void> {
//   const productService = req.scope.resolve(Modules.PRODUCT)
//   const { name, courses } = req.body

//   try {
//     // First get the menu product type
//     const [productTypes] = await productService.listAndCountProductTypes({
//       value: "menu"
//     })
    
//     if (!productTypes || productTypes.length === 0) {
//       res.status(400).json({
//         message: "Menu product type not found"
//       })
//       return
//     }

//     const menuType = productTypes[0]
    
//     // Create a product with menu data and proper type
//     const product = await productService.createProducts({
//       title: name,
//       type_id: menuType.id,
//     })

//     res.status(201).json({
//       menu: {
//         id: product.id,
//         name: product.title,
//         courses: product.metadata?.menu?.courses || [],
//         createdAt: product.created_at,
//         updatedAt: product.updated_at
//       }
//     })
//   } catch (error) {
//     console.error("Error creating menu:", error)
//     res.status(500).json({
//       message: "Error creating menu"
//     })
//   }
// } 