// app/routes/_index.tsx
import * as React from 'react';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data } from 'react-router';
import { useLoaderData } from 'react-router';

import { Container } from '@app/components/common/container';
import { Image } from '@app/components/common/images/Image';
import { ChefHero } from '@app/components/chef/ChefHero';
import { FeaturedMenus } from '@app/components/chef/FeaturedMenus';
import { ExperienceTypes } from '@app/components/chef/ExperienceTypes';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { fetchMenus } from '@libs/util/server/data/menus.server';
import { getMergedPageMeta } from '@libs/util/page';

export const loader = async (_args: LoaderFunctionArgs) => {
  let menus: any[] = [];
  
  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    const menusPromise = fetchMenus({ limit: 3 });
    
    const menusData: any = await Promise.race([menusPromise, timeoutPromise]);

    // Trim to a safe, serializable snapshot to avoid circular/BigInt/etc.
    menus = (menusData?.menus ?? []).map((m: any) => {
      const menu = {
        id: String(m.id),
        name: String(m.name),
        thumbnail: m.thumbnail ?? null,
        created_at: m.created_at ? new Date(m.created_at).toISOString() : null,
        updated_at: m.updated_at ? new Date(m.updated_at).toISOString() : null,
        // Include courses with dishes for MenuListItem component
        courses: Array.isArray(m.courses)
          ? m.courses.slice(0, 2).map((c: any) => ({
              id: String(c.id),
              name: String(c.name),
              dishes: Array.isArray(c.dishes)
                ? c.dishes.slice(0, 3).map((d: any) => ({
                    id: String(d.id),
                    name: String(d.name),
                    description: d.description || '',
                  }))
                : [],
            }))
          : [],
        images: Array.isArray(m.images) ? m.images : [],
      };
      
      // Debug log for first menu to understand structure
      if (menus.length === 0) {
        console.log('First menu structure:', JSON.stringify(menu, null, 2));
      }
      
      return menu;
    });

    // Lightweight server log (shows up in server console)
    console.log('MENUS DATA (loader) – count:', menus.length);

  } catch (error: any) {
    // Log full server-side error details but don't fail the page
    console.error('Index loader failed to fetch menus:', {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    
    // Provide sample menu data as fallback for deployment
    menus = [
      {
        id: 'sample-menu-1',
        name: 'Classic French Experience',
        thumbnail: '/assets/images/chef_beef_menu.JPG',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        courses: [
          {
            id: 'course-1',
            name: 'Appetizer',
            dishes: [
              { id: 'dish-1', name: 'French Onion Soup', description: 'Rich and savory' },
              { id: 'dish-2', name: 'Escargot', description: 'Traditional preparation' }
            ]
          },
          {
            id: 'course-2',
            name: 'Main Course',
            dishes: [
              { id: 'dish-3', name: 'Coq au Vin', description: 'Classic French dish' },
              { id: 'dish-4', name: 'Beef Bourguignon', description: 'Slow-cooked perfection' }
            ]
          }
        ],
        images: []
      }
    ];
  }

  return data(
    { menus },
    {
      headers: {
        // cheap way to confirm what the route delivered (visible in browser devtools)
        'X-Index-Debug': `menus=${menus.length}`,
      },
    }
  );
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

function FeaturedMenusSection({ menus }: { menus: any[] }) {
  return <FeaturedMenus menus={menus} maxDisplay={3} />;
}

export default function IndexRoute() {
  const { menus } = useLoaderData<typeof loader>();

  return (
    <>
      <link
        rel="preload"
        href="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        as="image"
      />

      {/* Mobile-optimized hero section with responsive height */}
      <ChefHero className="h-[600px] sm:h-[700px] md:h-[800px] !max-w-full -mt-[calc(var(--mkt-header-height)+2rem)] sm:-mt-[calc(var(--mkt-header-height)+2.5rem)] md:-mt-[calc(var(--mkt-header-height-desktop)+2rem)] pt-[var(--mkt-header-height)] md:pt-[var(--mkt-header-height-desktop)]" />

      <FeaturedMenusSection menus={menus} />
      <ExperienceTypes />

      

      {/* Chef Luis section with improved mobile layout */}
      <Container className="py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="relative order-1 lg:order-1">
            <Image
              src="/assets/images/chef_experience.PNG"
              loading="lazy"
              alt="Chef Luis Velez in his kitchen"
              className="rounded-2xl shadow-lg w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
              height={500}
              width={600}
            />
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 bg-accent-500 rounded-full opacity-20"></div>
          </div>

          <div className="order-2 lg:order-2 text-center lg:text-left space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-italiana text-primary-900 leading-tight">
                Meet Chef Luis
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-italiana text-accent-600">Culinary Artistry</p>
            </div>

            <div className="space-y-3 sm:space-y-4 text-primary-700">
              <p className="text-base sm:text-lg leading-relaxed">
                With over 15 years of culinary excellence, Chef Luis Velez brings world-class expertise from
                Michelin-starred restaurants directly to your home.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                Trained in classical French techniques with a modern innovative approach, he creates unforgettable
                dining experiences tailored to your special occasions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 justify-center lg:justify-start">
              <div className="bg-accent-100 px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                <span className="text-xs sm:text-sm font-medium text-accent-700">15+ Years Experience</span>
              </div>
              <div className="bg-accent-100 px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                <span className="text-xs sm:text-sm font-medium text-accent-700">Michelin Trained</span>
              </div>
              <div className="bg-accent-100 px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                <span className="text-xs sm:text-sm font-medium text-accent-700">Local Sourcing</span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Testimonials section with mobile-optimized layout */}
      <Container className="px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-italiana text-gray-900 mb-3 sm:mb-4">What Our Guests Say</h3>
          <div className="w-16 sm:w-20 mx-auto border-t-2 border-blue-500"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4 leading-relaxed">
              "Chef Luis created the most incredible anniversary dinner for us. Every course was a masterpiece, and the
              cooking class was so much fun!"
            </p>
            <div className="font-semibold text-gray-900 text-sm sm:text-base">— Sarah &amp; Michael K.</div>
            <div className="text-xs sm:text-sm text-gray-600">Plated Dinner Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4 leading-relaxed">
              "The cooking class was amazing! Chef Velez taught us so much and we had a blast. Can't wait to book
              another experience."
            </p>
            <div className="font-semibold text-gray-900 text-sm sm:text-base">— Jennifer L.</div>
            <div className="text-xs sm:text-sm text-gray-600">Cooking Class Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center md:col-span-2 lg:col-span-1">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4 leading-relaxed">
              "Perfect for our family gathering! The buffet style worked perfectly for our group and everything was
              absolutely delicious."
            </p>
            <div className="font-semibold text-gray-900 text-sm sm:text-base">— The Rodriguez Family</div>
            <div className="text-xs sm:text-sm text-gray-600">Buffet Style Experience</div>
          </div>
        </div>
      </Container>

      {/* Book Your Experience section with mobile optimization */}
      <Container className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-1 lg:order-1">
            <Image
              src="/assets/images/chef_book_experience.PNG"
              alt="Guests enjoying a Chef Velez experience"
              className="rounded-2xl sm:rounded-3xl shadow-lg w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover"
              width={600}
              height={400}
            />
          </div>

          <div className="order-2 lg:order-2 space-y-6 sm:space-y-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <h4 className="text-lg sm:text-xl font-italiana tracking-wider">READY TO CREATE MEMORIES?</h4>
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-aboreto leading-tight">Book Your Experience</h3>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-lg">
              Transform your next special occasion into an unforgettable culinary journey. From intimate dinners to
              group celebrations, every experience is crafted with care.
            </p>
            <ActionList
              actions={[
                { label: 'Browse Our Menus', url: '/menus' },
                { label: 'Request Your Event', url: '/request' },
              ]}
              className="flex-col gap-3 sm:gap-4 w-full sm:w-auto lg:flex-row"
            />
          </div>
        </div>
      </Container>
    </>
  );
}

// Route-scoped ErrorBoundary so the real stack hits your server logs.
export function ErrorBoundary({ error }: { error: unknown }) {
  const e = error as any;
  console.error('IndexRoute ErrorBoundary:', {
    name: e?.name,
    message: e?.message,
    stack: e?.stack,
    cause: e?.cause,
  });

  return (
    <Container className="py-12 sm:py-16">
      <div className="rounded-xl border p-4 sm:p-6 bg-red-50">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Something went wrong.</h2>
        <p className="text-sm text-red-700">
          {process.env.NODE_ENV === 'development'
            ? e?.message ?? 'Unknown error'
            : 'Please try again in a bit.'}
        </p>
      </div>
    </Container>
  );
}
