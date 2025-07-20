import { Button } from '@app/components/common/buttons/Button';
import { Image } from '@app/components/common/images/Image';
import { useFormContext } from 'react-hook-form';
import type { EventRequestFormData } from '@app/routes/request._index';
import { PRICING_STRUCTURE, getEventTypeDisplayName } from '@libs/constants/pricing';
import clsx from 'clsx';
import type { FC } from 'react';

export interface EventTypeSelectorProps {
  className?: string;
}

interface ExperienceType {
  id: 'cooking_class' | 'plated_dinner' | 'buffet_style';
  name: string;
  price: number;
  description: string;
  highlights: string[];
  idealFor: string;
  duration: string;
  icon: string;
}

const experienceTypes: ExperienceType[] = [
  {
    id: 'buffet_style',
    name: 'Buffet Style',
    price: PRICING_STRUCTURE.buffet_style,
    description: 'Perfect for larger gatherings and casual entertaining. A variety of dishes served buffet-style, allowing guests to mingle and enjoy at their own pace.',
    highlights: [
      'Multiple dishes and appetizers',
      'Self-service dining style',
      'Great for mingling',
      'Flexible timing'
    ],
    idealFor: 'Birthday parties, family gatherings, casual celebrations',
    duration: '2.5 hours',
    icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 'cooking_class',
    name: 'Cooking Class',
    price: PRICING_STRUCTURE.cooking_class,
    description: 'An interactive culinary experience where you learn professional techniques while preparing a delicious meal together.',
    highlights: [
      'Hands-on cooking instruction',
      'Learn professional techniques',
      'Interactive experience',
      'Take home new skills'
    ],
    idealFor: 'Date nights, team building, skill development',
    duration: '3 hours',
    icon: 'https://images.unsplash.com/photo-1556908114-574ce6b1d42a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 'plated_dinner',
    name: 'Plated Dinner',
    price: PRICING_STRUCTURE.plated_dinner,
    description: 'An elegant, restaurant-quality dining experience with multiple courses served individually. Perfect for special occasions.',
    highlights: [
      'Multi-course tasting menu',
      'Restaurant-quality presentation',
      'Full-service dining',
      'Premium ingredients'
    ],
    idealFor: 'Anniversaries, proposals, formal celebrations',
    duration: '4 hours',
    icon: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  }
];

interface ExperienceCardProps {
  experience: ExperienceType;
  isSelected: boolean;
  onSelect: (eventType: ExperienceType['id']) => void;
  partySize: number;
}

const ExperienceCard: FC<ExperienceCardProps> = ({ 
  experience, 
  isSelected, 
  onSelect, 
  partySize 
}) => {
  const totalPrice = experience.price * partySize;
  const isMostPopular = experience.id === 'cooking_class';

  return (
    <div className="relative">
      {/* Most Popular Badge */}
      {isMostPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div
        className={clsx(
          "relative bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg h-full flex flex-col",
          isSelected
            ? "border-accent-500 bg-accent-50 shadow-lg"
            : "border-gray-200 hover:border-accent-300",
          isMostPopular && "ring-2 ring-accent-200"
        )}
        onClick={() => onSelect(experience.id)}
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

        <div className="text-center space-y-4 flex-grow flex flex-col">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center">
            <Image
              src={experience.icon}
              alt={`${experience.name} icon`}
              width={32}
              height={32}
              className="w-8 h-8 rounded"
              loading="lazy"
            />
          </div>

          {/* Title and pricing */}
          <div>
            <h3 className="text-xl font-semibold text-primary-900 mb-2">
              {experience.name}
            </h3>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-accent-600">
                ${experience.price.toFixed(2)}
              </div>
              <p className="text-sm text-primary-600">per person</p>
              {partySize > 1 && (
                <p className="text-lg font-semibold text-primary-900">
                  Total: ${totalPrice.toFixed(2)} for {partySize} guests
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-primary-700 text-sm leading-relaxed flex-grow">
            {experience.description}
          </p>

          {/* What's included */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary-900 text-sm">What's Included:</h4>
            <ul className="space-y-1">
              {experience.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start text-xs text-primary-700">
                  <span className="w-1 h-1 bg-accent-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* Duration and ideal for */}
          <div className="space-y-1 pt-3 border-t border-accent-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-primary-600">Duration:</span>
              <span className="font-medium text-primary-800">{experience.duration}</span>
            </div>
            <div className="text-xs text-primary-600">
              <span className="font-medium">Ideal for:</span> {experience.idealFor}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EventTypeSelector: FC<EventTypeSelectorProps> = ({ className }) => {
  const { watch, setValue } = useFormContext<EventRequestFormData>();
  const selectedEventType = watch('eventType');
  const partySize = watch('partySize') || 4; // Default to 4 if not set

  const handleEventTypeSelect = (eventType: ExperienceType['id']) => {
    setValue('eventType', eventType, { shouldValidate: true });
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          Select Your Culinary Experience
        </h3>
        <p className="text-primary-600">
          Choose the experience type that best fits your occasion. All prices are per person with no hidden fees.
        </p>
      </div>

      {/* Experience type cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experienceTypes.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            isSelected={selectedEventType === experience.id}
            onSelect={handleEventTypeSelect}
            partySize={partySize}
          />
        ))}
      </div>

      {/* Selected experience summary */}
      {selectedEventType && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-700">
                Selected Experience
              </p>
              <p className="text-sm text-accent-600">
                {experienceTypes.find(e => e.id === selectedEventType)?.name} - 
                ${experienceTypes.find(e => e.id === selectedEventType)?.price.toFixed(2)} per person
              </p>
            </div>
                         <Button
               type="button"
               variant="ghost"
               onClick={() => setValue('eventType', undefined as any)}
               className="text-accent-600 text-sm"
             >
               Change
             </Button>
          </div>
        </div>
      )}

      {/* Pricing information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Pricing Information
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• All prices are per person and include ingredients, equipment, and service</li>
          <li>• No deposits required - payment after chef approval</li>
          <li>• Cleanup and dishwashing included in all experiences</li>
          <li>• Travel within 30 miles included (additional fees may apply beyond)</li>
        </ul>
      </div>
    </div>
  );
};

export default EventTypeSelector; 