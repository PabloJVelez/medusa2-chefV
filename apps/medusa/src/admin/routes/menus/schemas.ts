import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  optional: z.boolean().optional()
})

export const dishSchema = z.object({
  name: z.string().min(1, "Dish name is required"),
  description: z.string().optional(),
  ingredients: z.array(ingredientSchema)
})

export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  dishes: z.array(dishSchema)
})

export const menuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  courses: z.array(courseSchema).optional().default([])
}) 

// For updates, allow partial fields and ignore validation of nested course structures
// when they are not the focus of the edit (e.g., editing only media)
export const menuUpdateSchema = z.object({
  name: z.string().min(1, "Menu name is required").optional(),
  // Accept whatever shape we currently have for courses without enforcing creation rules
  courses: z.any().optional(),
})