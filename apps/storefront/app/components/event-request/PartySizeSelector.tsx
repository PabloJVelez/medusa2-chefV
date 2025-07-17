import { useState } from 'react';
import { Button } from '@app/components/common/buttons/Button';
import { useFormContext } from 'react-hook-form';
import type { EventRequestFormData } from '@app/routes/request';
import { PRICING_STRUCTURE, getEventTypeDisplayName } from '@libs/constants/pricing';
import clsx from 'clsx';
import type { FC } from 'react';

export interface PartySizeSelectorProps {
  className?: string;
}

const PARTY_SIZE_PRESETS = [2, 4, 6, 8, 10, 12];
const MIN_PARTY_SIZE = 2;
const MAX_PARTY_SIZE = 50;

export const PartySizeSelector: FC<PartySizeSelectorProps> = ({ className }) => {
  const { watch, setValue, formState: { errors } } = useFormContext<EventRequestFormData>();
  const partySize = watch('partySize') || 4;
  const eventType = watch('eventType');
  
  const [inputValue, setInputValue] = useState(partySize.toString());

  // Calculate pricing based on selected event type
  const getPrice = () => {
    if (!eventType) return null;
    return PRICING_STRUCTURE[eventType];
  };

  const price = getPrice();
  const totalPrice = price ? price * partySize : 0;

  const handlePartySizeChange = (newSize: number) => {
    if (newSize >= MIN_PARTY_SIZE && newSize <= MAX_PARTY_SIZE) {
      setValue('partySize', newSize, { shouldValidate: true });
      setInputValue(newSize.toString());
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= MIN_PARTY_SIZE && numValue <= MAX_PARTY_SIZE) {
      setValue('partySize', numValue, { shouldValidate: true });
    }
  };

  const incrementSize = () => {
    if (partySize < MAX_PARTY_SIZE) {
      handlePartySizeChange(partySize + 1);
    }
  };

  const decrementSize = () => {
    if (partySize > MIN_PARTY_SIZE) {
      handlePartySizeChange(partySize - 1);
    }
  };

  const getEventTypeName = () => {
    return eventType ? getEventTypeDisplayName(eventType) : 'Selected Experience';
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          How Many Guests Will Attend?
        </h3>
        <p className="text-primary-600">
          Select the number of guests for your event. Minimum 2 guests, maximum 50 guests.
        </p>
      </div>

      {/* Quick preset buttons */}
      <div className="text-center">
        <p className="text-sm text-primary-700 mb-4">Popular party sizes:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {PARTY_SIZE_PRESETS.map((size) => (
            <Button
              key={size}
              type="button"
              variant={partySize === size ? "primary" : "default"}
              onClick={() => handlePartySizeChange(size)}
              className="text-sm px-4 py-2"
            >
              {size} guests
            </Button>
          ))}
        </div>
      </div>

      {/* Custom number input */}
      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-primary-900 mb-3 text-center">
          Or enter a custom number:
        </label>
        
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="default"
            onClick={decrementSize}
            disabled={partySize <= MIN_PARTY_SIZE}
            className="w-10 h-10 p-0 flex items-center justify-center"
          >
            −
          </Button>
          
          <div className="relative">
            <input
              type="number"
              min={MIN_PARTY_SIZE}
              max={MAX_PARTY_SIZE}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={() => setInputValue(partySize.toString())}
              className={clsx(
                "w-20 text-center text-xl font-semibold py-3 border-2 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500",
                errors.partySize
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              )}
            />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-primary-600">
              guests
            </div>
          </div>
          
          <Button
            type="button"
            variant="default"
            onClick={incrementSize}
            disabled={partySize >= MAX_PARTY_SIZE}
            className="w-10 h-10 p-0 flex items-center justify-center"
          >
            +
          </Button>
        </div>

        {/* Error message */}
        {errors.partySize && (
          <p className="text-red-600 text-sm mt-2 text-center">
            {errors.partySize.message}
          </p>
        )}
      </div>

      {/* Price calculation */}
      {eventType && price && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-6">
          <div className="text-center space-y-3">
            <h4 className="text-lg font-semibold text-accent-700">
              Pricing Estimate
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-accent-600">Experience Type:</span>
                <span className="font-medium text-accent-800">{getEventTypeName()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-accent-600">Price per Person:</span>
                <span className="font-medium text-accent-800">${price.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-accent-600">Number of Guests:</span>
                <span className="font-medium text-accent-800">{partySize}</span>
              </div>
              
              <div className="border-t border-accent-200 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-accent-700">Total Estimate:</span>
                  <span className="text-2xl font-bold text-accent-800">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group size recommendations */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Group Size Recommendations
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>• Intimate Experience:</span>
            <span>2-4 guests</span>
          </div>
          <div className="flex justify-between">
            <span>• Small Gathering:</span>
            <span>6-8 guests</span>
          </div>
          <div className="flex justify-between">
            <span>• Medium Party:</span>
            <span>10-15 guests</span>
          </div>
          <div className="flex justify-between">
            <span>• Large Event:</span>
            <span>20+ guests</span>
          </div>
        </div>
      </div>

      {/* Important notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Important Notes
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Final pricing confirmed after chef approval</li>
          <li>• Group size affects menu options and setup requirements</li>
          <li>• Additional guests can often be accommodated with advance notice</li>
          <li>• Chef Elena will work with you to optimize the experience for your group size</li>
        </ul>
      </div>

      {/* Hidden form field */}
      <input type="hidden" name="partySize" value={partySize} />
    </div>
  );
};

export default PartySizeSelector; 