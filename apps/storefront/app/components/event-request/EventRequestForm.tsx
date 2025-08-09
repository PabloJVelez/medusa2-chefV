import { useState, useEffect } from 'react';
import { Button } from '@app/components/common/buttons/Button';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import type { StoreMenuDTO } from '@app/../types/menus';
import type { EventRequestFormData } from '@app/routes/request._index';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventRequestSchema } from '@app/routes/request._index';
import { useActionData } from 'react-router';
import clsx from 'clsx';
import type { FC } from 'react';
import { Disclosure } from '@headlessui/react';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';

// Real form step components
import { MenuSelector } from './MenuSelector';
import { EventTypeSelector } from './EventTypeSelector';
import { PartySizeSelector } from './PartySizeSelector';
import { DateTimeForm } from './DateTimeForm';
import { LocationForm } from './LocationForm';
import { ContactDetails } from './ContactDetails';
import { SpecialRequests } from './SpecialRequests';
import { RequestSummary } from './RequestSummary';

export interface EventRequestFormProps {
  menus: StoreMenuDTO[];
  initialValues?: Partial<EventRequestFormData>;
}

// Type for action response
interface ActionResponse {
  success?: boolean;
  eventId?: string;
  redirectTo?: string;
  message?: string;
  errors?: any;
}

const STEPS = [
  { id: 1, title: 'Experience & Menu', subtitle: 'Choose your culinary experience and (optional) a menu template' },
  { id: 2, title: 'Schedule & Party Size', subtitle: 'Select your preferred date, time, and number of guests' },
  { id: 3, title: 'Location & Contact', subtitle: 'Where will the event take place and how can we reach you?' },
  { id: 4, title: 'Special Requests', subtitle: 'Any dietary restrictions or notes?' },
  { id: 5, title: 'Review & Submit', subtitle: 'Confirm your event details' },
];

export const EventRequestForm: FC<EventRequestFormProps> = ({ 
  menus, 
  initialValues = {} 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const actionData = useActionData() as ActionResponse;
  
  const form = useRemixForm<EventRequestFormData>({
    resolver: zodResolver(eventRequestSchema),
    defaultValues: {
      currentStep: 1,
      partySize: 4, // Default party size
      ...initialValues,
    },
    mode: 'onChange', // Validate on change for better UX
  });

  // Log action data for debugging
  useEffect(() => {
    console.log('🎯 FORM: useEffect triggered with actionData:', actionData);
    
    if (actionData) {
      console.log('🎯 FORM: Action data received:', actionData);
    }
  }, [actionData]);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const values = form.getValues();
    const errors = form.formState.errors;
    
    switch (currentStep) {
      case 1:
        // Experience required, menu optional
        return !!values.eventType && !errors.eventType;
      case 2:
        // Date, time, and party size required
        return !!values.requestedDate && !!values.requestedTime &&
               values.partySize >= 2 && values.partySize <= 50 &&
               !errors.requestedDate && !errors.requestedTime && !errors.partySize;
      case 3:
        // Location and contact required
        return !!values.locationAddress && values.locationAddress.length >= 10 &&
               !!values.firstName && !!values.lastName && !!values.email &&
               !errors.locationAddress && !errors.firstName && !errors.lastName && !errors.email &&
               (!values.phone || !errors.phone);
      case 4:
        // Special requests optional but must be valid if provided
        return !errors.specialRequirements && !errors.notes;
      case 5:
        // No validation errors on final step
        return Object.keys(errors).length === 0;
      default:
        return false;
    }
  };

  const renderSectionHeader = (label: string) => (
    <div className="flex items-center gap-2">
      <h4 className="text-base font-semibold text-primary-900">{label}</h4>
    </div>
  );

  const renderDisclosure = (
    args: {
      defaultOpen?: boolean;
      header: React.ReactNode;
      children: React.ReactNode;
    }
  ) => (
    <Disclosure defaultOpen={args.defaultOpen}>
      {({ open }) => (
        <div
          className={clsx(
            'rounded-lg border bg-white transition-colors shadow-sm',
            open ? 'border-accent-300 ring-1 ring-accent-200' : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <Disclosure.Button className="w-full px-4 py-3 text-left">
            <div className="flex items-center justify-between">
              <div>{args.header}</div>
              <ChevronDownIcon
                className={clsx('h-5 w-5 text-gray-500 transition-transform', open && 'rotate-180')}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pb-4">
            {args.children}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {renderDisclosure({
              defaultOpen: true,
              header: renderSectionHeader('Select a Menu'),
              children: <MenuSelector menus={menus} />,
            })}

            {renderDisclosure({
              defaultOpen: false,
              header: renderSectionHeader('Experience Type'),
              children: <EventTypeSelector />,
            })}
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-3">{renderSectionHeader('Date & Time')}</div>
              <DateTimeForm />
            </div>
            <div>
              <div className="mb-3">{renderSectionHeader('Party Size')}</div>
              <PartySizeSelector />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-3">{renderSectionHeader('Event Location')}</div>
              <LocationForm />
            </div>
            <div>
              <div className="mb-3">{renderSectionHeader('Contact Details')}</div>
              <ContactDetails />
            </div>
          </div>
        );
      case 4:
        return <SpecialRequests />;
      case 5:
        return (
          <RequestSummary 
            menus={menus} 
            onEditStep={(step: number) => setCurrentStep(step)}
            onSubmit={() => {
              console.log('🎯 FORM: Submit button clicked, triggering form submission');
              console.log('🎯 FORM: Form values before submit:', form.getValues());
              console.log('🎯 FORM: Form errors before submit:', form.formState.errors);
              console.log('🎯 FORM: Form isValid:', form.formState.isValid);
              console.log('🎯 FORM: Form isSubmitting:', form.formState.isSubmitting);
              
              // Force update hidden inputs with current values
              const formValues = form.getValues();
              Object.entries(formValues).forEach(([key, value]) => {
                const input = document.querySelector(`input[name="${key}"]`) as HTMLInputElement;
                if (input && input.type === 'hidden') {
                  let processedValue = String(value || '');
                  
                  // Special handling for requestedDate - convert to datetime format
                  if (key === 'requestedDate' && value) {
                    const requestedTime = formValues.requestedTime || '12:00';
                    // Create a proper local datetime and convert to ISO string
                    const dateTime = new Date(`${value}T${requestedTime}:00`);
                    processedValue = dateTime.toISOString();
                    console.log(`🎯 FORM: Converting date ${value} + time ${requestedTime} to datetime: ${processedValue}`);
                  }
                  
                  input.value = processedValue;
                  console.log(`🎯 FORM: Updated hidden input ${key} = ${input.value}`);
                }
              });
              
              // Handle form submission
              const form_element = document.querySelector('form') as HTMLFormElement;
              if (form_element) {
                console.log('🎯 FORM: Form element found, requesting submit');
                
                // Log all form data that will be submitted
                const formData = new FormData(form_element);
                console.log('🎯 FORM: FormData entries to be submitted:', Array.from(formData.entries()));
                
                form_element.requestSubmit();
              } else {
                console.error('🎯 FORM: No form element found!');
              }
            }}
            isSubmitting={form.formState.isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={clsx(
                'flex items-center',
                index < STEPS.length - 1 && 'flex-1'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep >= step.id
                    ? 'bg-accent-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-4',
                    currentStep > step.id ? 'bg-accent-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-primary-900 mb-1">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-primary-600">
            {STEPS[currentStep - 1].subtitle}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <RemixFormProvider {...form}>
        <form 
          method="post" 
          className="space-y-8"
          onSubmit={(e) => {
            console.log('📤 FORM: Form submission event triggered');
            console.log('📤 FORM: Event details:', {
              type: e.type,
              target: e.target,
              currentTarget: e.currentTarget,
            });
            console.log('📤 FORM: Current form values:', form.getValues());
            console.log('📤 FORM: Form errors:', form.formState.errors);
            console.log('📤 FORM: Is form valid:', form.formState.isValid);
            console.log('📤 FORM: Current step:', currentStep);
            

            
            // Log the actual FormData that will be sent
            const formData = new FormData(e.currentTarget);
            console.log('📤 FORM: Actual FormData being submitted:', Array.from(formData.entries()));
            
            // Don't prevent default - let remix-hook-form handle it
          }}

        >
          <input type="hidden" name="currentStep" value={currentStep} />
          
          {/* Hidden inputs to ensure form data is properly submitted */}
          <input type="hidden" name="menuId" value={form.watch('menuId') || ''} />
          <input type="hidden" name="eventType" value={form.watch('eventType') || ''} />
          <input type="hidden" name="requestedDate" value={form.watch('requestedDate') || ''} />
          <input type="hidden" name="requestedTime" value={form.watch('requestedTime') || ''} />
          <input type="hidden" name="partySize" value={form.watch('partySize') || ''} />
          <input type="hidden" name="locationAddress" value={form.watch('locationAddress') || ''} />
          <input type="hidden" name="firstName" value={form.watch('firstName') || ''} />
          <input type="hidden" name="lastName" value={form.watch('lastName') || ''} />
          <input type="hidden" name="email" value={form.watch('email') || ''} />
          <input type="hidden" name="phone" value={form.watch('phone') || ''} />
          <input type="hidden" name="specialRequirements" value={form.watch('specialRequirements') || ''} />
          <input type="hidden" name="notes" value={form.watch('notes') || ''} />
          
          <div className="bg-white rounded-lg shadow-md p-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="default"
                  onClick={prevStep}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-4">
              {currentStep < STEPS.length && (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Next Step
                </Button>
              )}
              {/* Note: Submit button is handled by RequestSummary component on final step */}
            </div>
          </div>
        </form>
      </RemixFormProvider>
    </div>
  );
};

export default EventRequestForm; 