import type { Client } from '@medusajs/js-sdk';

// Define the types for our menus
export type AdminMenuDTO = {
  id: string
  name: string
  courses: AdminCourseDTO[]
  createdAt: string
  updatedAt: string
}

export type AdminCourseDTO = {
  id: string
  name: string
  dishes: AdminDishDTO[]
}

export type AdminDishDTO = {
  id: string
  name: string
  description: string | null
  ingredients: AdminIngredientDTO[]
}

export type AdminIngredientDTO = {
  id: string
  name: string
  optional: boolean | null
}

export type AdminListMenusQuery = {
  limit?: number
  offset?: number
  q?: string
  product_ids?: string[]
}

export type AdminListMenusResponse = {
  menus: AdminMenuDTO[]
  count: number
  limit: number
  offset: number
}

export type AdminCreateMenuDTO = {
  name: string
  courses: {
    name: string
    dishes: {
      name: string
      description?: string
      ingredients: {
        name: string
        optional?: boolean
      }[]
    }[]
  }[]
}

export type AdminUpdateMenuDTO = Partial<AdminCreateMenuDTO>

export class AdminMenusResource {
  constructor(private client: Client) {}

  /**
   * List all menus with pagination and filtering
   */
  async list(query: AdminListMenusQuery = {}) {
    return this.client.fetch<AdminListMenusResponse>(`/admin/menus`, {
      method: 'GET',
      query,
    });
  }

  /**
   * Get a specific menu by ID
   */
  async retrieve(menuId: string) {
    return this.client.fetch<{ menu: AdminMenuDTO }>(`/admin/menus/${menuId}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new menu
   */   
  async create(data: AdminCreateMenuDTO) {
    return this.client.fetch<{ menu: AdminMenuDTO }>(`/admin/menus`, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Update an existing menu
   */
  async update(menuId: string, data: AdminUpdateMenuDTO) {
    return this.client.fetch<{ menu: AdminMenuDTO }>(`/admin/menus/${menuId}`, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Delete a menu
   */
  async delete(menuId: string) {
    return this.client.fetch<void>(`/admin/menus/${menuId}`, {
      method: 'DELETE',
    });
  }
} 