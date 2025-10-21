import { Container } from '@app/components/common/container';
import { LandingHero } from '@app/components/landing/LandingHero';
import { LandingEmailCapture } from '@app/components/landing/LandingEmailCapture';
import { LandingBenefits } from '@app/components/landing/LandingBenefits';
import { LandingSocialProof } from '@app/components/landing/LandingSocialProof';
import { LandingProcess } from '@app/components/landing/LandingProcess';
import { LandingFAQ } from '@app/components/landing/LandingFAQ';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';

export const loader = async (_args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: 'Book Chef Luis Velez - Premium Private Chef Services | Limited Availability' },
    {
      name: 'description',
      content: 'Transform your next celebration with Michelin-trained Chef Luis Velez. Premium private chef services for cooking classes, plated dinners, and special events. Book your date today!',
    },
    { property: 'og:title', content: 'Book Chef Luis Velez - Premium Private Chef Services' },
    {
      property: 'og:description',
      content: 'Professional private chef with 20+ years experience. All-inclusive service: ingredients, equipment, cooking, service & cleanup included.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/assets/images/chef_experience.jpg' },
    { name: 'keywords', content: 'book private chef, chef Luis Velez, private chef services, cooking classes, plated dinner, Miami chef, book chef online' },
    { name: 'robots', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ];
};

export default function LandingPage() {
  return (
    <>
      {/* Hero Section - Above the fold */}
      <LandingHero />

      {/* Email Capture - High priority */}
      <LandingEmailCapture />

      {/* Benefits - Why choose Chef Luis */}
      <LandingBenefits />

      {/* Social Proof */}
      <LandingSocialProof />

      {/* Simple Process */}
      <LandingProcess />

      {/* FAQ - Objection handling */}
      <LandingFAQ />

      {/* Final CTA */}
      <Container className="py-16 lg:py-20 bg-accent-50">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-italiana text-gray-900">
            Ready to Experience Culinary Excellence?
          </h2>
          <p className="text-xl text-gray-700">
            Join hundreds of satisfied customers who've transformed their special occasions 
            with Chef Luis's premium culinary expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/request"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-accent-600 rounded-md hover:bg-accent-700 transition-colors shadow-lg"
            >
              Book Your Event Now
            </a>
            <a
              href="/menus"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:border-gray-400 transition-colors"
            >
              View Sample Menus
            </a>
          </div>
          <p className="text-sm text-gray-500">
            ✓ No commitment required • ✓ Free consultation • ✓ Response within 24 hours
          </p>
        </div>
      </Container>
    </>
  );
}

