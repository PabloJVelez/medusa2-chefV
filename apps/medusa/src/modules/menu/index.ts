import MenuModuleService from "./service"
import { Module } from "@medusajs/utils"

export const MENU_MODULE = "menuModuleService"

export default Module(MENU_MODULE, {
  service: MenuModuleService,
})