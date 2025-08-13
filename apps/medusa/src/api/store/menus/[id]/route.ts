import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MENU_MODULE } from "../../../../modules/menu"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const menuModuleService = req.scope.resolve(MENU_MODULE)
    
    const menu = await menuModuleService.retrieveMenu(id, {
      relations: ["courses", "courses.dishes", "courses.dishes.ingredients", "images"]
    })

    if (!menu) {
      res.status(404).json({
        message: "Menu not found"
      })
      return
    }

    // Set cache headers for 30 minutes as specified in the plan
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800')
    
    res.status(200).json({
      menu
    })
  } catch (error) {
    console.error("Error retrieving store menu:", error)
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 