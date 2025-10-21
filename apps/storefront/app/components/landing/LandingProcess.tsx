import { Container } from '@app/components/common/container/Container';
import type { FC } from 'react';

export const LandingProcess: FC = () => {
  return (
    <Container className="py-16 lg:py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-italiana text-gray-900 mb-4">
          Simple 3-Step Process
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          From booking to enjoying your event, we make it effortless
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Step 1 */}
        <div className="relative text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
              1
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Submit Request</h3>
          <p className="text-gray-600 leading-relaxed">
            Enter your email and event details. Get instant confirmation and personalized quote within 24 hours.
          </p>
          {/* Connection Line */}
          <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-accent-300"></div>
        </div>

        {/* Step 2 */}
        <div className="relative text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
              2
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Customize Menu</h3>
          <p className="text-gray-600 leading-relaxed">
            Work with Chef Luis to create the perfect menu for your event, tailored to your preferences.
          </p>
          {/* Connection Line */}
          <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-accent-300"></div>
        </div>

        {/* Step 3 */}
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
              3
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Enjoy Your Event</h3>
          <p className="text-gray-600 leading-relaxed">
            Relax while Chef Luis handles everything—ingredients, cooking, service, and cleanup included.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <a
          href="#email-capture"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-all shadow-lg"
        >
          Start Your Booking Now
        </a>
      </div>
    </Container>
  );
};

