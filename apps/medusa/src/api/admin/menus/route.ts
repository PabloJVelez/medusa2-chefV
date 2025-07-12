import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { MENU_MODULE } from "../../../modules/menu"
import { createMenuWorkflow } from "../../../workflows/create-menu"

// Validation schemas
const createMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  courses: z.array(z.object({
    name: z.string().min(1, "Course name is required"),
    dishes: z.array(z.object({
      name: z.string().min(1, "Dish name is required"),
      description: z.string().optional(),
      ingredients: z.array(z.object({
        name: z.string().min(1, "Ingredient name is required"),
        optional: z.boolean().optional()
      }))
    }))
  })).optional().default([])
})

const listMenusSchema = z.object({
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional(),
  q: z.string().optional()
})

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const query = listMenusSchema.parse(req.query)
    const menuModuleService = req.scope.resolve(MENU_MODULE)
    
    const [menus, count] = await menuModuleService.listAndCountMenus(
      {
        ...(query.q ? {
          name: {
            $ilike: `%${query.q}%`
          }
        } : {})
      },
      {
        take: query.limit || 10,
        skip: query.offset || 0,
        relations: ["courses", "courses.dishes", "courses.dishes.ingredients"]
      }
    )

    res.status(200).json({
      menus,
      count,
      offset: query.offset || 0,
      limit: query.limit || 10
    })
  } catch (error) {
    console.error("Error listing menus:", error)
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const validatedData = createMenuSchema.parse(req.body)
    
    const { result } = await createMenuWorkflow(req.scope).run({
      input: validatedData
    })
    
    res.status(201).json(result.menu)
  } catch (error) {
    console.error("Error creating menu:", error)
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: error.errors
      })
      return
    }
    
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 