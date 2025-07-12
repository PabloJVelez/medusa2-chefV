import { 
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse
} from "@medusajs/workflows-sdk"
import { MENU_MODULE } from "../modules/menu"

type CreateMenuWorkflowInput = {
  name: string
  courses?: Array<{
    name: string
    dishes: Array<{
      name: string
      description?: string
      ingredients: Array<{
        name: string
        optional?: boolean
      }>
    }>
  }>
}

const createMenuStep = createStep(
  "create-menu-step",
  async (input: CreateMenuWorkflowInput, { container }: { container: any }) => {
    const menuModuleService = container.resolve(MENU_MODULE)
    
    // Create the menu first
    const menu = await menuModuleService.createMenus({
      name: input.name
    })
    
    const courses = []
    
    if (input.courses && input.courses.length > 0) {
      for (const courseData of input.courses) {
        const course = await menuModuleService.createCourses({
          name: courseData.name,
          menu_id: menu.id
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
    }
    
    const fullMenu = {
      ...menu,
      courses,
      created_at: menu.created_at,
      updated_at: menu.updated_at
    }
    
    return new StepResponse(fullMenu)
  }
)

export const createMenuWorkflow = createWorkflow(
  "create-menu-workflow", 
  function (input: CreateMenuWorkflowInput) {
    const menu = createMenuStep(input)
    
    return new WorkflowResponse({
      menu
    })
  }
) 