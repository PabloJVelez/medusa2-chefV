import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { EventRequestFormData } from '@app/routes/request._index';
import clsx from 'clsx';
import type { FC } from 'react';

export interface LocationFormProps {
  className?: string;
}

type LocationType = 'customer_location' | 'chef_location';

export const LocationForm: FC<LocationFormProps> = ({ className }) => {
  const { watch, setValue, formState: { errors } } = useFormContext<EventRequestFormData>();
  const locationType = watch('locationType');
  const locationAddress = watch('locationAddress');

  const handleLocationTypeChange = (type: LocationType) => {
    setValue('locationType', type, { shouldValidate: true });
    
    // Clear address when switching types
    setValue('locationAddress', '', { shouldValidate: false });
  };

  const handleAddressChange = (address: string) => {
    setValue('locationAddress', address, { shouldValidate: true });
  };

  const getLocationTypeInfo = (type: LocationType) => {
    switch (type) {
      case 'customer_location':
        return {
          title: 'Your Location',
          icon: '🏠',
          description: 'Chef Luis comes to you with all equipment and ingredients',
          benefits: [
            'Comfortable in your own space',
            'No travel required for you',
            'Use your own dining room',
            'Equipment and cleanup handled by chef'
          ],
          considerations: [
            'Kitchen access required',
            'Basic cookware and appliances needed',
            'Travel fees may apply for distances over 30 miles'
          ]
        };
      case 'chef_location':
        return {
          title: "Chef Luis's Kitchen",
          icon: '👩‍🍳',
          description: 'Experience a professional culinary environment',
          benefits: [
            'Professional-grade equipment',
            'Intimate chef studio setting',
            'All utensils and ingredients provided',
            'Dedicated space for cooking classes'
          ],
          considerations: [
            'Travel to location required',
            'Limited to 8 guests maximum',
            'Address provided after booking confirmation'
          ]
        };
    }
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          Where Should Your Culinary Experience Take Place?
        </h3>
        <p className="text-primary-600">
          Choose between the comfort of your own space or the professional setting of Chef Luis's kitchen.
        </p>
      </div>

      {/* Location type selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['customer_location', 'chef_location'] as const).map((type) => {
          const info = getLocationTypeInfo(type);
          const isSelected = locationType === type;
          
          return (
            <div
              key={type}
              className={clsx(
                "relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected
                  ? "border-accent-500 bg-accent-50 shadow-lg"
                  : "border-gray-200 hover:border-accent-300"
              )}
              onClick={() => handleLocationTypeChange(type)}
            >
              {/* Selection indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    isSelected
                      ? "border-accent-500 bg-accent-500"
                      : "border-gray-300"
                  )}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Icon and title */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{info.icon}</div>
                  <h4 className="text-xl font-semibold text-primary-900">{info.title}</h4>
                  <p className="text-sm text-primary-600 mt-1">{info.description}</p>
                </div>

                {/* Benefits */}
                <div>
                  <h5 className="text-sm font-semibold text-green-700 mb-2">✅ Benefits:</h5>
                  <ul className="space-y-1">
                    {info.benefits.map((benefit, index) => (
                      <li key={index} className="text-xs text-green-600 flex items-start">
                        <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Considerations */}
                <div>
                  <h5 className="text-sm font-semibold text-blue-700 mb-2">💡 Considerations:</h5>
                  <ul className="space-y-1">
                    {info.considerations.map((consideration, index) => (
                      <li key={index} className="text-xs text-blue-600 flex items-start">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Address input section */}
      {locationType && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-3">
              {locationType === 'customer_location' 
                ? 'Your Address' 
                : 'Your Address (for confirmation and directions)'
              }
            </label>
            
            <textarea
              value={locationAddress || ''}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder={
                locationType === 'customer_location'
                  ? 'Enter your full address including street, city, state, and ZIP code...'
                  : 'Enter your address for confirmation and any special pickup instructions...'
              }
              rows={4}
              className={clsx(
                "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-none",
                errors.locationAddress
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              )}
            />

            {/* Address guidelines */}
            <div className="mt-2 text-sm text-primary-600">
              {locationType === 'customer_location' ? (
                <div className="space-y-1">
                  <p>📍 Please include complete address with:</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• Street address and apartment/unit number if applicable</li>
                    <li>• City, state, and ZIP code</li>
                    <li>• Any special access instructions or parking notes</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-1">
                  <p>📍 Your address helps us:</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• Confirm the booking and send directions</li>
                    <li>• Coordinate pickup if you need assistance getting to the studio</li>
                    <li>• Provide accurate travel time estimates</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Error message */}
            {errors.locationAddress && (
              <p className="text-red-600 text-sm mt-2">
                {errors.locationAddress.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Selected location summary */}
      {locationType && locationAddress && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-accent-700 mb-1">
                Selected Location
              </h4>
              <p className="text-sm text-accent-600">
                {getLocationTypeInfo(locationType).title}
              </p>
              <p className="text-xs text-accent-500 mt-1 break-words">
                {locationAddress}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue('locationType', undefined as any);
                setValue('locationAddress', '');
              }}
              className="text-accent-600 text-sm hover:text-accent-700 flex-shrink-0 ml-4"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Location-specific information */}
      {locationType === 'customer_location' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">
            🏠 Home Event Requirements
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Access to kitchen with stove, oven, and refrigerator</li>
            <li>• Basic cookware (pots, pans, knives, cutting boards)</li>
            <li>• Adequate counter space for food preparation</li>
            <li>• Dining space for your party size</li>
            <li>• Parking availability for chef's vehicle</li>
          </ul>
        </div>
      )}

      {locationType === 'chef_location' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            👩‍🍳 Chef Studio Experience
          </h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Professional-grade kitchen with all equipment provided</li>
            <li>• Intimate setting designed for culinary education</li>
            <li>• Maximum 8 guests for optimal hands-on experience</li>
            <li>• Parking available on-site</li>
            <li>• Exact address provided after booking confirmation</li>
          </ul>
        </div>
      )}

      {/* Pricing information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          💰 Location Pricing
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Your Location:</span>
            <span>Included (within 30 miles)</span>
          </div>
          <div className="flex justify-between">
            <span>Chef's Studio:</span>
            <span>Included</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Travel fees may apply for locations over 30 miles from Chef Luis's base
          </p>
        </div>
      </div>

      {/* Hidden form fields */}
      <input type="hidden" name="locationType" value={locationType || ''} />
      <input type="hidden" name="locationAddress" value={locationAddress || ''} />
    </div>
  );
};

export default LocationForm; 