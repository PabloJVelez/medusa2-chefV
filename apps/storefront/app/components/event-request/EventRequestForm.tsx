import { useState } from 'react';
import { Button } from '@app/components/common/buttons/Button';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import type { StoreMenuDTO } from '@app/../types/menus';
import type { EventRequestFormData } from '@app/routes/request';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventRequestSchema } from '@app/routes/request';
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
const RequestSummary = ({ menus }: { menus: any[] }) => <div>Review & Submit Step - Coming Soon</div>;

export interface EventRequestFormProps {
  menus: StoreMenuDTO[];
  initialValues?: Partial<EventRequestFormData>;
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
  
  const form = useRemixForm<EventRequestFormData>({
    resolver: zodResolver(eventRequestSchema),
    defaultValues: {
      currentStep: 1,
      partySize: 4, // Default party size
      ...initialValues,
    },
    mode: 'onChange', // Validate on change for better UX
  });

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
    
    switch (currentStep) {
      case 1:
        return true; // Menu selection is optional
      case 2:
        return !!values.eventType;
      case 3:
        return !!values.requestedDate && !!values.requestedTime;
      case 4:
        return values.partySize >= 2 && values.partySize <= 50;
      case 5:
        return !!values.locationType && !!values.locationAddress;
      case 6:
        return !!values.firstName && !!values.lastName && !!values.email;
      case 7:
        return true; // Special requests are optional
      case 8:
        return true; // Final review step
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
        return <RequestSummary menus={menus} />;
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
        <form method="post" className="space-y-8">
          <input type="hidden" name="currentStep" value={currentStep} />
          
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
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canProceed()}
                  className="bg-accent-500 hover:bg-accent-600"
                >
                  Submit Request
                </Button>
              )}
            </div>
          </div>
        </form>
      </RemixFormProvider>
    </div>
  );
};

export default EventRequestForm; 