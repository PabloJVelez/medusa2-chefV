import MenuModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MENU_MODULE = "menuModuleService"

export default Module(MENU_MODULE, {
  service: MenuModuleService,
})