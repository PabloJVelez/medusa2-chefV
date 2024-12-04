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
import { Input } from '@app/components/common/forms/Input';

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
      label: 'All Menus',
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
        dishes: {
          name: string;
          description?: string;
        }[];
      }[];
    } 
  };
}

type Step = 'menu' | 'event' | 'location';
type StepStatus = 'pending' | 'current' | 'completed';

interface StepConfig {
  id: Step;
  label: string;
  validate: (formData: FormData) => boolean;
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
  const [currentStep, setCurrentStep] = useState<Step>('menu');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);

  const steps: StepConfig[] = [
    {
      id: 'menu',
      label: 'Menu Review',
      validate: () => true // Menu review doesn't require validation
    },
    {
      id: 'event',
      label: 'Event Details',
      validate: (formData: FormData) => {
        const date = formData.get('requestedDate');
        const time = formData.get('requestedTime');
        const partySize = formData.get('partySize');
        const eventType = formData.get('eventType');
        return Boolean(date && time && partySize && eventType);
      }
    },
    {
      id: 'location',
      label: 'Location Details',
      validate: (formData: FormData) => {
        const locationType = formData.get('locationType');
        const locationAddress = formData.get('locationAddress');
        return Boolean(locationType) && 
          (locationType === 'chef_location' || Boolean(locationAddress));
      }
    }
  ];

  const getStepStatus = (stepId: Step): StepStatus => {
    if (completedSteps.has(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const handleStepComplete = (stepId: Step) => {
    const formData = new FormData(formRef.current as HTMLFormElement);
    const step = steps.find(s => s.id === stepId);
    
    if (step?.validate(formData)) {
      setShowValidationError(false);
      setValidationMessage('');
      setCompletedSteps(prev => new Set([...prev, stepId]));
      const currentIndex = steps.findIndex(s => s.id === stepId);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id);
        if (stepId === 'menu') {
          setIsMenuExpanded(false);
        }
      }
    } else {
      setShowValidationError(true);
      if (stepId === 'event') {
        const missing = [];
        if (!formData.get('requestedDate')) missing.push('Date');
        if (!formData.get('requestedTime')) missing.push('Time');
        if (!formData.get('partySize')) missing.push('Party Size');
        if (!formData.get('eventType')) missing.push('Event Type');
        
        const formattedList = missing.reduce((message, item, index) => {
          if (index === 0) return item;
          if (index === missing.length - 1) return `${message}, and ${item}`;
          return `${message}, ${item}`;
        }, '');
        
        setValidationMessage(
          `Please complete the following: ${formattedList}`
        );
      } else if (stepId === 'location') {
        const missing = [];
        const locationType = formData.get('locationType');
        const locationAddress = formData.get('locationAddress');

        if (!locationType) {
          missing.push('Location type');
        } else if (locationType === 'customer_location' && !locationAddress?.toString().trim()) {
          missing.push('Address');
        }

        if (missing.length > 0) {
          const formattedList = missing.reduce((message, item, index) => {
            if (index === 0) return item;
            if (index === missing.length - 1) return `${message}, and ${item}`;
            return `${message}, ${item}`;
          }, '');
          
          setValidationMessage(
            `Please complete the following: ${formattedList}`
          );
        }
      }
    }
  };

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

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
    setShowValidationError(false);
    setValidationMessage('');
    if (step !== 'menu') {
      setIsMenuExpanded(false);
    }
  };

  const showSubmitButton = () => {
    const submitButton = formRef.current?.querySelector('.submit-button-container') as HTMLElement;
    if (submitButton) {
      submitButton.style.maxHeight = '100px';
      submitButton.style.opacity = '1';
    }
  };

  return (
    <>
      <section className="pb-12 pt-12 xl:pt-24 min-h-screen">
        <Form<AddToCartFormValues, LineItemActions.CREATE_CHEF_EVENT>
          id="addToCartForm"
          formRef={formRef}
          fetcher={addToCartFetcher}
          encType="multipart/form-data"
          method="post"
          action={`/api/cart/line-items`}
          subaction={LineItemActions.CREATE_CHEF_EVENT}
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
                    <div className="mt-8 space-y-8">
                      {/* Progress indicator */}
                      <div className="flex items-center justify-between px-2">
                        {steps.map((step, index) => {
                          const status = getStepStatus(step.id);
                          return (
                            <div key={step.id} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div 
                                  className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                                    transition-colors duration-200
                                    ${status === 'completed' ? 'bg-primary text-white' : 
                                      status === 'current' ? 'bg-primary/20 text-primary border-2 border-primary' :
                                      'bg-gray-100 text-gray-400'
                                    }
                                  `}
                                >
                                  {status === 'completed' ? '✓' : index + 1}
                                </div>
                                <span className={`
                                  mt-2 text-sm font-medium
                                  ${status === 'pending' ? 'text-gray-400' : 'text-gray-900'}
                                `}>
                                  {step.label}
                                </span>
                              </div>
                              {index < steps.length - 1 && (
                                <div className={`
                                  w-full h-px mx-4
                                  ${completedSteps.has(step.id) ? 'bg-primary' : 'bg-gray-200'}
                                `} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step content */}
                      <div className="space-y-4">
                        <div className={currentStep === 'menu' ? 'block' : 'hidden'}>
                          {/* Menu content */}
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() => handleStepComplete('menu')}
                              className="w-full bg-primary text-white px-6 py-3 rounded-lg 
                                        hover:bg-primary/90 transition-colors font-semibold"
                            >
                              Continue to Event Details →
                            </button>
                          </div>

                          {/* Menu display */}
                          <div className="p-8 bg-cream-50">
                            <div className="relative border-2 border-gray-800/20 p-8">
                              <div className="absolute inset-0 border-2 border-gray-800/20 m-2"></div>
                              
                              {/* Menu Header */}
                              <div className="text-center mb-12 relative">
                                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-800/20"></div>
                                <span className="relative inline-block px-4 bg-cream-50 font-italiana text-2xl text-gray-600">
                                  CULINARY JOURNEY
                                </span>
                              </div>
                              
                              {/* Menu Title */}
                              <div className="text-center mb-12">
                                <h2 className="font-aboreto text-3xl lg:text-4xl text-gray-800 mb-3">
                                  {product.menu.name}
                                </h2>
                                <div className="flex items-center justify-center gap-4">
                                  <div className="h-px w-12 bg-gray-800/20"></div>
                                  <div className="text-gray-600 font-serif italic">✦</div>
                                  <div className="h-px w-12 bg-gray-800/20"></div>
                                </div>
                              </div>
                              
                              {/* Courses */}
                              <div className="relative">
                                <div className={`space-y-8 ${!isMenuExpanded ? 'max-h-[200px] overflow-hidden' : ''}`}>
                                  {product.menu.courses?.map((course, index) => {
                                    if (!isMenuExpanded && index > 1) return null;
                                    
                                    return (
                                      <div key={index} className={`
                                        relative
                                        ${!isMenuExpanded && index === 1 ? 'opacity-60' : ''}
                                      `}>
                                        <div className="absolute -left-4 top-0 -translate-x-full 
                                                    font-italiana text-4xl text-gray-300 opacity-50 hidden lg:block">
                                          {(index + 1).toString().padStart(2, '0')}
                                        </div>
                                        
                                        <div className="relative">
                                          <div className="flex items-baseline gap-4 mb-4">
                                            <h3 className="font-aboreto text-xl text-gray-800">
                                              {course.name}
                                            </h3>
                                            <div className="flex-grow border-b border-dotted border-gray-400"></div>
                                          </div>
                                          
                                          <div className="pl-4 space-y-3">
                                            {course.dishes?.map((dish, dishIndex) => (
                                              <div key={dishIndex} className="relative">
                                                <div className="flex items-baseline gap-2">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></span>
                                                  <div className="flex-1">
                                                    <h4 className="font-serif text-gray-800">
                                                      {dish.name}
                                                    </h4>
                                                    {dish.description && (
                                                      <p className="text-sm text-gray-600 italic mt-0.5">
                                                        {dish.description}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Updated gradient overlay and expand button */}
                                {!isMenuExpanded && (
                                  <div className="absolute bottom-0 left-0 right-0">
                                    <div className="h-40 bg-gradient-to-t from-cream-50 via-cream-50/95 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                                      <button
                                        type="button"
                                        onClick={() => setIsMenuExpanded(true)}
                                        className="bg-primary text-white px-6 py-2 rounded-full 
                                               hover:bg-primary/90 transition-colors
                                               shadow-lg transform translate-y-1/2
                                               flex items-center gap-2"
                                      >
                                        <span>View Full Menu</span>
                                        <span className="text-sm">
                                          ({product.menu.courses.length} Courses)
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={currentStep === 'event' ? 'block' : 'hidden'}>
                          {/* Event details content */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => handleStepChange('menu')}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ← Back
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStepComplete('event')}
                              className={`
                                text-primary hover:text-primary/80 transition-colors
                                ${showValidationError ? 'animate-shake' : ''}
                              `}
                            >
                              Continue to Location →
                            </button>
                          </div>

                          {/* Validation error message */}
                          {showValidationError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {validationMessage}
                              </div>
                            </div>
                          )}

                          <div className="space-y-6" onChange={(e) => {
                            if (!showValidationError) return;
                            
                            // Get all required fields
                            const formData = new FormData(formRef.current as HTMLFormElement);
                            const date = formData.get('requestedDate');
                            const time = formData.get('requestedTime');
                            const partySize = formData.get('partySize');
                            const eventType = formData.get('eventType');
                            
                            // Create new missing fields array
                            const missing = [];
                            if (!date) missing.push('Date');
                            if (!time) missing.push('Time');
                            if (!partySize) missing.push('Party Size');
                            if (!eventType) missing.push('Event Type');
                            
                            if (missing.length === 0) {
                              // All fields are filled
                              setShowValidationError(false);
                              setValidationMessage('');
                            } else {
                              // Update validation message with remaining fields
                              const formattedList = missing.reduce((message, item, index) => {
                                if (index === 0) return item;
                                if (index === missing.length - 1) return `${message}, and ${item}`;
                                return `${message}, ${item}`;
                              }, '');
                              
                              setValidationMessage(
                                `Please complete the following: ${formattedList}`
                              );
                            }
                          }}>
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
                        </div>

                        <div className={currentStep === 'location' ? 'block' : 'hidden'}>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => handleStepChange('event')}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ← Back
                              </button>
                            </div>
                          </div>

                          {/* Validation error message */}
                          {showValidationError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {validationMessage}
                              </div>
                            </div>
                          )}

                          <div className="space-y-6">
                            {/* Location/Contact Carousel Navigation */}
                            <div className="flex border-b border-gray-200">
                              <button
                                type="button"
                                className={`flex-1 py-4 text-center relative ${
                                  !showContactDetails 
                                    ? 'text-primary font-medium' 
                                    : 'text-gray-500'
                                }`}
                                onClick={() => setShowContactDetails(false)}
                              >
                                Location Details
                                {!showContactDetails && (
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                              </button>
                              <button
                                type="button"
                                className={`flex-1 py-4 text-center relative ${
                                  showContactDetails 
                                    ? 'text-primary font-medium' 
                                    : 'text-gray-500'
                                }`}
                                onClick={() => setShowContactDetails(true)}
                              >
                                Contact Information
                                {showContactDetails && (
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                              </button>
                            </div>

                            {/* Carousel Container */}
                            <div className="relative overflow-hidden">
                              <div 
                                className="flex transition-transform duration-300 ease-in-out"
                                style={{ transform: `translateX(${showContactDetails ? '-100%' : '0'})` }}
                              >
                                {/* Location Details Panel */}
                                <div className="w-full flex-shrink-0">
                                  <div className="space-y-6">
                                    <div>
                                      <FieldLabel>Location Type</FieldLabel>
                                      <div className="relative grid grid-cols-2 gap-4 mt-2">
                                        {LOCATION_TYPES.map((type) => {
                                          const Icon = type.icon;
                                          return (
                                            <label
                                              key={type.value}
                                              className={`
                                                relative flex flex-col items-center p-4 cursor-pointer
                                                rounded-lg border transition-all duration-200
                                                overflow-hidden
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
                                        className="w-full rounded-md border border-gray-300 px-4 py-2 
                                                   focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                                                   appearance-none"
                                        placeholder="Please provide the full address where the event will take place"
                                      />
                                    </div>

                                    <div className="flex justify-end">
                                      <Button
                                        type="button"
                                        variant="primary"
                                        onClick={() => setShowContactDetails(true)}
                                      >
                                        Continue to Contact Details →
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact Details Panel */}
                                <div className="w-full flex-shrink-0">
                                  <div className="space-y-8">
                                    {/* Contact Info Header */}
                                    <div className="text-center">
                                      <h3 className="text-xl font-serif text-gray-900">Contact Information</h3>
                                      <p className="mt-2 text-sm text-gray-500">
                                        Please provide your details so we can contact you about your booking
                                      </p>
                                    </div>

                                    <div className="space-y-6">
                                      {/* Progressive Form Fields */}
                                      <div className="space-y-6">
                                        {/* Name Field */}
                                        <div className="relative">
                                          <Input
                                            label="Full Name"
                                            name="fullName"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            placeholder="John Doe"
                                            wrapperClassName="relative"
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const [firstName, ...lastNameParts] = value.split(' ');
                                              const lastName = lastNameParts.join(' ');
                                              
                                              // Update hidden fields
                                              const firstNameInput = formRef.current?.querySelector('input[name="firstName"]') as HTMLInputElement;
                                              const lastNameInput = formRef.current?.querySelector('input[name="lastName"]') as HTMLInputElement;
                                              if (firstNameInput) firstNameInput.value = firstName || '';
                                              if (lastNameInput) lastNameInput.value = lastName || '';
                                              
                                              // Show email field if name is entered
                                              const emailField = formRef.current?.querySelector('.email-field') as HTMLElement;
                                              if (emailField && value.includes(' ')) {
                                                emailField.style.maxHeight = '200px';
                                                emailField.style.opacity = '1';
                                              }
                                            }}
                                          />
                                          <input type="hidden" name="firstName" />
                                          <input type="hidden" name="lastName" />
                                        </div>

                                        {/* Email Field */}
                                        <div className="email-field overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                                          <Input
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="john.doe@example.com"
                                            wrapperClassName="relative"
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                                              
                                              // Show phone field if email is valid
                                              const phoneField = formRef.current?.querySelector('.phone-field') as HTMLElement;
                                              if (phoneField && isValid) {
                                                phoneField.style.maxHeight = '200px';
                                                phoneField.style.opacity = '1';
                                              }
                                            }}
                                          />
                                        </div>

                                        {/* Phone Field */}
                                        <div className="phone-field overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                                          <div className="relative">
                                            <div className="flex justify-between items-start gap-4">
                                              <Input
                                                label="Phone Number (Optional)"
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="+1 (555) 000-0000"
                                                wrapperClassName="relative flex-1"
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  const isValid = value.length >= 10;
                                                  const skipButton = formRef.current?.querySelector('.skip-phone-button') as HTMLButtonElement;
                                                  
                                                  // Show/hide skip button based on field being empty
                                                  if (skipButton) {
                                                    skipButton.style.display = value.length === 0 ? 'flex' : 'none';
                                                  }
                                                  
                                                  // Show notes field if phone is valid
                                                  const notesField = formRef.current?.querySelector('.notes-field') as HTMLElement;
                                                  if (notesField && isValid) {
                                                    notesField.style.maxHeight = '300px';
                                                    notesField.style.opacity = '1';
                                                    showSubmitButton();
                                                  }
                                                }}
                                              />
                                              <button
                                                type="button"
                                                className="skip-phone-button mt-[30px] px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 
                                                           border border-gray-200 rounded-md hover:border-gray-300
                                                           transition-colors duration-200 bg-white
                                                           flex items-center gap-1.5"
                                                onClick={(e) => {
                                                  const button = e.currentTarget;
                                                  const phoneInput = formRef.current?.querySelector('input[name="phone"]') as HTMLInputElement;
                                                  if (phoneInput) {
                                                    phoneInput.value = '';
                                                  }
                                                  
                                                  // Show notes field when skipped
                                                  const notesField = formRef.current?.querySelector('.notes-field') as HTMLElement;
                                                  if (notesField) {
                                                    notesField.style.maxHeight = '300px';
                                                    notesField.style.opacity = '1';
                                                    showSubmitButton();
                                                  }
                                                }}
                                              >
                                                Skip
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                              </button>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                              We'll only use this to contact you about your booking if needed
                                            </p>
                                          </div>
                                        </div>

                                        {/* Notes Field */}
                                        <div className="notes-field overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                                          <div className="relative">
                                            <label
                                              htmlFor="notes"
                                              className="block text-sm font-medium text-gray-600 mb-2"
                                            >
                                              Special Requests or Notes (Optional)
                                            </label>
                                            <textarea
                                              id="notes"
                                              name="notes"
                                              rows={4}
                                              className="w-full rounded-lg border border-gray-300 
                                                               py-3 px-4 transition-colors
                                                               focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 
                                                               placeholder:text-gray-400 text-gray-900
                                                               resize-none bg-transparent"
                                              placeholder="Any dietary restrictions, allergies, or special accommodations we should know about?"
                                              onFocus={() => showSubmitButton()}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Submit Button Container */}
                                      <div className="submit-button-container overflow-hidden transition-all duration-300 max-h-0 opacity-0 mt-6">
                                        <div className="flex justify-between gap-4">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowContactDetails(false)}
                                            className="flex items-center gap-2 px-6 py-2.5 text-gray-600 hover:text-gray-900
                                                           transition-colors duration-200"
                                          >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back to Location
                                          </Button>
                                          <SubmitButton 
                                            className={`
                                              flex items-center gap-2 px-8 py-2.5 rounded-lg 
                                              bg-primary text-white font-medium
                                              hover:bg-primary/90 transition-all duration-200
                                              disabled:opacity-50 disabled:cursor-not-allowed
                                              ${showValidationError ? 'animate-shake' : ''}
                                            `}
                                            disabled={isUnavailable}
                                          >
                                            {isSubmitting ? (
                                              <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Processing...
                                              </>
                                            ) : (
                                              <>
                                                Complete Booking
                                                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                              </>
                                            )}
                                          </SubmitButton>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <FormError />

                  <div className="my-2 flex flex-col gap-2">
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
