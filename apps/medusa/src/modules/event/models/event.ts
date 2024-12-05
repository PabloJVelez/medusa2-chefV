
import { model } from "@medusajs/framework/utils"

export const Event = model.define("event", {
   // Primary key
  id: model.id().primaryKey(),
  
  // Product linkage
  productId: model.id(),
  
  // Event Details
  name: model.text(),
  description: model.text(),
  
  // Capacity and Timing
  minPartySize: model.number(),
  maxPartySize: model.number(),
  duration: model.number(), // in minutes
  
  // Event Type Configuration
  allowedEventTypes: model.enum([
    'cooking_class',
    'plated_dinner', 
    'buffet_style'
  ]),
  
  // Location Configuration
  location: model.text(),
  
  // Pricing
  basePrice: model.number(),
  pricePerGuest: model.number(),
  depositPercentage: model.number(),
  
  // Availability
  leadTimeHours: model.number(), // minimum hours before event
  maxAdvanceBookingDays: model.number(), // how far in advance can book
  
  // Metadata
  metadata: model.json(),
})