import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';
import { useRegion } from '@app/hooks/useRegion';
import { ProductImageGallery } from '@app/components/product/ProductImageGallery';
import { ProductPrice } from '@app/components/product/ProductPrice';
import { Breadcrumb, Breadcrumbs } from '@app/components/common/breadcrumbs/Breadcrumbs';
import { Container } from '@app/components/common/container/Container';
import { Grid } from '@app/components/common/grid/Grid';
import { GridColumn } from '@app/components/common/grid/GridColumn';
import { Share } from '@app/components/share';
import { Link } from '@remix-run/react';
import truncate from 'lodash/truncate';
import { ProductWithMenu } from '@app/types/events';

// Define the event interface
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: {
    type: 'customer_location' | 'chef_location';
    address?: string;
  };
  partySize: number;
  eventType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  product: ProductWithMenu;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  notes?: string;
}

export interface EventTemplateProps {
  event: Event;
}

const getBreadcrumbs = (event: Event) => {
  const breadcrumbs: Breadcrumb[] = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIconSolid className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: `/`,
    },
    {
      label: 'Events',
      url: '/events',
    },
  ];

  return breadcrumbs;
};

export const EventTemplate = ({ event }: EventTemplateProps) => {
  const { region } = useRegion();
  const breadcrumbs = getBreadcrumbs(event);
  const currencyCode = region.currency_code;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventTypeLabel = (type: string) => {
    const types = {
      cooking_class: "Chef's Cooking Class",
      plated_dinner: 'Plated Dinner Service',
      buffet_style: 'Buffet Style Service',
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusBadgeClass = (status: Event['status']) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return classes[status];
  };

  return (
    <section className="pb-12 pt-12 xl:pt-24">
      <Container>
        <Grid>
          <GridColumn className="mb-8 md:col-span-6 lg:col-span-7 xl:pr-16 xl:pl-9">
            <ProductImageGallery product={event.product} />
          </GridColumn>

          <GridColumn className="flex flex-col md:col-span-6 lg:col-span-5">
            <div className="px-0 sm:px-6 md:p-10 md:pt-0">
              <Breadcrumbs className="mb-6 text-primary" breadcrumbs={breadcrumbs} />
              
              <header className="flex gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      {event.title}
                    </h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-lg text-gray-600">
                    <ProductPrice product={event.product} currencyCode={currencyCode} />
                  </p>
                </div>
                <div className="flex-1" />
                <Share
                  itemType="event"
                  shareData={{
                    title: event.title,
                    text: truncate(event.description || 'Check out this event', {
                      length: 200,
                      separator: ' ',
                    }),
                  }}
                />
              </header>

              <div className="mt-8 space-y-8">
                {/* Event Details */}
                <div className="space-y-6">
                  <div className="border-t border-b border-gray-200 py-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Time</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          {formatTime(event.time)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {getEventTypeLabel(event.eventType)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Party Size</h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {event.partySize} {event.partySize === 1 ? 'person' : 'people'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {event.location.type === 'customer_location' ? 'Customer Location' : "Chef's Location"}
                      </p>
                      {event.location.address && (
                        <p className="mt-1 text-gray-500">{event.location.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Menu Details */}
                  {event.product.menu && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Menu Details</h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-4">{event.product.menu.name}</h4>
                        <div className="space-y-6">
                          {event.product.menu.courses?.map((course, index) => (
                            <div key={course.id} className="space-y-2">
                              <h5 className="font-medium text-gray-900">{course.name}</h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {course.dishes?.map((dish) => (
                                  <li key={dish.id}>{dish.name}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {event.notes && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-gray-900">Special Notes</h3>
                      <p className="text-gray-600">{event.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GridColumn>
        </Grid>
      </Container>
    </section>
  );
}; 