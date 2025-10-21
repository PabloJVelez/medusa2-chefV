import { Container } from '@app/components/common/container/Container';
import type { FC } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How much does it cost?',
    answer: 'Pricing is transparent and per-person: Buffet Style ($99.99), Cooking Class ($119.99), Plated Dinner ($149.99). No hidden fees.',
  },
  {
    question: "What's included in the service?",
    answer: 'Everything! All ingredients, equipment, preparation, cooking, service, and cleanup. You just provide the venue.',
  },
  {
    question: 'How far in advance should I book?',
    answer: 'We recommend 2-3 weeks for best availability, but we can often accommodate shorter notice for weekday events.',
  },
  {
    question: 'Can you accommodate dietary restrictions?',
    answer: 'Absolutely! We customize menus for vegetarian, vegan, gluten-free, and specific allergies. Just mention them in your request.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We serve the greater Miami metropolitan area within a 30-mile radius. Special arrangements for locations outside this area.',
  },
  {
    question: 'What if I need to cancel?',
    answer: 'Flexible cancellation policy detailed in your confirmation. Generally, full refund with 14+ days notice.',
  },
];

export const LandingFAQ: FC = () => {
  return (
    <Container className="py-16 lg:py-24 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-italiana text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-600">
          Everything you need to know before booking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">
              {faq.question}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-lg text-gray-700 mb-4">
          Still have questions?
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-accent-600 bg-white border-2 border-accent-600 rounded-lg hover:bg-accent-50 transition-colors"
        >
          Contact Us Directly
        </a>
      </div>
    </Container>
  );
};

