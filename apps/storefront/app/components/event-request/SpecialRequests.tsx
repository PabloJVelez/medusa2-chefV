import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { EventRequestFormData } from '@app/routes/request';
import clsx from 'clsx';
import type { FC } from 'react';

export interface SpecialRequestsProps {
  className?: string;
}

// Common dietary restrictions
const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergies',
  'Seafood Allergies',
  'Shellfish Allergies',
  'Egg Allergies',
  'Keto/Low-Carb',
  'Paleo',
  'Halal',
  'Kosher'
];

export const SpecialRequests: FC<SpecialRequestsProps> = ({ className }) => {
  const { watch, setValue, formState: { errors } } = useFormContext<EventRequestFormData>();
  const specialRequirements = watch('specialRequirements');
  const notes = watch('notes');
  
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([]);

  const handleDietaryRestrictionToggle = (restriction: string) => {
    const newRestrictions = selectedDietaryRestrictions.includes(restriction)
      ? selectedDietaryRestrictions.filter(r => r !== restriction)
      : [...selectedDietaryRestrictions, restriction];
    
    setSelectedDietaryRestrictions(newRestrictions);
    
    // Update the form field
    const restrictionsText = newRestrictions.length > 0 
      ? `Dietary Restrictions: ${newRestrictions.join(', ')}` 
      : '';
    
    setValue('specialRequirements', restrictionsText, { shouldValidate: true });
  };

  const handleNotesChange = (value: string) => {
    setValue('notes', value, { shouldValidate: true });
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          Special Requests & Dietary Needs
        </h3>
        <p className="text-primary-600">
          Help Chef Elena customize your experience by sharing any dietary restrictions, preferences, or special requests.
        </p>
      </div>

      {/* Dietary restrictions */}
      <div>
        <h4 className="text-sm font-medium text-primary-900 mb-3">
          Dietary Restrictions & Allergies
        </h4>
        <p className="text-sm text-primary-600 mb-4">
          Select any dietary restrictions or allergies that apply to your guests:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {DIETARY_RESTRICTIONS.map((restriction) => {
            const isSelected = selectedDietaryRestrictions.includes(restriction);
            
            return (
              <button
                key={restriction}
                type="button"
                onClick={() => handleDietaryRestrictionToggle(restriction)}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2 text-center",
                  isSelected
                    ? "bg-accent-500 text-white border-accent-500"
                    : "bg-white text-primary-700 border-gray-200 hover:border-accent-300 hover:bg-accent-50"
                )}
              >
                {restriction}
              </button>
            );
          })}
        </div>

        {selectedDietaryRestrictions.length > 0 && (
          <div className="mt-4 p-3 bg-accent-50 border border-accent-200 rounded-lg">
            <h5 className="text-sm font-medium text-accent-700 mb-1">
              Selected Dietary Restrictions:
            </h5>
            <p className="text-sm text-accent-600">
              {selectedDietaryRestrictions.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Additional special requirements */}
      <div>
        <label className="block text-sm font-medium text-primary-900 mb-3">
          Additional Dietary Requirements or Preferences
        </label>
        <textarea
          value={specialRequirements || ''}
          onChange={(e) => setValue('specialRequirements', e.target.value, { shouldValidate: true })}
          placeholder="Please describe any specific dietary needs, food preferences, or allergies not covered above..."
          rows={4}
          className={clsx(
            "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-none",
            errors.specialRequirements
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300"
          )}
        />
        <p className="text-sm text-primary-600 mt-1">
          Be as specific as possible to help Chef Elena plan the perfect menu for your group
        </p>
        {errors.specialRequirements && (
          <p className="text-red-600 text-sm mt-1">
            {errors.specialRequirements.message}
          </p>
        )}
      </div>

      {/* General notes and requests */}
      <div>
        <label className="block text-sm font-medium text-primary-900 mb-3">
          Additional Notes & Special Requests
        </label>
        <textarea
          value={notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Share any other details, special occasions, preferences, or questions for Chef Elena..."
          rows={5}
          className={clsx(
            "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-none",
            errors.notes
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300"
          )}
        />
        <p className="text-sm text-primary-600 mt-1">
          Examples: Special occasions, preferred cooking styles, equipment you have, or any questions
        </p>
        {errors.notes && (
          <p className="text-red-600 text-sm mt-1">
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* Helpful examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Helpful Information to Include
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-1">Dietary Notes:</h5>
            <ul className="text-sm text-blue-700 space-y-0.5">
              <li>• Severity of allergies</li>
              <li>• Preferred protein sources</li>
              <li>• Foods you love/hate</li>
              <li>• Cultural dietary preferences</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-1">Event Details:</h5>
            <ul className="text-sm text-blue-700 space-y-0.5">
              <li>• Special occasion being celebrated</li>
              <li>• Preferred cuisine styles</li>
              <li>• Kitchen equipment available</li>
              <li>• Guest preferences or dislikes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chef's accommodation promise */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">
          👩‍🍳 Chef Elena's Promise
        </h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Every dietary restriction and allergy will be carefully accommodated</li>
          <li>• Menus can be customized to fit your specific needs and preferences</li>
          <li>• Alternative ingredients and cooking methods available for any restrictions</li>
          <li>• No request is too small - Chef Elena wants everyone to enjoy the experience</li>
        </ul>
      </div>

      {/* Sample requests */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          📝 Sample Special Requests
        </h4>
        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <span className="font-medium">Anniversary Dinner:</span> "We're celebrating our 10th anniversary. Could you include some romantic touches and perhaps a special dessert?"
          </div>
          <div>
            <span className="font-medium">Kids in Group:</span> "We'll have 3 children (ages 6-10). Could you prepare some kid-friendly options alongside the main menu?"
          </div>
          <div>
            <span className="font-medium">Wine Pairing:</span> "We love wine! Could you suggest pairings or incorporate wine into the cooking?"
          </div>
        </div>
      </div>

      {/* Summary of special requests */}
      {(specialRequirements || notes) && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-accent-700 mb-2">
            Special Requests Summary
          </h4>
          <div className="space-y-2 text-sm text-accent-600">
            {specialRequirements && (
              <div>
                <span className="font-medium">Dietary Requirements:</span>
                <p className="mt-1">{specialRequirements}</p>
              </div>
            )}
            {notes && (
              <div>
                <span className="font-medium">Additional Notes:</span>
                <p className="mt-1">{notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden form fields */}
      <input type="hidden" name="specialRequirements" value={specialRequirements || ''} />
      <input type="hidden" name="notes" value={notes || ''} />
    </div>
  );
};

export default SpecialRequests; 