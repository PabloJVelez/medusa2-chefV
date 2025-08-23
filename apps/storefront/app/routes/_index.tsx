// apps/storefront/app/routes/_index.tsx
import { Container } from '@app/components/common/container';
import { Image } from '@app/components/common/images/Image';
import { ChefHero } from '@app/components/chef/ChefHero';
import { FeaturedMenus } from '@app/components/chef/FeaturedMenus';
import { ExperienceTypes } from '@app/components/chef/ExperienceTypes';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { fetchMenus } from '@libs/util/server/data/menus.server';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData, useRouteError, isRouteErrorResponse } from 'react-router';
import * as React from 'react';

/**
 * Helper: safe JSON stringify (avoid circular refs)
 */
function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[Unserializable]';
  }
}

/**
 * Component-scoped ErrorBoundary for FeaturedMenus
 * - Logs error + component stack + a snapshot of menus data
 * - Shows a small fallback so the whole page does not 500
 */
class FeaturedMenusBoundary extends React.Component<{ menus: any[]; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Super loud logging on the server
    console.error('[FeaturedMenusBoundary] Render error:', error);
    console.error('[FeaturedMenusBoundary] Component stack:', info?.componentStack);
    try {
      console.error('[FeaturedMenusBoundary] Menus length:', this.props.menus?.length);
      console.error('[FeaturedMenusBoundary] First menu snapshot:', safeStringify(this.props.menus?.[0]));
    } catch {
      // ignore
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">We had trouble rendering the featured menus.</p>
          <p className="text-sm opacity-80">The rest of the page is still available. Check server logs for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const loader = async (_args: LoaderFunctionArgs) => {
  try {
    const menusData = await fetchMenus({ limit: 3 });
    // Extremely explicit logging so we can see the shape that comes back
    console.log('MENUS DATA (loader) keys:', Object.keys(menusData || {}));
    console.log('MENUS DATA (loader) count:', menusData?.count, 'limit:', menusData?.limit, 'offset:', menusData?.offset);
    console.log('MENUS DATA (loader) first item:', safeStringify(menusData?.menus?.[0]));

    return {
      menus: Array.isArray(menusData?.menus) ? menusData.menus : [],
      success: true,
      // flip this to true if you want to dump data in the UI
      __debug: process.env.DEBUG_INDEX_ROUTE === 'true',
    };
  } catch (error) {
    console.error('Failed to load menus for homepage (loader):', error);
    return { menus: [], success: false, __debug: process.env.DEBUG_INDEX_ROUTE === 'true' };
  }
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: 'Chef Luis Velez - Premium Culinary Experiences' },
    {
      name: 'description',
      content:
        "Transform your special occasions with Chef Luis's premium culinary experiences. From intimate cooking classes to elegant plated dinners, bringing restaurant-quality cuisine to your home.",
    },
    { property: 'og:title', content: 'Chef Luis Velez - Premium Culinary Experiences' },
    {
      property: 'og:description',
      content:
        'Professional chef services for cooking classes, plated dinners, and buffet-style events. Personalized culinary experiences in your home.',
    },
    { property: 'og:type', content: 'website' },
    {
      name: 'keywords',
      content:
        'private chef, cooking classes, plated dinner, culinary experiences, chef services, private dining',
    },
  ];
};

/**
 * Normalize menus to avoid null access crashes inside FeaturedMenus
 */
function normalizeMenus(raw: any[] = []) {
  return raw.map((m) => ({
    id: m?.id ?? 'unknown',
    name: m?.name ?? 'Untitled Menu',
    thumbnail: m?.thumbnail ?? null, // keep shape; UI should handle null
    images: Array.isArray(m?.images) ? m.images : [],
    courses: Array.isArray(m?.courses) ? m.courses : [],
    created_at: m?.created_at ?? null,
    updated_at: m?.updated_at ?? null,
  }));
}

export default function IndexRoute() {
  const data = useLoaderData<typeof loader>();
  const menus = normalizeMenus(data?.menus);

  // Extra inline breadcrumb logging from the server render
  console.log('[IndexRoute render] menus length:', menus.length);

  return (
    <>
      <link
        rel="preload"
        href="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        as="image"
      />

      <ChefHero className="h-[800px] !max-w-full -mt-[calc(var(--mkt-header-height)+3rem)] md:-mt-[calc(var(--mkt-header-height-desktop)+2rem)] pt-[var(--mkt-header-height)] md:pt-[var(--mkt-header-height-desktop)]" />

      <ExperienceTypes />

      {/* Wrap ONLY the risky bit in a very-chatty boundary */}
      <FeaturedMenusBoundary menus={menus}>
        <FeaturedMenus menus={menus} maxDisplay={3} />
      </FeaturedMenusBoundary>

      {/* Optional in-UI debug payload (enable by setting DEBUG_INDEX_ROUTE=true) */}
      {data?.__debug ? (
        <pre className="mt-6 rounded-lg bg-gray-100 p-4 text-xs text-gray-800 overflow-auto">
          {safeStringify({ menusCount: menus.length, firstMenu: menus[0] })}
        </pre>
      ) : null}

      <Container className="py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <Image
              src="/assets/images/chef_experience.PNG"
              loading="lazy"
              alt="Chef Luis Velez in his kitchen"
              className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
              height={500}
              width={600}
            />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent-500 rounded-full opacity-20" />
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-italiana text-primary-900">Meet Chef Luis</h2>
              <p className="text-2xl md:text-3xl lg:text-4xl font-italiana text-accent-600">Culinary Artistry</p>
            </div>

            <div className="space-y-4 text-primary-700">
              <p className="text-lg leading-relaxed">
                With over 15 years of culinary excellence, Chef Luis Velez brings world-class expertise from
                Michelin-starred restaurants directly to your home.
              </p>
              <p className="text-base leading-relaxed">
                Trained in classical French techniques with a modern innovative approach, he creates unforgettable
                dining experiences tailored to your special occasions.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="bg-accent-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-accent-700">15+ Years Experience</span>
              </div>
              <div className="bg-accent-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-accent-700">Michelin Trained</span>
              </div>
              <div className="bg-accent-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-accent-700">Local Sourcing</span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="p-14 pt-0">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-italiana text-gray-900 mb-4">What Our Guests Say</h3>
          <div className="w-20 mx-auto border-t-2 border-blue-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
              "Chef Luis created the most incredible anniversary dinner for us. Every course was a masterpiece, and the
              cooking class was so much fun!"
            </p>
            <div className="font-semibold text-gray-900">— Sarah &amp; Michael K.</div>
            <div className="text-sm text-gray-600">Plated Dinner Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
              "The cooking class was amazing! Chef Velez taught us so much and we had a blast. Can't wait to book
              another experience."
            </p>
            <div className="font-semibold text-gray-900">— Jennifer L.</div>
            <div className="text-sm text-gray-600">Cooking Class Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
              "Perfect for our family gathering! The buffet style worked perfectly for our group and everything was
              absolutely delicious."
            </p>
            <div className="font-semibold text-gray-900">— The Rodriguez Family</div>
            <div className="text-sm text-gray-600">Buffet Style Experience</div>
          </div>
        </div>
      </Container>

      <Container className="p-14 md:pt-28 lg:pt-24 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <Image
              src="/assets/images/chef_book_experience.PNG"
              alt="Guests enjoying a Chef Velez experience"
              className="rounded-3xl shadow-lg"
              width={600}
              height={400}
            />
          </div>

          <div className="order-1 lg:order-2 space-y-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <h4 className="text-xl font-italiana tracking-wider">READY TO CREATE MEMORIES?</h4>
            <h3 className="text-6xl lg:text-7xl font-aboreto">Book Your Experience</h3>
            <p className="text-xl leading-relaxed">
              Transform your next special occasion into an unforgettable culinary journey. From intimate dinners to
              group celebrations, every experience is crafted with care.
            </p>
            <ActionList
              actions={[
                { label: 'Browse Our Menus', url: '/menus' },
                { label: 'Request Your Event', url: '/request' },
              ]}
              className="flex-col gap-4 lg:flex-row"
            />
          </div>
        </div>
      </Container>
    </>
  );
}

/**
 * Route-scoped ErrorBoundary (kept here too, catches anything outside the child boundary)
 */
export function ErrorBoundary() {
  const error = useRouteError();

  // Our explicit log (not just RR's)
  
  console.error('[IndexRoute ErrorBoundary] raw error:', error);

  if (isRouteErrorResponse(error)) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Oops</h1>
        <p>
          {error.status} {error.statusText}
        </p>
        {error.data ? <pre style={{ whiteSpace: 'pre-wrap' }}>{safeStringify(error.data)}</pre> : null}
      </div>
    );
  }

  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unexpected error';
  const stack = error instanceof Error ? error.stack : undefined;
  const dev = process.env.NODE_ENV !== 'production';

  return (
    <div style={{ padding: 24 }}>
      <h1>Unexpected Error</h1>
      <p>Something went wrong while rendering this page.</p>
      {dev && (
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {message}
          {stack ? `\n\n${stack}` : ''}
        </pre>
      )}
    </div>
  );
}
