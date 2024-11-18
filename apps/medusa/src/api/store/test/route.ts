import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import MenuModuleService from "../../../modules/menu/service"
import { MENU_MODULE } from "../../../modules/menu"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const menuModuleService: MenuModuleService = req.scope.resolve(
    MENU_MODULE
  )

  const menu = await menuModuleService.createMenus({
    name: "TASTE OF ITALY",
      courses: [{
        name: "ANTIPASTI",
        dishes: [{
          name: "BRUSCHETTA",
          description: "Tomato, basil, garlic, olive oil",
          ingredients: [{
            name: "Tomato",
            optional: false
          }]
        }]
      }]  
  })

  res.json({
    menu
  })
}