import { Container } from '@app/components/common/container/Container';
import type { FC } from 'react';

export const LandingHero: FC = () => {
  return (
    <Container className="!px-0 py-0 sm:!px-0">
      <div className="relative h-[600px] md:h-[700px] flex items-center justify-center bg-accent-50">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/assets/images/chef_experience.jpg')`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8">
          {/* Urgency Badge */}
          <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold animate-pulse">
            ⚡ LIMITED AVAILABILITY THIS MONTH
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-italiana text-white drop-shadow-2xl leading-tight">
            Transform Your Special Occasion Into An Unforgettable Experience
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
            Michelin-trained Chef Luis brings restaurant-quality culinary experiences 
            directly to your home—complete with premium ingredients, equipment, and service.
          </p>
          
          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4">
            <div className="bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <span className="text-sm font-semibold text-gray-900">⭐ 4.9/5 Rating</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <span className="text-sm font-semibold text-gray-900">👨‍🍳 20+ Years Experience</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <span className="text-sm font-semibold text-gray-900">🎉 500+ Events</span>
            </div>
          </div>
          
          {/* Primary CTA */}
          <div className="pt-6">
            <a
              href="#email-capture"
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-all shadow-2xl hover:shadow-accent-500/50 hover:scale-105"
            >
              Get Started - Check Availability
            </a>
            <p className="text-white text-sm mt-4 drop-shadow">
              No commitment • Free consultation • Response in 24 hours
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

