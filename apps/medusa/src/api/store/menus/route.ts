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
  console.log("MADE IT HERE TO THE REQUEST")

  const menus = await menuModuleService.listMenus({}, {
    relations: ['courses']
  })

  res.status(200).json({
    menus
  })
}