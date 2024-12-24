import { StoreProduct } from "@medusajs/types";

export interface MenuDish {
  id: string;
  name: string;
  description?: string;
}

export interface MenuCourse {
  id: string;
  name: string;
  dishes: MenuDish[];
}

export interface Menu {
  id: string;
  name: string;
  courses: MenuCourse[];
}

// Extend StoreProduct to include menu
export interface ProductWithMenu extends StoreProduct {
  menu: Menu;
}

export interface ChefEvent {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  product: ProductWithMenu;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  date?: string;
  time?: string;
  location?: {
    type: 'customer_location' | 'chef_location';
    address?: string;
  };
  partySize?: number;
  eventType?: string;
  notes?: string;
}

export type EventResponse = {
  chefEvent: {
    id: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    date: string;
    time: string;
    location: {
      type: 'customer_location' | 'chef_location';
      address: string;
    };
    partySize: number;
    eventType: string;
    notes: string;
    customer?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    product: {
      menu?: {
        id: string;
        name: string;
        courses: Array<{
          id: string;
          name: string;
          dishes: Array<{
            id: string;
            name: string;
            description: string;
          }>;
        }>;
      };
    } & StoreProduct;
    product_id: string;
  };
}; 