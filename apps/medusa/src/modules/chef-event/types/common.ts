import type { Product } from "@medusajs/medusa"

export type ChefEvent = {
  id: string
  status: string
  requestedDate: string
  requestedTime: string
  partySize: number
  eventType: string
  locationType: string
  locationAddress: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  totalPrice: number
  depositPaid: boolean
  specialRequirements: string
  estimatedDuration: number
  assignedChefId: string
  templateProductId: string
  created_at: Date
  updated_at: Date
}

export type GetTemplateProductStepData = {
  product: Product
  totalPrice: number
  pricePerPerson: number
}

export type NotificationData = {
  chefEvent: ChefEvent
  templateProduct: Product
  pricePerPerson: number
  totalPrice: number
  hasConflictingEvent: boolean
  customer: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  productName?: string
} 