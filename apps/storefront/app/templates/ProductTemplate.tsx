import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { useCart } from '@app/hooks/useCart';
import { useRegion } from '@app/hooks/useRegion';
import { ProductImageGallery } from '@app/components/product/ProductImageGallery';
import { ProductPrice } from '@app/components/product/ProductPrice';
import { ProductPriceRange } from '@app/components/product/ProductPriceRange';
import { Breadcrumb, Breadcrumbs } from '@app/components/common/breadcrumbs/Breadcrumbs';
import { Button } from '@app/components/common/buttons/Button';
import { SubmitButton } from '@app/components/common/buttons/SubmitButton';
import { Container } from '@app/components/common/container/Container';
import { Form } from '@app/components/common/forms/Form';
import { FormError } from '@app/components/common/forms/FormError';
import { FieldGroup } from '@app/components/common/forms/fields/FieldGroup';
import { Grid } from '@app/components/common/grid/Grid';
import { GridColumn } from '@app/components/common/grid/GridColumn';
import { Share } from '@app/components/share';
import { Link, useFetcher } from '@remix-run/react';
import { withYup } from '@remix-validated-form/with-yup';
import truncate from 'lodash/truncate';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import * as Yup from 'yup';
import { LineItemActions } from '@app/routes/api.cart.line-items';
import {
  getFilteredOptionValues,
  getOptionValuesWithDiscountLabels,
  selectVariantFromMatrixBySelectedOptions,
  selectVariantMatrix,
} from '@libs/util/products';
import { useProductInventory } from '@app/hooks/useProductInventory';
import { FieldLabel } from '@app/components/common/forms/fields/FieldLabel';
import { QuantitySelector } from '@app/components/common/field-groups/QuantitySelector';
import { StoreProduct, StoreProductOptionValue, StoreProductVariant } from '@medusajs/types';
import { Validator } from 'remix-validated-form';
import ProductList from '@app/components/sections/ProductList';
import { DatePicker } from '@app/components/common/forms/fields/DatePicker';
import { TimePicker } from '@app/components/common/forms/fields/TimePicker';
import { Select } from '@app/components/common/forms/fields/Select';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { DateTime } from 'luxon';
import { HomeIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

interface EventType {
  id: string;
  label: string;
  description: string;
}

const EVENT_TYPES: EventType[] = [
  {
    id: 'cooking_class',
    label: "Chef's Cooking Class",
    description: 'Interactive cooking experience where guests cook along with the chef'
  },
  {
    id: 'plated_dinner',
    label: 'Plated Dinner Service',
    description: 'Formal dining experience with individually plated courses'
  },
  {
    id: 'buffet_style',
    label: 'Buffet Style Service',
    description: 'Casual dining setup with self-service stations'
  }
];

const LOCATION_TYPES = [
  {
    value: 'customer_location',
    label: 'My Location',
    description: 'Chef will come to your provided location',
    icon: HomeIcon
  },
  {
    value: 'chef_location',
    label: "Chef's Location",
    description: 'Event will be held at a location provided by the chef',
    icon: BuildingStorefrontIcon
  }
];

export interface AddToCartFormValues {
  productId: string;
  requestedDate: string;
  requestedTime: string;
  partySize: number;
  eventType: string;
  locationType: string;
  locationAddress?: string;
}

export const getAddToCartValidator = (product: StoreProduct): Validator<AddToCartFormValues> => {
  const schemaShape: Record<keyof AddToCartFormValues, Yup.AnySchema> = {
    productId: Yup.string().required('Product ID is required'),
    requestedDate: Yup.string().required('Please select a date'),
    requestedTime: Yup.string().required('Please select a time'),
    partySize: Yup.number()
      .required('Please specify party size')
      .min(1, 'Minimum party size is 1')
      .max(20, 'Maximum party size is 20'),
    eventType: Yup.string()
      .required('Please select an event type')
      .oneOf(
        EVENT_TYPES.map(type => type.id), 
        'Please select a valid event type'
      ),
    locationType: Yup.string()
      .required('Please select a location type')
      .oneOf(LOCATION_TYPES.map(type => type.value), 'Invalid location type'),
    locationAddress: Yup.string().when('locationType', {
      is: 'customer_location',
      then: (schema) => schema.required('Please provide the event location'),
      otherwise: (schema) => schema.optional(),
    }),
  };

  return withYup(Yup.object().shape(schemaShape)) as Validator<AddToCartFormValues>;
};

const getBreadcrumbs = (product: StoreProduct) => {
  const breadcrumbs: Breadcrumb[] = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIcon className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: `/`,
    },
    {
      label: 'All Products',
      url: '/products',
    },
  ];

  if (product.collection) {
    breadcrumbs.push({
      label: product.collection.title,
      url: `/collections/${product.collection.handle}`,
    });
  }

  return breadcrumbs;
};

export interface ProductTemplateProps {
  product: StoreProduct & { 
    menu: {
      name: string;
      courses: {
        name: string;
      }[];
    } 
  };
}

export const ProductTemplate = ({ product }: ProductTemplateProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const addToCartFetcher = useFetcher<any>();
  const { toggleCartDrawer } = useCart();
  const { region } = useRegion();
  const hasErrors = Object.keys(addToCartFetcher.data?.fieldErrors || {}).length > 0;
  const isSubmitting = ['submitting', 'loading'].includes(addToCartFetcher.state);
  const validator = getAddToCartValidator(product);

  const defaultValues: AddToCartFormValues = {
    productId: product.id!,
    requestedDate: '',
    requestedTime: '',
    partySize: 2,
    eventType: '',
    locationType: '',
    locationAddress: '',
  };

  const breadcrumbs = getBreadcrumbs(product);
  const currencyCode = region.currency_code;

  const isUnavailable = false;

  const [locationType, setLocationType] = useState('');
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);

  const handleLocationTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocationType(e.target.value);
  };

  const nextLocation = () => {
    setCurrentLocationIndex((prev) => (prev + 1) % LOCATION_TYPES.length);
    setLocationType(LOCATION_TYPES[(currentLocationIndex + 1) % LOCATION_TYPES.length].value);
  };

  const prevLocation = () => {
    setCurrentLocationIndex((prev) => (prev - 1 + LOCATION_TYPES.length) % LOCATION_TYPES.length);
    setLocationType(LOCATION_TYPES[(currentLocationIndex - 1 + LOCATION_TYPES.length) % LOCATION_TYPES.length].value);
  };

  useEffect(() => {
    if (!isSubmitting && !hasErrors) {
      formRef.current?.reset();
    }
  }, [isSubmitting, hasErrors]);

  return (
    <>
      <section className="pb-12 pt-12 xl:pt-24 min-h-screen">
        <Form<AddToCartFormValues, LineItemActions.CREATE>
          id="addToCartForm"
          formRef={formRef}
          fetcher={addToCartFetcher}
          encType="multipart/form-data"
          method="post"
          action={`/api/cart/line-items`}
          subaction={LineItemActions.CREATE}
          defaultValues={defaultValues}
          validator={validator}
          onSubmit={(values) => {
            console.log('Form submitted with values:', {
              menu: product.menu.name,
              ...values,
              requestedDate: values.requestedDate ? 
                DateTime.fromISO(values.requestedDate).toLocaleString(DateTime.DATE_FULL) : 
                'No date selected',
              requestedTime: values.requestedTime ? 
                DateTime.fromFormat(values.requestedTime, 'HH:mm').toLocaleString(DateTime.TIME_SIMPLE) :
                'No time selected'
            });

            const formData = new FormData(formRef.current as HTMLFormElement);
            console.log('Raw form data:', Object.fromEntries(formData.entries()));
          }}
        >
          <input type="hidden" name="productId" value={product.id} />

          <Container className="px-0 sm:px-6 md:px-8">
            <Grid>
              <GridColumn className="mb-8 md:col-span-6 lg:col-span-7 xl:pr-16 xl:pl-9">
                <ProductImageGallery product={product} />
              </GridColumn>

              <GridColumn className="flex flex-col md:col-span-6 lg:col-span-5">
                <div className="px-0 sm:px-6 md:p-10 md:pt-0">
                  <div>
                    <Breadcrumbs className="mb-6 text-primary" breadcrumbs={breadcrumbs} />
                    <header className="flex gap-4">
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:tracking-tight">
                        {product.title}
                      </h1>
                      <div className="flex-1" />
                      <Share
                        itemType="product"
                        shareData={{
                          title: product.title,
                          text: truncate(product.description || 'Check out this product', {
                            length: 200,
                            separator: ' ',
                          }),
                        }}
                      />
                    </header>
                  </div>

                  <section aria-labelledby="product-information" className="mt-4">
                    <h2 id="product-information" className="sr-only">
                      Product information
                    </h2>
                    <p className="text-lg text-gray-900 sm:text-xl">
                      <ProductPrice product={product} currencyCode={currencyCode} />
                    </p>
                  </section>

                  {!!product.menu && (
                    <div className="mt-8 space-y-4">
                      <details className="group rounded-lg border border-gray-200 [&[open]>summary]:border-b">
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-xl hover:bg-gray-50 rounded-t-lg">
                          Menu
                          <span className="text-2xl leading-none text-gray-500">
                            <span className="group-open:hidden">+</span>
                            <span className="hidden group-open:inline">−</span>
                          </span>
                        </summary>
                        <div className="p-6 space-y-6">
                          <div className="text-center space-y-4">
                            <h4 className="font-italiana text-2xl text-gray-600">CULINARY JOURNEY</h4>
                            <h2 className="text-3xl lg:text-4xl font-aboreto">{product.menu.name}</h2>
                          </div>
                          
                          <div className="space-y-4">
                            {product.menu.courses?.map((course, index) => (
                              <div 
                                key={index} 
                                className="p-6 bg-highlight-900/70 rounded-lg"
                              >
                                <div className="flex items-center gap-4 mb-2">
                                  <span className="font-italiana text-lg text-accent-900">
                                    Course {index + 1}
                                  </span>
                                  <div className="flex-1 border-b border-accent-900/20"></div>
                                </div>
                                <h3 className="font-aboreto text-xl text-gray-800">
                                  {course.name}
                                </h3>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>

                      <details className="group rounded-lg border border-gray-200 [&[open]>summary]:border-b">
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-xl hover:bg-gray-50 rounded-t-lg">
                          Event Details
                          <span className="text-2xl leading-none text-gray-500">
                            <span className="group-open:hidden">+</span>
                            <span className="hidden group-open:inline">−</span>
                          </span>
                        </summary>
                        <div className="p-4 space-y-4">
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                              <FieldLabel>Date</FieldLabel>
                              <DatePicker
                                name="requestedDate"
                                className="w-full"
                                minDate={new Date()}
                                maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                              />
                            </div>
                            
                            <div>
                              <FieldLabel>Time</FieldLabel>
                              <TimePicker
                                name="requestedTime"
                                className="w-full"
                                startTime="17:00"
                                endTime="22:00"
                                interval={30}
                              />
                            </div>
                          </div>

                          <div>
                            <FieldLabel>Number of Guests</FieldLabel>
                            <Select
                              name="partySize"
                              className="w-full"
                              options={Array.from({ length: 20 }, (_, i) => ({
                                label: `${i + 1} ${i === 0 ? 'person' : 'people'}`,
                                value: (i + 1).toString(),
                              }))}
                            />
                          </div>

                          <div>
                            <FieldLabel>Event Type</FieldLabel>
                            <Select
                              name="eventType"
                              className="w-full"
                              options={EVENT_TYPES.map(type => ({
                                value: type.id,
                                label: type.label
                              }))}
                              placeholder="Select event type"
                              onChange={(e) => {
                                const selectedType = EVENT_TYPES.find(
                                  type => type.id === e.target.value
                                );
                                const descriptionElement = formRef.current?.querySelector('.event-type-description');
                                if (selectedType && descriptionElement instanceof HTMLElement) {
                                  descriptionElement.textContent = selectedType.description;
                                }
                              }}
                            />
                            <p className="mt-1 text-sm text-gray-500 event-type-description">
                              Select an event type to see description
                            </p>
                          </div>
                        </div>
                      </details>

                      <details className="group rounded-lg border border-gray-200 [&[open]>summary]:border-b">
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-xl hover:bg-gray-50 rounded-t-lg">
                          Location Details
                          <span className="text-2xl leading-none text-gray-500">
                            <span className="group-open:hidden">+</span>
                            <span className="hidden group-open:inline">−</span>
                          </span>
                        </summary>
                        <div className="p-4 space-y-4">
                          <div>
                            <FieldLabel>Location Type</FieldLabel>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              {LOCATION_TYPES.map((type, index) => {
                                const Icon = type.icon;
                                return (
                                  <label
                                    key={type.value}
                                    className={`
                                      relative flex flex-col items-center p-4 cursor-pointer
                                      rounded-lg border transition-all duration-200
                                      ${type.value === locationType 
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                                        : 'border-gray-200 hover:border-gray-300'
                                      }
                                    `}
                                  >
                                    <input
                                      type="radio"
                                      name="locationType"
                                      value={type.value}
                                      checked={type.value === locationType}
                                      onChange={handleLocationTypeChange}
                                      className="sr-only"
                                    />
                                    <Icon className={`w-12 h-12 mb-3 ${
                                      type.value === locationType ? 'text-primary' : 'text-gray-400'
                                    }`} />
                                    <div className="text-center">
                                      <p className="font-semibold">{type.label}</p>
                                      <p className="text-sm text-gray-500 mt-1">
                                        {type.description}
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div 
                            className="location-address hidden data-[show=true]:block" 
                            data-show={locationType === 'customer_location'}
                          >
                            <FieldLabel>Event Location Address</FieldLabel>
                            <textarea
                              name="locationAddress"
                              rows={3}
                              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="Please provide the full address where the event will take place"
                            />
                          </div>
                        </div>
                      </details>
                    </div>
                  )}

                  <FormError />

                  <div className="my-2 flex flex-col gap-2">
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex-1">
                        {!isUnavailable ? (
                          <SubmitButton className="!h-12 w-full whitespace-nowrap !text-base !font-bold">
                            {isSubmitting ? 'Submitting Request...' : 'Request Booking'}
                          </SubmitButton>
                        ) : (
                          <SubmitButton
                            disabled
                            className="pointer-events-none !h-12 w-full !text-base !font-bold opacity-50"
                          >
                            Unavailable
                          </SubmitButton>
                        )}
                      </div>
                    </div>

                    {product.categories && product.categories.length > 0 && (
                      <nav aria-label="Categories" className="mt-4">
                        <h3 className="mb-2">Categories</h3>

                        <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {product.categories.map((category, categoryIndex) => (
                            <li key={categoryIndex}>
                              <Button
                                as={(buttonProps) => (
                                  <Link to={`/categories/${category.handle}`} {...buttonProps} />
                                )}
                                className="!h-auto whitespace-nowrap !rounded !px-2 !py-1 !text-xs !font-bold"
                              >
                                {category.name}
                              </Button>
                            </li>
                          ))}
                        </ol>
                      </nav>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <nav aria-label="Tags" className="mt-4">
                        <h3 className="mb-2">Tags</h3>

                        <ol className="flex flex-wrap items-center gap-2 text-xs text-primary">
                          {product.tags.map((tag, tagIndex) => (
                            <li key={tagIndex}>
                              <Button className="!h-auto whitespace-nowrap !rounded !px-2 !py-1 !text-xs !font-bold bg-accent-900 cursor-default">
                                {tag.value}
                              </Button>
                            </li>
                          ))}
                        </ol>
                      </nav>
                    )}
                  </div>
                </div>
              </GridColumn>
            </Grid>
          </Container>
        </Form>
      </section>
      
      <ProductList className="!pb-[100px] xl:px-9" heading="You may also like" />
    </>
  );
};
