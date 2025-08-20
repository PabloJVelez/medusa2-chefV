import type { ChefEvent } from './common'

export type CreateChefEventInput = Omit<
  ChefEvent,
  'id' | 'created_at' | 'updated_at'
>

export type UpdateChefEventInput = Partial<
  Omit<ChefEvent, 'id' | 'created_at' | 'updated_at'>
> & {
  id: string
}

export type RequestEventWorkflowInput = {
  productId: string
  requestedDate: string
  requestedTime: string
  partySize: number | string
  eventType: string
  locationType: string
  locationAddress?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  productName?: string
} 