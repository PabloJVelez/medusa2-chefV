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
        })
      },
    },
  ],
})