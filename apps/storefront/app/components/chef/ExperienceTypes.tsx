import { Container } from '@app/components/common/container/Container';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { Image } from '@app/components/common/images/Image';
import clsx from 'clsx';
import type { FC } from 'react';

export interface ExperienceTypesProps {
  className?: string;
  title?: string;
  description?: string;
}

interface ExperienceType {
  id: string;
  name: string;
  price: string;
  description: string;
  highlights: string[];
  icon: string;
  idealFor: string;
  duration: string;
}

const experienceTypes: ExperienceType[] = [
  {
    id: 'buffet_style',
    name: 'Buffet Style',
    price: '$99.99',
    description: 'Perfect for larger gatherings and casual entertaining. A variety of dishes served buffet-style, allowing guests to mingle and enjoy at their own pace.',
    highlights: [
      'Multiple dishes and appetizers',
      'Self-service dining style',
      'Great for mingling',
      'Flexible timing'
    ],
    icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    idealFor: 'Birthday parties, family gatherings, casual celebrations',
    duration: '2.5 hours'
  },
  {
    id: 'cooking_class',
    name: 'Cooking Class',
    price: '$119.99',
    description: 'An interactive culinary experience where you learn professional techniques while preparing a delicious meal together.',
    highlights: [
      'Hands-on cooking instruction',
      'Learn professional techniques',
      'Interactive experience',
      'Take home new skills'
    ],
    icon: 'https://images.unsplash.com/photo-1556908114-574ce6b1d42a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    idealFor: 'Date nights, team building, skill development',
    duration: '3 hours'
  },
  {
    id: 'plated_dinner',
    name: 'Plated Dinner',
    price: '$149.99',
    description: 'An elegant, restaurant-quality dining experience with multiple courses served individually. Perfect for special occasions.',
    highlights: [
      'Multi-course tasting menu',
      'Restaurant-quality presentation',
      'Full-service dining',
      'Premium ingredients'
    ],
    icon: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    idealFor: 'Anniversaries, proposals, formal celebrations',
    duration: '4 hours'
  }
];

interface ExperienceCardProps {
  experience: ExperienceType;
  className?: string;
  featured?: boolean;
}

const ExperienceCard: FC<ExperienceCardProps> = ({ experience, className, featured = false }) => {
  return (
    <div className={clsx(
      "relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col",
      featured ? "ring-2 ring-accent-500 transform scale-[1.02]" : "hover:scale-[1.02]",
      className
    )}>
      {featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center space-y-4 flex-grow flex flex-col">
        <div className="mx-auto w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
          <Image
            src={experience.icon}
            alt={`${experience.name} icon`}
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-primary-900 mb-1">
            {experience.name}
          </h3>
          <div className="text-3xl font-bold text-accent-500 mb-1">
            {experience.price}
          </div>
          <p className="text-sm text-primary-600">per person</p>
        </div>
        
        <p className="text-primary-700 leading-relaxed text-sm flex-grow">
          {experience.description}
        </p>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-primary-900 text-sm">What's Included:</h4>
          <ul className="space-y-1">
            {experience.highlights.map((highlight, index) => (
              <li key={index} className="flex items-center text-xs text-primary-700">
                <span className="w-1 h-1 bg-accent-500 rounded-full mr-2 flex-shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-1 pt-3 border-t border-accent-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-primary-600">Duration:</span>
            <span className="font-medium text-primary-800">{experience.duration}</span>
          </div>
          <div className="text-xs text-primary-600">
            <span className="font-medium">Ideal for:</span> {experience.idealFor}
          </div>
        </div>
        
        <div className="pt-4 mt-auto">
          <ActionList
            actions={[
              {
                label: 'Request This Experience',
                url: `/request?type=${experience.id}`,
              }
            ]}
            className=""
          />
        </div>
      </div>
    </div>
  );
};

export const ExperienceTypes: FC<ExperienceTypesProps> = ({ 
  className,
  title = "Choose Your Culinary Experience",
  description = "Each experience is carefully crafted to match the occasion. All prices are per person with no hidden fees or deposits required."
}) => {
  return (
    <Container className={clsx('py-12 lg:py-16', className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-italiana text-primary-900 mb-3">
          {title}
        </h2>
        <p className="text-base text-primary-600 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {experienceTypes.map((experience, index) => (
          <ExperienceCard 
            key={experience.id} 
            experience={experience}
            featured={index === 1} // Make cooking class featured (middle option)
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <div className="max-w-xl mx-auto">
          <h3 className="text-lg font-semibold text-primary-900 mb-3">
            Not sure which experience is right for you?
          </h3>
          <p className="text-primary-600 mb-6 text-sm">
            Let us help you choose the perfect culinary experience for your occasion. 
            We'll work with you to customize any experience to your preferences.
          </p>
          <ActionList
            actions={[
              {
                label: 'Browse Our Menus',
                url: '/menus',
              },
              {
                label: 'Request Custom Event',
                url: '/request',
              }
            ]}
            className="flex-col gap-3 sm:flex-row sm:justify-center"
          />
        </div>
      </div>
    </Container>
  );
};

export default ExperienceTypes; 