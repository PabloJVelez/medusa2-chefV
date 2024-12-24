import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { EventTemplate } from '@app/templates/EventTemplate';
import type { Event } from '@app/templates/EventTemplate';
import { sdk } from '@libs/util/server/client.server';
import type { EventResponse, ChefEvent } from '@app/types/events';
import { fetchProducts } from '@libs/util/server/products.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {

  if (!params.eventId) {
    return redirect('/404');
  }

  try {
    const response = await sdk.client.fetch<EventResponse>(`/admin/events/${params.eventId}`);
    const productData = await fetchProducts(request, {
      id: response.chefEvent.product_id,
      fields: '*categories,+menu.*,menu.courses.*, menu.courses.dishes.*, +variants.inventory_quantity'
    })
    if (!response.chefEvent) {
      console.log('No event found');
      return redirect('/404');
    }

    const chefEvent = response.chefEvent;

    // Transform ChefEvent into Event format for the template
    const event: Event = {
      id: chefEvent.id,
      title: productData.products[0].title,
      description: productData.products[0].description || undefined,
      date: chefEvent.date || new Date().toISOString(),
      time: chefEvent.time || '19:00',
      location: chefEvent.location || {
        type: 'chef_location' as const,
        address: '123 Chef Street, Culinary City, CC 12345'
      },
      partySize: chefEvent.partySize || 4,
      eventType: chefEvent.eventType || 'plated_dinner',
      status: chefEvent.status || 'pending',
      product: productData.products[0],
      customer: chefEvent.customer || {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 000-0000'
      },
      notes: chefEvent.notes || 'No special notes provided.'
    };

    return { event };

  } catch (error) {
    console.error('Error in event loader:', error);
    return redirect('/404');
  }
};

export default function EventDetailRoute() {
  const { event } = useLoaderData<typeof loader>();

  if (!event) {
    return <div>404</div>;
  }

  return <EventTemplate event={event} />;
}
