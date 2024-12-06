import { model } from "@medusajs/framework/utils"

export const ChefEvent = model.define("chef_event", {
  // Basic fields
  id: model.id().primaryKey(),
  status: model.enum([
    'pending',
    'confirmed', 
    'cancelled',
    'completed'
  ]).default('pending'),
  
  // Event details
  requestedDate: model.dateTime(),
  requestedTime: model.text(), // Format: HH:mm
  partySize: model.number(),
  eventType: model.enum([
    'cooking_class',
    'plated_dinner',
    'buffet_style'
  ]),
  
  // Location details
  locationType: model.enum([
    'customer_location',
    'chef_location'
  ]),
  locationAddress: model.text(),
  
  // Contact information
  firstName: model.text(),
  lastName: model.text(),
  email: model.text(),
  phone: model.text(),
  notes: model.text(),
  
  // Additional event-specific fields
  totalPrice: model.bigNumber(),
  depositPaid: model.boolean().default(false),
  specialRequirements: model.text(),
  estimatedDuration: model.number(), // Duration in minutes
  
}).cascades({
  delete: [] // Add any cascading deletes if needed
})

export default ChefEvent

export type ChefEventType = {
  id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  requestedDate: Date
  requestedTime: string
  partySize: number
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style'
  locationType: 'customer_location' | 'chef_location'
  locationAddress?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  menu?: { id: string }
  createdAt: Date
  updatedAt: Date
  totalPrice?: number
  depositPaid: boolean
  specialRequirements?: string
  estimatedDuration?: number
  assignedChefId?: string
}