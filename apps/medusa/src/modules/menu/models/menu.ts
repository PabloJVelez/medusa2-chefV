import { model } from "@medusajs/framework/utils"
import { Course } from "./course"

export const Menu = model.define("menu", {
  name: model.text(),
  id: model.id().primaryKey(),
  courses: model.hasMany(() => Course),
}).cascades({
  delete: ["courses"]
})