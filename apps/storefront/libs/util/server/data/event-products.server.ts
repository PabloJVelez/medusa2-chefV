import { parseEventSku } from '@libs/util/products';
import { StoreProduct } from '@medusajs/types';

/**
 * Gets the Medusa backend URL with fallback
 */
const getMedusaBackendUrl = () => {
  // Try environment variable first
  if (process.env.MEDUSA_BACKEND_URL) {
    return process.env.MEDUSA_BACKEND_URL;
  }
  
  // Fallback to localhost for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:9000';
  }
  
  // For production, this should be set
  console.warn('MEDUSA_BACKEND_URL not set, using fallback');
  return 'http://localhost:9000';
};

/**
 * Gets the publishable API key for backend calls
 */
const getPublishableApiKey = () => {
  // Try environment variable first
  if (process.env.MEDUSA_PUBLISHABLE_API_KEY) {
    return process.env.MEDUSA_PUBLISHABLE_API_KEY;
  }
  
  // Fallback to the key from the frontend
  return 'pk_21e94c137732dd69790c80e8743c416795277bdb855f2db7595210ead34aa540';
};

/**
 * Fetches chef event data for an event product
 * @param product - The event product
 * @returns Chef event data or null if not found
 */
export const fetchChefEventForProduct = async (product: StoreProduct) => {
  // Debug logging
  console.log('fetchChefEventForProduct called with product:', {
    id: product.id,
    title: product.title,
    variants: product.variants?.map(v => ({
      id: v.id,
      sku: v.sku,
      inventory_quantity: v.inventory_quantity
    }))
  });

  // Extract event ID from product SKU
  const eventVariant = product.variants?.find(variant => 
    variant.sku?.startsWith('EVENT-')
  );
  
  console.log('Found event variant:', eventVariant);
  
  if (!eventVariant?.sku) {
    console.log('No event variant found');
    return null;
  }
  
  const eventInfo = parseEventSku(eventVariant.sku);
  console.log('Parsed event info:', eventInfo);
  
  if (!eventInfo) {
    console.log('Failed to parse event SKU');
    return null;
  }
  
  try {
    const backendUrl = getMedusaBackendUrl();
    const publishableKey = getPublishableApiKey();
    const url = `${backendUrl}/store/chef-events/${eventInfo.eventId}`;
    
    console.log('Fetching chef event from URL:', url);
    
    // Fetch chef event data from our backend with proper headers
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey,
        'accept': 'application/json',
      },
    });
    
    console.log('Chef event response status:', response.status);
    
    if (!response.ok) {
      console.warn('Failed to fetch chef event data:', response.status, response.statusText);
      
      // Try to get more error details
      try {
        const errorText = await response.text();
        console.warn('Error response body:', errorText);
      } catch (e) {
        console.warn('Could not read error response body');
      }
      
      return null;
    }
    
    const data = await response.json();
    console.log('Chef event data received:', data);
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