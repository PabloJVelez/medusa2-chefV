import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import MenuModuleService from "../../../modules/menu/service"
import { MENU_MODULE } from "../../../modules/menu"

type CreateMenuStepInput = {
  menu: {
    name: string
    courses: {
      name: string
      dishes: {
        name: string
        description: string
        ingredients: {
          name: string
          optional: boolean
        }[]
      }[]
    }[]
  }
}

export const createMenuStep = createStep(
  "create-menu",
  async (data: CreateMenuStepInput, { container }) => {
    console.log("TRIGGERING MENU CREATION with data", JSON.stringify(data, null, 2))
    if (!data?.menu) {
      console.log("NO MENU DATA PROVIDED")
      return
    }

    const menuModuleService: MenuModuleService = container.resolve(
      MENU_MODULE
    )

    try {
      const menu = await menuModuleService.createMenus(data.menu)
      console.log("MENU CREATED SUCCESSFULLY:", JSON.stringify(menu, null, 2))
      return new StepResponse(menu, menu)
    } catch (error) {
      console.error("ERROR CREATING MENU:", error)
      throw error
    }
  },
  async (menu, { container }) => {
    const menuModuleService: MenuModuleService = container.resolve(
      MENU_MODULE
    )

    await menuModuleService.deleteMenus(menu.id)
  }
)