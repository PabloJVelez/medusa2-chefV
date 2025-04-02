// import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
// import MenuModuleService from "../../modules/menu/service.js"
// import { MENU_MODULE } from "../../modules/menu"

// type CreateMenuStepInput = {
//   menu: {
//     name: string
//     courses: {
//       name: string
//       dishes: {
//         name: string
//         description: string
//         ingredients: {
//           name: string
//           optional: boolean
//         }[]
//       }[]
//     }[]
//   }
// }

// export const createMenuStep = createStep(
//   "create-menu",
//   async (data: CreateMenuStepInput, { container }) => {
//     if (!data?.menu) {
//       return
//     }

//     const menuModuleService: MenuModuleService = container.resolve(
//       MENU_MODULE
//     )

//     try {
//       const menu = await menuModuleService.createMenus(data.menu)
//       return new StepResponse(menu, menu)
//     } catch (error) {
//       throw error
//     }
//   },
//   async (menu, { container }) => {
//     const menuModuleService: MenuModuleService = container.resolve(
//       MENU_MODULE
//     )

//     await menuModuleService.deleteMenus(menu.id)
//   }
// )