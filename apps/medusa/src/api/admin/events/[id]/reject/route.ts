import type { 
  AuthenticatedMedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"

export const POST = async (
  req: AuthenticatedMedusaRequest, 
  res: MedusaResponse
) => {
  const { id } = req.params

  try {
    // Here you would add your logic to reject the chef event
    // For example:
    // await chefEventService.reject(id)
    
    res.json({
      success: true,
      message: "Event rejected successfully",
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to reject event",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export const AUTHENTICATE = false 