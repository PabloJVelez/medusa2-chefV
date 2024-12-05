import { sdk } from '@libs/util/server/client.server';

interface EventRequest {
  productId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  requestedDate: string;
  requestedTime: string;
  productName?: string;
}

interface EventResponse {
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

    return response as EventResponse;
  } catch (error) {
    console.error('Error creating chef event:', error);
    throw error;
  }
};

