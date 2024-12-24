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
import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCart } from '@app/hooks/useCart';
import { Button } from '@app/components/common/buttons/Button';
import { SubmitButton } from '@app/components/common/buttons/SubmitButton';
import { Form } from '@app/components/common/forms/Form';
import { FormError } from '@app/components/common/forms/FormError';
import { QuantitySelector } from '@app/components/common/field-groups/QuantitySelector';
import { useFetcher } from '@remix-run/react';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { LineItemActions } from '@app/routes/api.cart.line-items';
import { useProductInventory } from '@app/hooks/useProductInventory';
import type { Validator } from 'remix-validated-form';
import { StoreProduct } from '@medusajs/types';

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
  product: StoreProduct;
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

interface ExpandableSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const ExpandableSection = ({ title, defaultOpen = false, children }: ExpandableSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200 py-6">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

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

export interface AddToCartFormValues {
  productId: string;
  quantity?: number;
}

export const getAddToCartValidator = (): Validator<AddToCartFormValues> => {
  const schemaShape: Record<keyof AddToCartFormValues, Yup.AnySchema> = {
    productId: Yup.string().required('Product ID is required'),
    quantity: Yup.number().optional(),
  };

  return withYup(Yup.object().shape(schemaShape)) as Validator<AddToCartFormValues>;
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

  const [currentTab, setCurrentTab] = useState<'menu' | 'event'>('menu');

  const formRef = useRef<HTMLFormElement>(null);
  const addToCartFetcher = useFetcher<any>();
  const { toggleCartDrawer } = useCart();
  const hasErrors = Object.keys(addToCartFetcher.data?.fieldErrors || {}).length > 0;
  const isSubmitting = ['submitting', 'loading'].includes(addToCartFetcher.state);
  const validator = getAddToCartValidator();

  const defaultValues: AddToCartFormValues = {
    productId: event.product.id,
    quantity: 1,
  };

  const productInventory = useProductInventory(event.product);
  console.log("EVENT", event)
  console.log("EVENT PRODUCT", event.product)
  console.log("PRODUCT INVENTORY ====>", productInventory);
  const soldOut = productInventory.averageInventory === 0;

  useEffect(() => {
    if (!isSubmitting && !hasErrors) {
      formRef.current?.reset();
    }
  }, [isSubmitting, hasErrors]);

  return (
    <section className="pb-12 pt-12 xl:pt-24">
      <Form<AddToCartFormValues, LineItemActions.CREATE>
        id="addToCartForm"
        formRef={formRef}
        fetcher={addToCartFetcher}
        encType="multipart/form-data"
        method="post"
        action="/api/cart/line-items"
        subaction={LineItemActions.CREATE}
        defaultValues={defaultValues}
        validator={validator}
        onSubmit={() => {
          toggleCartDrawer(true);
        }}
      >
        <input type="hidden" name="productId" value={event.product.id} />

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
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {event.title}
                      </h1>
                    </div>
                    <p className="mt-2 text-lg text-gray-600">
                      <ProductPrice product={event.product} currencyCode={currencyCode} />
                    </p>
                  </div>
                  <div className="flex-1" />
                  <Share
                    itemType="product"
                    shareData={{
                      title: event.title,
                      text: truncate(event.description || 'Check out this event', {
                        length: 200,
                        separator: ' ',
                      }),
                    }}
                  />
                </header>

                <div className="mt-8 space-y-6">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-200">
                    <button
                      type="button"
                      className={`flex-1 py-4 text-center relative ${
                        currentTab === 'menu' 
                          ? 'text-primary font-medium' 
                          : 'text-gray-500'
                      }`}
                      onClick={() => setCurrentTab('menu')}
                    >
                      Menu Details
                      {currentTab === 'menu' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-4 text-center relative ${
                        currentTab === 'event' 
                          ? 'text-primary font-medium' 
                          : 'text-gray-500'
                      }`}
                      onClick={() => setCurrentTab('event')}
                    >
                      Event Details
                      {currentTab === 'event' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="relative overflow-hidden">
                    <div 
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(${currentTab === 'event' ? '-100%' : '0'})` }}
                    >
                      {/* Menu Details Panel */}
                      <div className="w-full flex-shrink-0">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-4">{event.product.menu.name}</h4>
                          <div className="space-y-6">
                            {event.product.menu.courses?.map((course) => (
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

                      {/* Event Details Panel */}
                      <div className="w-full flex-shrink-0">
                        <div className="space-y-4">
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
                      </div>
                    </div>

                    {/* Add to Cart Section */}
                    <div className="mt-8 flex items-center gap-4">
                      {!soldOut && <QuantitySelector variant={event.product.variants?.[0]} />}
                      <div className="flex-1">
                        {!soldOut ? (
                          <SubmitButton className="!h-12 w-full whitespace-nowrap !text-base !font-bold">
                            {isSubmitting ? 'Adding...' : 'Add to cart'}
                          </SubmitButton>
                        ) : (
                          <SubmitButton
                            disabled
                            className="pointer-events-none !h-12 w-full !text-base !font-bold opacity-50"
                          >
                            Sold out
                          </SubmitButton>
                        )}
                      </div>
                    </div>
                  </div>

                  <FormError />

                </div>
              </div>
            </GridColumn>
          </Grid>
        </Container>
      </Form>
    </section>
  );
}; 