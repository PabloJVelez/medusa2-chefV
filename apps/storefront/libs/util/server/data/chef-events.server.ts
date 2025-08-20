import { baseMedusaConfig } from '../client.server';

export interface StoreChefEventDTO {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  requestedDate: string;
  requestedTime: string;
  partySize: number;
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style';
  templateProductId?: string;
  locationType: 'customer_location' | 'chef_location';
  locationAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  totalPrice: number;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreCreateChefEventDTO {
  requestedDate: string;
  requestedTime: string;
  partySize: number;
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style';
  templateProductId?: string;
  locationType: 'customer_location' | 'chef_location';
  locationAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  specialRequirements?: string;
}

export interface StoreChefEventResponse {
  chefEvent: StoreChefEventDTO;
  message: string;
}

export interface ChefEventError {
  message: string;
  errors?: Array<{
    code: string;
    path: string[];
    message: string;
  }>;
}

// Import pricing structure from shared constants
import { PRICING_STRUCTURE } from '@libs/constants/pricing';
export { PRICING_STRUCTURE };

// Calculate total price for an event
export const calculateEventPrice = (
  eventType: keyof typeof PRICING_STRUCTURE,
  partySize: number
): number => {
  return PRICING_STRUCTURE[eventType] * partySize;
};

// Create a chef event request
export const createChefEventRequest = async (
  data: StoreCreateChefEventDTO
): Promise<StoreChefEventResponse> => {
  console.log('🌐 API CLIENT: Starting chef event request to backend');
  console.log('🌐 API CLIENT: Request data:', {
    eventType: data.eventType,
    partySize: data.partySize,
    requestedDate: data.requestedDate,
    requestedTime: data.requestedTime,
    email: data.email,
    baseUrl: baseMedusaConfig.baseUrl,
    hasApiKey: !!baseMedusaConfig.publishableKey,
  });
  
  console.log('🌐 API CLIENT: Detailed date validation:', {
    requestedDate: data.requestedDate,
    dateType: typeof data.requestedDate,
    dateLength: data.requestedDate?.length,
    isValidISOString: data.requestedDate ? !isNaN(Date.parse(data.requestedDate)) : false,
    sampleParseResult: data.requestedDate ? new Date(data.requestedDate) : null,
  });

  try {
    const requestUrl = `${baseMedusaConfig.baseUrl}/store/chef-events`;
    console.log('🌐 API CLIENT: Making request to:', requestUrl);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': baseMedusaConfig.publishableKey || '',
      },
      body: JSON.stringify(data),
    });

    console.log('🌐 API CLIENT: Response status:', response.status);
    console.log('🌐 API CLIENT: Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log('🌐 API CLIENT: Response data:', responseData);

    if (!response.ok) {
      console.log('❌ API CLIENT: Request failed with status:', response.status);
      
      // Handle validation errors
      if (response.status === 400 && responseData.errors) {
        console.log('❌ API CLIENT: Validation errors:', responseData.errors);
        const error: ChefEventError = {
          message: responseData.message || 'Validation error',
          errors: responseData.errors,
        };
        throw error;
      }

      // Handle other errors
      console.log('❌ API CLIENT: Other error:', responseData.message);
      throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ API CLIENT: Chef event request successful');
    return responseData;
  } catch (error) {
    console.error('💥 API CLIENT: Error in createChefEventRequest:', error);
    
    // Re-throw ChefEventError as-is
    if (error && typeof error === 'object' && 'errors' in error) {
      console.log('💥 API CLIENT: Re-throwing validation error');
      throw error;
    }

    // Wrap other errors
    const wrappedError = new Error(
      error instanceof Error 
        ? `Failed to create chef event request: ${error.message}`
        : 'Failed to create chef event request: Unknown error'
    );
    console.error('💥 API CLIENT: Wrapped error:', wrappedError.message);
    throw wrappedError;
  }
};

// Validate event request data before submission
export const validateEventRequest = (data: StoreCreateChefEventDTO): string[] => {
  const errors: string[] = [];

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.requestedDate) {
    errors.push('Event date is required');
  } else {
    const eventDate = new Date(data.requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      errors.push('Event date cannot be in the past');
    }
  }

  if (!data.requestedTime?.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    errors.push('Invalid time format (use HH:MM)');
  }

  if (!data.partySize || data.partySize < 2) {
    errors.push('Minimum party size is 2');
  } else if (data.partySize > 50) {
    errors.push('Maximum party size is 50');
  }

  if (!data.eventType) {
    errors.push('Event type is required');
  }

  if (!data.locationType) {
    errors.push('Location type is required');
  }

  if (!data.locationAddress?.trim() || data.locationAddress.length < 10) {
    errors.push('Address must be at least 10 characters');
  }

  return errors;
}; 