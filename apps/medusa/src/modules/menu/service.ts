import { MedusaService } from "@medusajs/framework/utils"
import { Menu } from "./models/menu"
import { Course } from "./models/course"
import { Dish } from "./models/dish"
import { Ingredient } from "./models/ingredient"

class MenuModuleService extends MedusaService({
  Menu,
  Course,
  Dish,
  Ingredient
}){
}

export default MenuModuleService