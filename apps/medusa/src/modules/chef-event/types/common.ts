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
