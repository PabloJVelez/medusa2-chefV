import { parseEventSku } from '@libs/util/products';
import { StoreProduct } from '@medusajs/types';

/**
 * Fetches chef event data for an event product
 * @param product - The event product
 * @returns Chef event data or null if not found
 */
export const fetchChefEventForProduct = async (product: StoreProduct) => {
  // Extract event ID from product SKU
  const eventVariant = product.variants?.find(variant => 
    variant.sku?.startsWith('EVENT-')
  );
  
  if (!eventVariant?.sku) {
    return null;
  }
  
  const eventInfo = parseEventSku(eventVariant.sku);
  if (!eventInfo) {
    return null;
  }
  
  try {
    // Fetch chef event data from our backend
    const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/chef-events/${eventInfo.eventId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch chef event data:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.chefEvent;
  } catch (error) {
    console.error('Error fetching chef event data:', error);
    return null;
  }
};

/**
 * Fetches menu data for an event product
 * @param product - The event product
 * @returns Menu data or null if not found
 */
export const fetchMenuForProduct = async (product: StoreProduct) => {
  // Extract menu ID from product description or metadata
  // For now, we'll return null as menu linking is not yet implemented
  return null;
}; 