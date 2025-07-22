import type { Client } from '@medusajs/js-sdk'

// Define the types for our chef events
export interface AdminChefEventDTO {
  id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  requestedDate: Date
  requestedTime: string
  partySize: number
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style'
  templateProductId?: string
  locationType: 'customer_location' | 'chef_location'
  locationAddress: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  totalPrice?: number
  depositPaid: boolean
  specialRequirements?: string
  estimatedDuration?: number
  // New acceptance/rejection fields
  productId?: string
  acceptedAt?: Date
  acceptedBy?: string
  rejectionReason?: string
  chefNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AdminCreateChefEventDTO {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  requestedDate: string
  requestedTime: string
  partySize: number
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style'
  templateProductId?: string
  locationType: 'customer_location' | 'chef_location'
  locationAddress: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  totalPrice?: number
  depositPaid?: boolean
  specialRequirements?: string
  estimatedDuration?: number
}

export interface AdminUpdateChefEventDTO {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  requestedDate?: string
  requestedTime?: string
  partySize?: number
  eventType?: 'cooking_class' | 'plated_dinner' | 'buffet_style'
  templateProductId?: string
  locationType?: 'customer_location' | 'chef_location'
  locationAddress?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  notes?: string
  totalPrice?: number
  depositPaid?: boolean
  specialRequirements?: string
  estimatedDuration?: number
  // New acceptance/rejection fields
  productId?: string
  acceptedAt?: Date
  acceptedBy?: string
  rejectionReason?: string
  chefNotes?: string
}

export interface AdminListChefEventsQuery {
  limit?: number
  offset?: number
  q?: string
  status?: string
  eventType?: string
  locationType?: string
}

export interface AdminChefEventsResponse {
  chefEvents: AdminChefEventDTO[]
  count: number
  limit: number
  offset: number
}

export interface AdminAcceptChefEventDTO {
  chefNotes?: string
  acceptedBy?: string
}

export interface AdminRejectChefEventDTO {
  rejectionReason: string
  chefNotes?: string
  rejectedBy?: string
}

export class AdminChefEventsResource {
  constructor(private client: Client) {}

  /**
   * List chef events
   * @param query - Query parameters
   * @returns List of chef events
   */
  async list(query: AdminListChefEventsQuery = {}) {
    return this.client.fetch<AdminChefEventsResponse>(`/admin/chef-events`, {
      method: 'GET',
      query,
    })
  }

  /**
   * Retrieve a chef event
   * @param id - Chef event ID
   * @returns Chef event details
   */
  async retrieve(id: string) {
    const response = await this.client.fetch<{ chefEvent: AdminChefEventDTO }>(`/admin/chef-events/${id}`, {
      method: 'GET',
    })
    return response.chefEvent
  }

  /**
   * Create a chef event
   * @param data - Chef event data
   * @returns Created chef event
   */
  async create(data: AdminCreateChefEventDTO) {
    const response = await this.client.fetch<{ chefEvent: AdminChefEventDTO }>(`/admin/chef-events`, {
      method: 'POST',
      body: data,
    })
    return response.chefEvent
  }

  /**
   * Update a chef event
   * @param id - Chef event ID
   * @param data - Chef event data
   * @returns Updated chef event
   */
  async update(id: string, data: AdminUpdateChefEventDTO) {
    const response = await this.client.fetch<{ chefEvent: AdminChefEventDTO }>(`/admin/chef-events/${id}`, {
      method: 'POST',
      body: data,
    })
    return response.chefEvent
  }

  /**
   * Delete a chef event
   * @param id - Chef event ID
   * @returns Deleted chef event
   */
  async delete(id: string) {
    const response = await this.client.fetch<{ deleted: boolean }>(`/admin/chef-events/${id}`, {
      method: 'DELETE',
    })
    return response
  }

  /**
   * Accept a chef event
   * @param id - Chef event ID
   * @param data - Acceptance data
   * @returns Acceptance result
   */
  async accept(id: string, data: AdminAcceptChefEventDTO = {}) {
    const response = await this.client.fetch<{ success: boolean; data: any }>(`/admin/chef-events/${id}/accept`, {
      method: 'POST',
      body: data,
    })
    return response
  }

  /**
   * Reject a chef event
   * @param id - Chef event ID
   * @param data - Rejection data
   * @returns Rejection result
   */
  async reject(id: string, data: AdminRejectChefEventDTO) {
    const response = await this.client.fetch<{ success: boolean; data: any }>(`/admin/chef-events/${id}/reject`, {
      method: 'POST',
      body: data,
    })
    return response
  }

  /**
   * Get available menu products that can be used as templates for events
   */
  async getMenuProducts() {
    return this.client.fetch<{ products: Array<{ id: string, title: string }> }>(`/admin/products`, {
      method: 'GET',
    })
  }
}