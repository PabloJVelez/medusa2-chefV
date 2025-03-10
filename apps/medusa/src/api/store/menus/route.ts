import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import MenuModuleService from "../../../modules/menu/service.js"
import { MENU_MODULE } from "../../../modules/menu"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const menuModuleService: MenuModuleService = req.scope.resolve(
    MENU_MODULE
  )

  const menus = await menuModuleService.listMenus({}, {
    relations: ['courses']
  })

  res.status(200).json({
    menus
  })
}

    