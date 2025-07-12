import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { MENU_MODULE } from "../../../../modules/menu"
import { updateMenuWorkflow } from "../../../../workflows/update-menu"
import { deleteMenuWorkflow } from "../../../../workflows/delete-menu"

// Validation schemas
const updateMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required").optional(),
  courses: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Course name is required"),
    dishes: z.array(z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Dish name is required"),
      description: z.string().optional(),
      ingredients: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Ingredient name is required"),
        optional: z.boolean().optional()
      }))
    }))
  })).optional()
})

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const menuModuleService = req.scope.resolve(MENU_MODULE)

    const menu = await menuModuleService.retrieveMenu(id, {
      relations: ["courses", "courses.dishes", "courses.dishes.ingredients"]
    })

    if (!menu) {
      res.status(404).json({
        message: "Menu not found"
      })
      return
    }

    res.status(200).json(menu)
  } catch (error) {
    console.error("Error retrieving menu:", error)
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
    const { id } = req.params
    console.log("ID WE GET IN THE API", id)
    const validatedData = updateMenuSchema.parse(req.body)
    
    // Check if menu exists first
    const menuModuleService = req.scope.resolve(MENU_MODULE)
    const existingMenu = await menuModuleService.retrieveMenu(id)
    console.log("EXISTING MENU", existingMenu)
    
    if (!existingMenu) {
      res.status(404).json({
        message: "Menu not found"
      })
      return
    }

    const { result } = await updateMenuWorkflow(req.scope).run({
      input: {
        id,
        ...validatedData
      }
    })

    res.status(200).json(result.menu)
  } catch (error) {
    console.error("Error updating menu:", error)
    
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

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    
    await deleteMenuWorkflow(req.scope).run({
      input: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error("Error deleting menu:", error)
    
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({
        message: "Menu not found"
      })
      return
    }
    
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 