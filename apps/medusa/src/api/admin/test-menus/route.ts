import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MENU_MODULE } from "../../../modules/menu"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    console.log("=== DEBUG: Test menus endpoint ===")
    
    // Test 1: Check if module resolves
    console.log("1. MENU_MODULE constant:", MENU_MODULE)
    
    const menuModuleService = req.scope.resolve(MENU_MODULE)
    console.log("2. Menu module service resolved:", !!menuModuleService)
    
    // Test 2: Check available methods
    console.log("3. Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(menuModuleService)))
    
    // Test 3: Try simple list
    const menus = await menuModuleService.listMenus()
    console.log("4. Simple listMenus result:", menus?.length || 0)
    
    // Test 4: Try listAndCount
    const [menusWithCount, count] = await menuModuleService.listAndCountMenus()
    console.log("5. listAndCountMenus result:", menusWithCount?.length || 0, "count:", count)
    
    res.status(200).json({
      success: true,
      simpleList: menus?.length || 0,
      listAndCount: menusWithCount?.length || 0,
      totalCount: count,
      sampleMenu: menus?.[0] || null
    })
    
  } catch (error) {
    console.error("=== DEBUG ERROR ===", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
  }
} 