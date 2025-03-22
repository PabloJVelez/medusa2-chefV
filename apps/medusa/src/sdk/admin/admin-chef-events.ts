import type { Client } from '@medusajs/js-sdk';

// Define the types for our chef events
export type AdminChefEventDTO = {
  id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  requestedDate: string
  requestedTime: string
  partySize: number
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style' | 'custom'
  templateProductId: string
  locationType: 'customer_location' | 'chef_location'
  locationAddress?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
  totalPrice?: number
  depositPaid: boolean
  specialRequirements?: string
  estimatedDuration?: number
  assignedChefId?: string
  createdAt: string
  updatedAt: string
}

export type AdminListChefEventsQuery = {
  limit?: number
  offset?: number
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  eventType?: 'cooking_class' | 'plated_dinner' | 'buffet_style' | 'custom'
  fromDate?: string
  toDate?: string
  q?: string
}

export type AdminListChefEventsResponse = {
  events: AdminChefEventDTO[]
  count: number
  limit: number
  offset: number
}

export type AdminCreateChefEventDTO = Omit<AdminChefEventDTO, 'id' | 'createdAt' | 'updatedAt'>

export type AdminUpdateChefEventDTO = Partial<Omit<AdminChefEventDTO, 'id' | 'createdAt' | 'updatedAt'>>

export class AdminChefEventsResource {
  constructor(private client: Client) {}

  /**
   * List all chef events with pagination and filtering
   */
  async list(query: AdminListChefEventsQuery = {}) {
    console.log("GETTING THE EVENTS")
    return this.client.fetch<AdminListChefEventsResponse>(`/admin/events`, {
      method: 'GET',
      query,
    });
  }

  /**
   * Get a specific chef event by ID
   */
  async retrieve(eventId: string) {
    return this.client.fetch<{ event: AdminChefEventDTO }>(`/admin/events/${eventId}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new chef event
   */   
  async create(data: AdminCreateChefEventDTO) {
    return this.client.fetch<{ event: AdminChefEventDTO }>(`/admin/events`, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Update an existing chef event
   */
  async update(eventId: string, data: AdminUpdateChefEventDTO) {
    return this.client.fetch<{ event: AdminChefEventDTO }>(`/admin/events/${eventId}`, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Delete a chef event
   */
  async delete(eventId: string) {
    return this.client.fetch<void>(`/admin/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update the status of a chef event
   */
  async updateStatus(eventId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
    return this.client.fetch<{ event: AdminChefEventDTO }>(`/admin/events/${eventId}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  /**
   * Get available menu products that can be used as templates for events
   */
  async getMenuProducts() {
    return this.client.fetch<{ products: Array<{ id: string, title: string }> }>(`/admin/products`, {
      method: 'GET',
      // query: { is_menu: true },
    });
  }
} 