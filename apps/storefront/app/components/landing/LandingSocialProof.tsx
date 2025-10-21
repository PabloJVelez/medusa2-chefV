import { Container } from '@app/components/common/container/Container';
import type { FC } from 'react';

export const LandingSocialProof: FC = () => {
  return (
    <Container className="py-16 lg:py-24 bg-gray-50">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-3xl text-yellow-400">⭐</span>
            ))}
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-italiana text-gray-900 mb-4">
          Loved by 500+ Happy Customers
        </h2>
        <p className="text-xl text-gray-600">
          4.9/5 average rating across all events
        </p>
      </div>

      {/* Featured Testimonial */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center space-y-6">
            <p className="text-2xl md:text-3xl italic text-gray-700 leading-relaxed">
              "Chef Luis made our anniversary absolutely magical. The food was incredible, 
              the presentation was stunning, and we didn't have to lift a finger. 
              It felt like having a Michelin-star restaurant in our home!"
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-lg">Sarah & Michael K.</div>
                <div className="text-gray-600">Anniversary Celebration • Miami, FL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="text-yellow-400 text-xl mb-3">⭐⭐⭐⭐⭐</div>
          <p className="text-gray-700 mb-4">
            "Best decision we made for our party. Chef Luis was professional, friendly, and the food was outstanding!"
          </p>
          <div className="font-semibold text-gray-900">— Jennifer L.</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="text-yellow-400 text-xl mb-3">⭐⭐⭐⭐⭐</div>
          <p className="text-gray-700 mb-4">
            "The cooking class was amazing! We learned so much and had a blast. Can't wait to book again."
          </p>
          <div className="font-semibold text-gray-900">— Marcus T.</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="text-yellow-400 text-xl mb-3">⭐⭐⭐⭐⭐</div>
          <p className="text-gray-700 mb-4">
            "Worth every penny. Our guests are still raving about the food weeks later. Highly recommend!"
          </p>
          <div className="font-semibold text-gray-900">— Rodriguez Family</div>
        </div>
      </div>
    </Container>
  );
};

