import { zodResolver } from '@hookform/resolvers/zod';
import { ActionFunctionArgs, data } from 'react-router';
import { getValidatedFormData } from 'remix-hook-form';
import { z } from 'zod';

const resolveBackendUrl = () =>
  (process.env.INTERNAL_MEDUSA_API_URL ??
    process.env.PUBLIC_MEDUSA_API_URL ??
    process.env.MEDUSA_BACKEND_URL ??
    process.env.VITE_MEDUSA_BACKEND_URL ??
    'http://localhost:9000').replace(/\/+$/, '');

const resolvePublishableKey = () =>
  process.env.MEDUSA_PUBLISHABLE_KEY ?? '';

export const newsletterSubscriberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  source: z.string().default('newsletter'),
  landingPage: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const { data: validatedData, errors } = await getValidatedFormData(
    await request.formData(),
    zodResolver(newsletterSubscriberSchema),
  );

  if (errors) {
    return data({ errors }, { status: 400 });
  }

  const { email, firstName, source, landingPage, utmSource, utmMedium, utmCampaign } = validatedData;

  try {
    // Get referrer from request headers
    const referrer = request.headers.get('referer') || undefined;

    // Call Medusa backend API to create landing lead
    const backendUrl = resolveBackendUrl();
    const publishableKey = resolvePublishableKey();
    
    if (!publishableKey) {
      console.error('MEDUSA_PUBLISHABLE_KEY is not set');
      return data({ errors: { root: { message: 'Configuration error' } } }, { status: 500 });
    }
    
    const response = await fetch(`${backendUrl}/store/landing-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey,
      },
      body: JSON.stringify({
        email,
        firstName,
        source,
        landingPage,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create landing lead:', errorData);
      return data({ errors: { root: { message: 'Failed to subscribe' } } }, { status: 500 });
    }

    const result = await response.json();
    console.log('Landing lead created successfully:', result);

    return data({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error creating landing lead:', error);
    return data({ errors: { root: { message: 'Something went wrong' } } }, { status: 500 });
  }
};
