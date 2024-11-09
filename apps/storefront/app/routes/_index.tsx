import { Container } from '@app/components/common/container';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { getMergedPageMeta } from '@libs/util/page';
import Hero from '@app/components/sections/Hero';
import { Image } from '@app/components/common/images/Image';
import { ListItems } from '@app/components/sections/ListItems';
import { SideBySide } from '@app/components/sections/SideBySide';
import { GridCTA } from '@app/components/sections/GridCTA';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import ProductList from '@app/components/sections/ProductList';

export const loader = async (args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = getMergedPageMeta;

export default function IndexRoute() {

  return (
    <>
      <Hero
        className="h-[800px] !max-w-full -mt-[calc(var(--mkt-header-height)+3rem)] md:-mt-[calc(var(--mkt-header-height-desktop)+2rem)] pt-[var(--mkt-header-height)] md:pt-[var(--mkt-header-height-desktop)]"
        content={
          <div className="text-center w-full space-y-9">
            <h4 className="font-italiana text-2xl">CULINARY ARTISTRY</h4>
            <h1 className="text-8xl font-aboreto">Chef Velez</h1>
            <p className="max-w-prose mx-auto text-lg">
              Experience the epitome of fine dining with our 5-star chef-curated experiences. From elegant 4-course 
              gourmet meals to intimate private dinners and interactive culinary demonstrations, each moment is crafted 
              to create extraordinary memories and celebrate life's special occasions.
            </p>
          </div>
        }
        actions={[
          {
            label: 'Reserve Your Experience',
            url: '/categories/blends',
          },
        ]}
        image={{
          url: '/assets/images/chef-hero.png',
          //url: '/assets/images/IMG_3232.png',
          alt: 'Barrio background',
        }}
      />

      <Container className="p-14 md:pt-1 lg:pt-24 relative flex flex-col-reverse items-center lg:flex-row">
        {/* <div className="md:absolute w-80 md:left-4 md:-top-[240px] lg:left-20 lg:w-[420px]">
          <Image src="/assets/images/Subject.png" alt="Barrio background" height={520} width={420} />
        </div> */}

        <div className="md:w-full flex flex-col justify-center max-md:items-center">
          <div className="w-full flex text-center md:text-left">
            <h2 className="mx-auto md:ml-[32%] lg:ml-[37%] xl:ml-[30%] lg:mr-auto text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-ballet mt-12">
              Culinary Excellence
            </h2>
          </div>
          <p className="font-italiana text-6xl lg:text-7xl xl:text-8xl mt-6 lg:mt-8 xl:mt-10 max-sm:text-center">
            In Every Detail
          </p>
        </div>
      </Container>

      <Container className="p-14 pt-0">
        <Hero
          className="h-[594px]"
          backgroundClassName="rounded-3xl"
          image={{
            url: '/assets/images/IMG_3232.png',
            alt: 'Barrio background',
          }}
        />
      </Container>

          
      <ListItems
        itemsClassName="mb-2"
        title="Chef Velez's Core Values"
        items={[
          {
            title: 'Culinary Mastery',
            description:
              'Every dish is a masterpiece, crafted with precision, passion, and the finest seasonal ingredients to create unforgettable dining experiences.',
            image: {
              src: '/assets/images/benefit-1.png',
              alt: 'Culinary Excellence',
              width: 60,
              height: 60,
            },
          },
          {
            title: 'Personalized Experience',
            description:
              'Each event is thoughtfully customized to your preferences, whether it\'s an intimate dinner party or a grand celebration.',
            image: {
              src: '/assets/images/benefit-2.png',
              alt: 'Personalized Experience',
              width: 60,
              height: 60,
            },
          },
          {
            title: 'Artisanal Quality',
            description:
              'We source exceptional ingredients from local producers, ensuring every component meets our exacting standards for taste and presentation.',
            image: {
              src: '/assets/images/benefit-3.png',
              alt: 'Artisanal Quality',
              width: 60,
              height: 60,
            },
          },
        ]}
      />

      <ProductList
        className="!pb-[100px]"
        heading="Event Favorites"
        actions={[
          {
            label: 'View all',
            url: '/products',
          },
        ]}
      />

      <Hero
        className="pb-10 min-h-[734px] !max-w-full"
        content={
          <div className="text-center w-full space-y-9 pt-9">
            <h4 className="font-italiana text-2xl">ELEVATE YOUR OCCASION</h4>
            <h1 className="text-4xl lg:text-7xl font-italiana">
              Let us create your next extraordinary&nbsp;dining&nbsp;experience
            </h1>
          
          
            <ListItems
              className="text-left w-full text-black justify-between p-0"
              itemsClassName="rounded-3xl bg-highlight-900/70 p-10 text-sm"
              useFillTitle
              items={[
                {
                  title: 'Select your experience',
                  description:
                    'Choose from private dining events, cooking demonstrations, or custom culinary experiences.',
                },
                {
                  title: 'Customize your evening',
                  description:
                    'Share your preferences and dietary needs. Chef Velez will craft the perfect menu for your occasion.',
                },
                {
                  title: 'Savor the moment',
                  description:
                    'Immerse yourself in an exceptional dining experience where every detail creates lasting memories.',
                },
              ]}
            />
          </div>
        }
        actions={[
          {
            label: 'Get your coffee',
            url: '/products',
          },
        ]}
        image={{
          url: '/assets/images/dessert.png',
          alt: 'Barrio background',
        }}
      />

      

      {/* <Container className="flex flex-col-reverse gap-8 items-center md:items-start p-6 lg:pt-24 xl:pt-16 lg:px-24 relative lg:min-h-[354px] min-h-[276px]">
        { <div className="flex justify-center md:justify-end md:absolute md:-top-[30%] w-60 md:w-80 md:right-0 lg:right-20 lg:w-[420px]">
          <Image src="/assets/images/header-image-2.png" alt="Barrio background" height={520} width={420} />
        </div> }

        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-italiana md:ml-0 md:mr-[288px] lg:mr-[392px]">
          <span className="whitespace-nowrap">The Art of Cuisine</span>
          <br />
          <span className="font-ballet text-[200%] whitespace-nowrap inline-block mt-6 mb-4 sm:mt-2 sm:-mb-4">
            with Chef Velez
          </span>
          <br />
          <span className="whitespace-nowrap">Creating Connections</span>
        </h2>
      </Container> */}

      
      {/* <SideBySide
        className="p-14 md:pt-12 lg:px-24"
        left={
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="bg-cover bg-no-repeat bg-center w-full rounded-3xl h-[410px]"
              style={{
                backgroundImage: 'url(/assets/images/mango-dish.png)',
              }}
            />
          </div>
        }
        right={
          <p className="text-sm h-full flex items-center justify-center">
            At Chef Velez's culinary experiences, we believe in the transformative power of cooking together. Our team-building 
            events are carefully crafted to create an environment where collaboration flourishes naturally through shared culinary discovery.
            <br />
            <br />
            Each session begins with expert guidance from Chef Velez, who shares professional techniques while creating an 
            atmosphere of warmth and inclusion. Teams work together to create sophisticated dishes, learning not just about 
            food, but about each other's strengths and styles of communication.
            <br />
            <br />
            Whether it's a hands-on cooking class, an interactive demonstration, or a collaborative dining experience, 
            our events go beyond typical team building exercises. They create genuine connections through the universal 
            language of food, leaving teams with not just new culinary skills, but stronger bonds and lasting memories 
            that transfer back to the workplace.
          </p>
        }
      /> */}
      
      {/* <GridCTA
        className="p-14 md:pt-28 lg:pt-24 lg:px-24"
        images={[
          {
            src: '/assets/images/grid-cta-1.png',
            alt: 'Barrio background',
          },
          {
            src: '/assets/images/scallops.png',
            alt: 'Barrio background',
          },
        ]}
        content={
          <div className="space-y-8 flex flex-col justify-center items-center">
            <h4 className="text-xl font-italiana">EXPERIENCE EXCELLENCE</h4>
            <h3 className="text-7xl font-aboreto">CHEF VELEZ</h3>
            <p className="text-xl">Where Culinary Dreams Come to Life</p>
            <ActionList
              actions={[
                {
                  label: 'Reserve Your Experience',
                  url: '#',
                },
              ]}
            />
          </div>
        }
      /> */}
    </>
  );
}
