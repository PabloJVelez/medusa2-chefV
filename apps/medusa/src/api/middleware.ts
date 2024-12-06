import { defineMiddlewares } from "@medusajs/medusa"
import { z } from "zod"

export default defineMiddlewares({
  routes: [
    {
      method: "POST",
      matcher: "/admin/products",
      additionalDataValidator: {
        menu: z.object({
          name: z.string(),
          courses: z.array(z.object({
            name: z.string(),
            dishes: z.array(z.object({
              name: z.string(),
              description: z.string(),
              ingredients: z.array(z.object({
                name: z.string(),
                optional: z.boolean()
              }))
            }))
          }))
        }),
        chefEvent: z.object({
          status: z.enum([
            'pending',
            'confirmed',
            'cancelled',
            'completed'
          ]).default('pending').optional(),
          requestedDate: z.string().datetime().optional(),
          requestedTime: z.string().optional(), // Format: HH:mm
          partySize: z.number().min(1).max(20).optional(),
          eventType: z.enum([
            'cooking_class',
            'plated_dinner',
            'buffet_style'
          ]).optional(),
          locationType: z.enum([
            'customer_location',
            'chef_location'
          ]).optional(),
          locationAddress: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          notes: z.string().optional(),
          totalPrice: z.number().optional(),
          depositPaid: z.boolean().default(false).optional(),
          specialRequirements: z.string().optional(),
          estimatedDuration: z.number().optional(), // Duration in minutes
          assignedChefId: z.string().optional()
        }).optional()
      },
    },
  ],
})