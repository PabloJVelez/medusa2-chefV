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
  { id: 1, title: 'Menu Selection', subtitle: 'Choose a menu template (optional)' },
  { id: 2, title: 'Experience Type', subtitle: 'Select your culinary experience' },
  { id: 3, title: 'Date & Time', subtitle: 'When would you like your event?' },
  { id: 4, title: 'Party Size', subtitle: 'How many guests will attend?' },
  { id: 5, title: 'Location', subtitle: 'Where will the event take place?' },
  { id: 6, title: 'Contact Details', subtitle: 'How can we reach you?' },
  { id: 7, title: 'Special Requests', subtitle: 'Any dietary restrictions or notes?' },
  { id: 8, title: 'Review & Submit', subtitle: 'Confirm your event details' },
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
        return true; // Menu selection is optional
      case 2:
        return !!values.eventType && !errors.eventType;
      case 3:
        return !!values.requestedDate && !!values.requestedTime && 
               !errors.requestedDate && !errors.requestedTime;
      case 4:
        return values.partySize >= 2 && values.partySize <= 50 && !errors.partySize;
      case 5:
        return !!values.locationType && !!values.locationAddress && 
               values.locationAddress.length >= 10 &&
               !errors.locationType && !errors.locationAddress;
      case 6:
        return !!values.firstName && !!values.lastName && !!values.email &&
               !errors.firstName && !errors.lastName && !errors.email &&
               (!values.phone || !errors.phone); // Phone is optional but must be valid if provided
      case 7:
        return !errors.specialRequirements && !errors.notes; // Optional but must be valid if provided
      case 8:
        return Object.keys(errors).length === 0; // No validation errors on final step
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <MenuSelector menus={menus} />;
      case 2:
        return <EventTypeSelector />;
      case 3:
        return <DateTimeForm />;
      case 4:
        return <PartySizeSelector />;
      case 5:
        return <LocationForm />;
      case 6:
        return <ContactDetails />;
      case 7:
        return <SpecialRequests />;
      case 8:
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
          <input type="hidden" name="locationType" value={form.watch('locationType') || ''} />
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