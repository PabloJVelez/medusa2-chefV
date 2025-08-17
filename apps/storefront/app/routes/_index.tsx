import { Container } from '@app/components/common/container';
import { Image } from '@app/components/common/images/Image';
import { ChefHero } from '@app/components/chef/ChefHero';
import { FeaturedMenus } from '@app/components/chef/FeaturedMenus';
import { ExperienceTypes } from '@app/components/chef/ExperienceTypes';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { fetchMenus } from '@libs/util/server/data/menus.server';
import { getMergedPageMeta } from '@libs/util/page';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';

export const loader = async (args: LoaderFunctionArgs) => {
  try {
    // Fetch menus for the featured menus section
    const menusData = await fetchMenus({ limit: 3 });
    return { 
      menus: menusData.menus || [],
      success: true 
    };
  } catch (error) {
    console.error('Failed to load menus for homepage:', error);
    return { 
      menus: [],
      success: false 
    };
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: 'Chef Silvia - Premium Culinary Experiences' },
    { 
      name: 'description', 
      content: 'Transform your special occasions with Chef Silvia’s premium culinary experiences. From intimate cooking classes to elegant plated dinners, bringing restaurant-quality cuisine to your home.'
    },
          { property: 'og:title', content: 'Chef Silvia - Premium Culinary Experiences' },
    { 
      property: 'og:description', 
      content: 'Professional chef services for cooking classes, plated dinners, and buffet-style events. Personalized culinary experiences in your home.'
    },
    { property: 'og:type', content: 'website' },
    { name: 'keywords', content: 'private chef, cooking classes, plated dinner, culinary experiences, chef services, private dining' },
  ];
};

export default function IndexRoute() {
  const { menus } = useLoaderData<typeof loader>();

  return (
    <>
      <link rel="preload" href="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" as="image" />
      
      {/* Chef Hero Section */}
      <ChefHero
        className="h-[800px] !max-w-full -mt-[calc(var(--mkt-header-height)+3rem)] md:-mt-[calc(var(--mkt-header-height-desktop)+2rem)] pt-[var(--mkt-header-height)] md:pt-[var(--mkt-header-height-desktop)]"
      />

      {/* Experience Types Section */}
      <ExperienceTypes />

      {/* Featured Menus Section */}
      <FeaturedMenus 
        menus={menus}
        maxDisplay={3}
      />

      {/* Chef Story Section */}
      <Container className="py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Chef Image */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <Image
                src="/assets/images/chef-silvia.png"
                loading="lazy"
                alt="Chef Silvia in her kitchen"
                className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
                height={500}
                width={600}
              />
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent-500 rounded-full opacity-20"></div>
            </div>
          </div>

          {/* Chef Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-italiana text-primary-900">
                Meet Chef Silvia
              </h2>
              <p className="text-2xl md:text-3xl lg:text-4xl font-italiana text-accent-600">
                A Culinary Journey
              </p>
            </div>
            
            <div className="space-y-4 text-primary-700">
              <p className="text-lg leading-relaxed">
                A visionary Executive Chef, whose culinary roots are deeply embedded in the vibrant essence of Los Angeles. Born of Cuban descent, she has artfully blended her rich heritage with the precision and elegance of classical French training.
              </p>
              <p className="text-base leading-relaxed">
                Boasting over 18 years of experience, she has been a dynamic force within the eclectic Los Angeles food scene, constantly pushing the boundaries of culinary innovation. Now, having returned to Miami, she focuses her talents on highlighting the splendor of local ingredients. Her approach to cuisine is transformative, creating dishes that are not merely consumed but experienced. Each menu she designs is a bespoke journey, tailored to enchant the senses and leave an indelible mark on all who have the pleasure of tasting her creations.
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

      {/* Chef Background Section
      <Container className="p-14 pt-0">
        <div
          className="h-[594px] rounded-3xl bg-cover bg-no-repeat bg-center flex items-center justify-center"
          style={{
            backgroundImage: 'url(/assets/images/chef_watermelon_home.jpg)',
          }}
        >
          <div className="bg-black bg-opacity-50 rounded-2xl p-8 max-w-2xl text-white text-center">
            <h3 className="text-3xl font-italiana mb-4">15+ Years of Culinary Excellence</h3>
            <p className="text-lg leading-relaxed">
                              From Michelin-starred restaurants to intimate home kitchens, Chef Silvia brings world-class 
              culinary expertise directly to your table. Trained in classical French techniques with a 
              modern innovative approach.
            </p>
          </div>
        </div>
      </Container> */}

      {/* Testimonials Section */}
      <Container className="p-14 pt-0">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-italiana text-gray-900 mb-4">
            What Our Guests Say
          </h3>
          <div className="w-20 mx-auto border-t-2 border-blue-500"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 italic mb-4">
                              "Chef Silvia created the most incredible anniversary dinner for us. Every course was a masterpiece, 
              and the cooking class was so much fun!"
              </p>
            <div className="font-semibold text-gray-900">— Sarah & Michael K.</div>
            <div className="text-sm text-gray-600">Plated Dinner Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
                              "The cooking class was amazing! Chef Silvia taught us so much and we had a blast. 
              Can't wait to book another experience."
            </p>
            <div className="font-semibold text-gray-900">— Jennifer L.</div>
            <div className="text-sm text-gray-600">Cooking Class Experience</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-700 italic mb-4">
              "Perfect for our family gathering! The buffet style worked perfectly for our group 
              and everything was absolutely delicious."
            </p>
            <div className="font-semibold text-gray-900">— The Rodriguez Family</div>
            <div className="text-sm text-gray-600">Buffet Style Experience</div>
          </div>
        </div>
      </Container>

      {/* Final CTA Section */}
      <Container className="p-14 md:pt-28 lg:pt-24 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
              <Image
                src="/assets/images/chef_silvia_experience.png"
                alt="Guests enjoying a Chef Silvia experience"
                className="rounded-3xl shadow-lg"
                width={600}
                height={400}
              />
          </div>
          
          <div className="order-1 lg:order-2 space-y-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <h4 className="text-xl font-italiana tracking-wider">READY TO CREATE MEMORIES?</h4>
            <h3 className="text-6xl lg:text-7xl font-aboreto">Book Your Experience</h3>
            <p className="text-xl leading-relaxed">
              Transform your next special occasion into an unforgettable culinary journey. 
              From intimate dinners to group celebrations, every experience is crafted with care.
            </p>
            <ActionList
              actions={[
                {
                  label: 'Browse Our Menus',
                  url: '/menus',
                },
                {
                  label: 'Request Your Event',
                  url: '/request',
                },
              ]}
              className="flex-col gap-4 lg:flex-row"
            />
          </div>
        </div>
      </Container>
    </>
  );
}
