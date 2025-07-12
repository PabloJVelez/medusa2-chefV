import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { MENU_MODULE } from "../modules/menu"

type UpdateMenuWorkflowInput = {
  id: string
  name?: string
  courses?: Array<{
    id?: string
    name: string
    dishes: Array<{
      id?: string
      name: string
      description?: string
      ingredients: Array<{
        id?: string
        name: string
        optional?: boolean
      }>
    }>
  }>
}

const updateMenuStep = createStep(
  "update-menu-step",
  async (input: UpdateMenuWorkflowInput, { container }: { container: any }) => {
    const menuModuleService = container.resolve(MENU_MODULE)
    
    // Update the menu
    const menu = await menuModuleService.updateMenus(input.id, {
      name: input.name
    })
    
    // If courses are provided, handle the full replacement
    if (input.courses !== undefined) {
      // Get existing courses to clean up
      const existingCourses = await menuModuleService.listCourses({
        menu_id: input.id
      })
      
      // Delete existing courses (this will cascade to dishes and ingredients)
      for (const course of existingCourses) {
        await menuModuleService.deleteCourses(course.id)
      }
      
      // Create new courses
      const courses = []
      for (const courseData of input.courses) {
        const course = await menuModuleService.createCourses({
          name: courseData.name,
          menu_id: input.id
        })
        
        const dishes = []
        for (const dishData of courseData.dishes) {
          const dish = await menuModuleService.createDishes({
            name: dishData.name,
            description: dishData.description,
            course_id: course.id
          })
          
          const ingredients = []
          for (const ingredientData of dishData.ingredients) {
            const ingredient = await menuModuleService.createIngredients({
              name: ingredientData.name,
              optional: ingredientData.optional ?? false,
              dish_id: dish.id
            })
            ingredients.push(ingredient)
          }
          
          dishes.push({ ...dish, ingredients })
        }
        
        courses.push({ ...course, dishes })
      }
      
      return new StepResponse({ ...menu, courses })
    }
    
    return new StepResponse(menu)
  }
)

export const updateMenuWorkflow = createWorkflow(
  "update-menu-workflow",
  function (input: UpdateMenuWorkflowInput) {
    const menu = updateMenuStep(input)
    
    return new WorkflowResponse({
      menu
    })
  }
) 