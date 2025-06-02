import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import MenuModuleService from "../../modules/menu/service.js"
import { MENU_MODULE } from "../../modules/menu"

type CreateMenuStepInput = {
  
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

export const createMenuStep = createStep(
  "create-menu",
  async (data: CreateMenuStepInput, { container }) => {
    if (!data) {
      return
    }

    const menuModuleService: MenuModuleService = container.resolve(
      MENU_MODULE
    )
    try {
      const menu = await menuModuleService.createMenus({
        ...data,
        courses: data.courses as any
      })
      return new StepResponse(menu, menu)
    } catch (error) {
      throw error
    }
  },
  async (menu, { container }) => {
    const menuModuleService: MenuModuleService = container.resolve(
      MENU_MODULE
    )

    await menuModuleService.deleteMenus(menu?.id || "")
  }
)