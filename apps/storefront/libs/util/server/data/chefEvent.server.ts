import { sdk } from '@libs/util/server/client.server';

export interface EventRequest {
  productId: string;
  menuId: string;
  requestedDate: string;
  requestedTime: string;
  partySize: number;
  eventType: string;
  locationType: string;
  locationAddress?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface EventResponse {
  success: boolean;
  message: string;
  data?: {
    requestId: string;
    status: string;
    customerName: string;
    eventDetails: {
      date: string;
      time: string;
      productName: string;
    };
  };
}

export const requestChefEvent = async (data: EventRequest): Promise<EventResponse> => {
  try {
    const { products } = await sdk.store.product.list({
      id: [data.productId],
      fields: 'title'
    });

    const productName = products[0]?.title || 'Unknown Menu';

    const response = await sdk.client.fetch('/store/events/create', {
      method: 'POST',
      body: {
        ...data,
        productName
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("RESPONSE FROM REQUEST CHEF EVENT", response)

    return response as EventResponse;
  } catch (error) {
    console.error('Error creating chef event:', error);
    throw error;
  }
};

