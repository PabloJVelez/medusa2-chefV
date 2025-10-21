import { Container } from '@app/components/common/container/Container';
import type { FC } from 'react';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: '👨‍🍳',
    title: 'Michelin-Trained Expertise',
    description: 'Over 20 years of culinary experience working under world-renowned chefs, bringing restaurant-quality cuisine to your home.',
  },
  {
    icon: '🧹',
    title: 'Complete Service Included',
    description: 'All ingredients, equipment, preparation, cooking, service, and cleanup—you just provide the location and enjoy.',
  },
  {
    icon: '🥗',
    title: 'Customized to Your Taste',
    description: 'Every menu is tailored to your preferences, dietary restrictions, and special requests for a truly personalized experience.',
  },
  {
    icon: '⏱️',
    title: 'Stress-Free Planning',
    description: 'From initial request to the day of your event, we handle everything so you can focus on enjoying time with your guests.',
  },
];

export const LandingBenefits: FC = () => {
  return (
    <Container className="py-16 lg:py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-italiana text-gray-900 mb-4">
          Why Choose Chef Luis?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional culinary experiences that exceed expectations—without the stress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="text-center space-y-4 p-6 rounded-2xl hover:bg-accent-50 transition-colors"
          >
            <div className="text-6xl">{benefit.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
            <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
    </Container>
  );
};

