import type { Client } from '@medusajs/js-sdk'

// Define the types for our chef events
export interface AdminChefEventDTO {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface AdminCreateChefEventDTO {
  name: string
  description?: string
  start_date: string
  end_date: string
}

export interface AdminUpdateChefEventDTO {
  name?: string
  description?: string
  start_date?: string
  end_date?: string
}

export interface AdminListChefEventsQuery {
  limit?: number
  offset?: number
  order?: string
  expand?: string[]
  fields?: string[]
}

export interface AdminChefEventsResponse {
  events: AdminChefEventDTO[]
  count: number
  offset: number
  limit: number
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
    return this.client.fetch<AdminChefEventDTO>(`/admin/chef-events/${id}`, {
      method: 'GET',
    })
  }

  /**
   * Create a chef event
   * @param data - Chef event data
   * @returns Created chef event
   */
  async create(data: AdminCreateChefEventDTO) {
    return this.client.fetch<AdminChefEventDTO>(`/admin/chef-events`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Update a chef event
   * @param id - Chef event ID
   * @param data - Chef event data
   * @returns Updated chef event
   */
  async update(id: string, data: AdminUpdateChefEventDTO) {
    return this.client.fetch<AdminChefEventDTO>(`/admin/chef-events/${id}`, {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Delete a chef event
   * @param id - Chef event ID
   * @returns Deleted chef event
   */
  async delete(id: string) {
    return this.client.fetch<AdminChefEventDTO>(`/admin/chef-events/${id}`, {
      method: 'DELETE',
    })
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