import { Container } from '@app/components/common/container';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { getMergedPageMeta } from '@libs/util/page';
import Hero from '@app/components/sections/Hero';

type ServiceProps = {
  title: string;
  description: string;
  details: string[];
  imageUrl: string;
};

const services: ServiceProps[] = [
  {
    title: 'Private Dining',
    description: 'Intimate culinary experiences in the comfort of your home',
    details: [
      'Personalized menu planning',
      'Wine pairing recommendations',
      'Full service setup and cleanup',
      'Available for 2-20 guests'
    ],
    imageUrl: '/assets/images/location-1.png',
  },
  {
    title: 'Culinary Workshops',
    description: 'Interactive cooking experiences that educate and inspire',
    details: [
      'Hands-on cooking instruction',
      'Technique masterclasses',
      'Wine and food pairing sessions',
      'Group and private sessions'
    ],
    imageUrl: '/assets/images/location-2.png',
  },
  {
    title: 'Special Events',
    description: 'Elevating celebrations with exceptional cuisine',
    details: [
      'Corporate gatherings',
      'Wedding rehearsals',
      'Anniversary celebrations',
      'Holiday parties'
    ],
    imageUrl: '/assets/images/location-3.png',
  },
];

const Service = ({ title, description, details, imageUrl }: ServiceProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-16 text-xl">
      <div className="w-full h-full flex items-center justify-center col-span-2">
        <div
          className="bg-cover bg-no-repeat bg-center w-full rounded-3xl h-72"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        />
      </div>

      <div className="flex flex-col gap-4 col-span-1 md:justify-center">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg text-gray-600">{description}</p>
        <div className="mt-2">
          <h4 className="font-bold mb-2">What to Expect</h4>
          <ul className="space-y-2">
            {details.map((detail, index) => (
              <li key={index} className="text-base flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1"></span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const loader = async (args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = getMergedPageMeta;

export default function IndexRoute() {
  return (
    <>
      <Container className="!px-0 py-0 sm:!p-16">
        <Hero
          className="min-h-[400px] !max-w-full bg-accent-50 sm:rounded-3xl p-6 sm:p-10 md:p-[88px] md:px-[88px]"
          content={
            <div className="text-center w-full space-y-9">
              <h4 className="text-lg md:text-2xl font-italiana tracking-wider">ABOUT</h4>
              <h1 className="text-4xl md:text-8xl font-italiana tracking-wider [text-shadow:_1px_1px_2px_rgb(0_0_0_/_40%)]">
                Chef Velez
              </h1>
              <p className="mx-auto text-md md:text-2xl !leading-normal">
                Welcome to my culinary world, where exceptional dining experiences come to life. With a passion for creating 
                unforgettable moments through food, I specialize in crafting bespoke dining experiences that combine culinary artistry 
                with personalized service. From intimate dinner parties to grand celebrations, each event is thoughtfully curated to{' '}
                <span className="font-bold">create lasting memories through the art of fine dining.</span>
              </p>
            </div>
          }
          actionsClassName="!flex-row w-full justify-center !font-base"
          actions={[
            {
              label: 'Explore Menus',
              url: '/products',
            },
          ]}
        />
      </Container>

      <Container className="pt-4 flex flex-col gap-16 py-0 sm:!px-16 pb-44">
        <div className="font-italiana text-4xl break-words md:text-6xl lg:text-7xl">
          Crafting Memorable <span className="font-ballet text-[150%] leading-tight">Experiences</span>
        </div>
        {services.map((service, index) => (
          <Service key={index} {...service} />
        ))}
      </Container>
    </>
  );
}
