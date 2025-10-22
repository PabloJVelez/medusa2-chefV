import { Alert } from '@app/components/common/alert';
import { Container } from '@app/components/common/container/Container';
import { newsletterSubscriberSchema } from '@app/routes/api.newsletter-subscriptions';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { type FC, useEffect, useState } from 'react';
import { useFetcher, useSearchParams } from 'react-router';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

export const LandingEmailCapture: FC = () => {
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const fetcher = useFetcher<{
    success: boolean;
    errors?: Record<string, { message: string }>;
  }>();

  const form = useRemixForm({
    resolver: zodResolver(newsletterSubscriberSchema),
    fetcher,
    submitConfig: {
      method: 'post',
      action: '/api/newsletter-subscriptions',
    },
    defaultValues: {
      source: 'landing_page',
      landingPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
      utmSource: searchParams.get('utm_source') || undefined,
      utmMedium: searchParams.get('utm_medium') || undefined,
      utmCampaign: searchParams.get('utm_campaign') || undefined,
    },
  });

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccess(true);
      form.reset();
    }
  }, [fetcher.data]);

  return (
    <Container id="email-capture" className="py-16 lg:py-24 bg-gradient-to-b from-white to-accent-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-accent-500">
          <div className="text-center space-y-6">
            {/* Icon/Visual */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📧</span>
              </div>
            </div>
            
            {/* Headline */}
            <div>
              <h2 className="text-3xl md:text-4xl font-italiana text-gray-900 mb-3">
                Check Your Date Availability
              </h2>
              <p className="text-lg text-gray-600">
                Enter your email to receive instant availability and a personalized quote for your event
              </p>
            </div>

            {/* Form or Success Message */}
            {showSuccess ? (
              <div className="space-y-4 py-4">
                <Alert 
                  type="success" 
                  title="Success! Check your email"
                  className="text-left"
                >
                  We've sent you a link to check availability and request your event. 
                  You'll hear from us within 24 hours!
                </Alert>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    form.reset();
                  }}
                  className="text-accent-600 hover:text-accent-700 font-semibold"
                >
                  Want to enter another email?
                </button>
              </div>
            ) : (
              <RemixFormProvider {...form}>
                <fetcher.Form onSubmit={form.handleSubmit} className="mt-6">
                  {/* Hidden fields for tracking */}
                  <input type="hidden" {...form.register('source')} />
                  <input type="hidden" {...form.register('landingPage')} />
                  <input type="hidden" {...form.register('utmSource')} />
                  <input type="hidden" {...form.register('utmMedium')} />
                  <input type="hidden" {...form.register('utmCampaign')} />
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      {...form.register('email')}
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition-all"
                      required
                    />
                    <button
                      type="submit"
                      disabled={fetcher.state === 'submitting'}
                      className={clsx(
                        "px-8 py-4 text-lg font-bold text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap",
                        fetcher.state === 'submitting' && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {fetcher.state === 'submitting' ? 'Checking...' : 'Check Availability'}
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {form.formState.errors.email && (
                    <p className="text-red-600 text-sm mt-2 text-left">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </fetcher.Form>
              </RemixFormProvider>
            )}

            {/* Trust Signals Below Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl mb-1">✓</div>
                <p className="text-sm text-gray-600 font-medium">Instant Response</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">✓</div>
                <p className="text-sm text-gray-600 font-medium">No Spam Ever</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">✓</div>
                <p className="text-sm text-gray-600 font-medium">Free Consultation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

