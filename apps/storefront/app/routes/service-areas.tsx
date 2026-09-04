import { ActionList } from '@app/components/common/actions-list/ActionList';
import { Container } from '@app/components/common/container';
import Hero from '@app/components/sections/Hero';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';

export const loader = async (_args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: 'Service Areas - Chef Luis Velez' },
    {
      name: 'description',
      content:
        'Chef Luis Velez is a private chef based in Carson City, Nevada, serving private dinners, cooking classes, and events across Carson City, Reno, and the Lake Tahoe area.',
    },
    { property: 'og:title', content: 'Service Areas - Chef Luis Velez' },
    {
      property: 'og:description',
      content:
        'Private chef services for Carson City, Reno, and Lake Tahoe events, vacation rentals, cabins, retreats, and intimate in-home dinners.',
    },
    { property: 'og:type', content: 'website' },
    {
      name: 'keywords',
      content:
        'private chef Carson City, private chef Lake Tahoe, personal chef Carson City NV, vacation rental chef Lake Tahoe, in-home chef Nevada',
    },
  ];
};

const serviceAreaSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Chef Luis Velez',
  url: 'https://chefvelez.com/service-areas',
  description:
    'Private chef services based in Carson City, Nevada, serving Carson City, Reno, and the Lake Tahoe area.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Carson City',
    addressRegion: 'NV',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'City', name: 'Carson City' },
    { '@type': 'City', name: 'Reno' },
    { '@type': 'Place', name: 'Lake Tahoe' },
    { '@type': 'City', name: 'South Lake Tahoe' },
    { '@type': 'City', name: 'Incline Village' },
    { '@type': 'City', name: 'Tahoe City' },
    { '@type': 'City', name: 'Truckee' },
  ],
  makesOffer: [
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private plated dinners' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cooking classes' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Buffet-style events' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Vacation rental private chef experiences' } },
  ],
};

const primaryAreas = [
  {
    id: 'carson-city',
    eyebrow: 'Home Base',
    title: 'Private Chef in Carson City, Nevada',
    description:
      'Chef Luis Velez is based in Carson City and creates at-home culinary experiences for private dinners, cooking classes, family gatherings, and small celebrations throughout the area.',
    details: [
      'In-home plated dinners',
      'Hands-on cooking classes',
      'Buffet-style gatherings',
      'Custom menus for special occasions',
    ],
  },
  {
    id: 'lake-tahoe',
    eyebrow: 'High-Intent Travel Market',
    title: 'Private Chef for Lake Tahoe Vacation Rentals and Events',
    description:
      'For Lake Tahoe guests, Chef Luis brings restaurant-quality dining to vacation homes, cabins, ski trips, retreats, anniversaries, birthdays, and intimate group dinners.',
    details: [
      'Vacation rental dinners',
      'Cabin and ski trip meals',
      'Retreat and celebration menus',
      'Travel planning for Tahoe-area events',
    ],
  },
];

const nearbyAreas = ['Reno', 'South Lake Tahoe', 'Incline Village', 'Tahoe City', 'Truckee'];

const faqItems = [
  {
    question: 'Does Chef Luis Velez travel to Lake Tahoe?',
    answer:
      'Yes. Chef Luis is based in Carson City and serves Lake Tahoe-area private dinners, vacation rental events, retreats, and special occasions when scheduling and travel logistics align.',
  },
  {
    question: 'Can I book a private chef for a Lake Tahoe vacation rental?',
    answer:
      'Yes. Vacation rental dinners are a strong fit for plated dinners, family gatherings, ski trip meals, anniversaries, birthdays, and relaxed group celebrations.',
  },
  {
    question: 'What areas does Chef Luis serve from Carson City?',
    answer:
      'Chef Luis primarily serves Carson City and nearby Nevada communities, with Lake Tahoe, Reno, Incline Village, Tahoe City, Truckee, and South Lake Tahoe considered for private events.',
  },
  {
    question: 'Are travel fees required for Lake Tahoe events?',
    answer:
      'Travel needs depend on the exact location, party size, date, and kitchen setup. Share the event address or neighborhood in the request so Chef Luis can confirm availability and any travel details.',
  },
];

export default function ServiceAreasRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaSchema) }} />

      <Container className="!px-0 py-0 sm:!p-16">
        <Hero
          className="min-h-[420px] !max-w-full bg-accent-50 sm:rounded-3xl p-6 sm:p-10 md:p-[88px] md:px-[88px]"
          content={
            <div className="text-center w-full space-y-8">
              <p className="text-lg md:text-2xl font-italiana tracking-wider">SERVICE AREAS</p>
              <h1 className="text-4xl md:text-7xl font-italiana tracking-wider [text-shadow:_1px_1px_2px_rgb(0_0_0_/_30%)]">
                Private Chef in Carson City and Lake Tahoe
              </h1>
              <p className="mx-auto text-md md:text-2xl !leading-normal max-w-4xl">
                Chef Luis Velez is based in Carson City, Nevada, and serves private dinners, cooking classes, and event
                dining throughout Carson City, Reno, and the Lake Tahoe area.
              </p>
            </div>
          }
          actionsClassName="!flex-row w-full justify-center !font-base"
          actions={[
            { label: 'Request an Event', url: '/request' },
            { label: 'View Menus', url: '/menus' },
          ]}
        />
      </Container>

      <Container className="py-12 lg:py-20 sm:!px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {primaryAreas.map((area) => (
            <section key={area.id} id={area.id} className="space-y-6 scroll-mt-28">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-widest text-accent-700 font-semibold">{area.eyebrow}</p>
                <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">{area.title}</h2>
                <p className="text-lg leading-relaxed text-primary-700">{area.description}</p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-primary-700">
                {area.details.map((detail) => (
                  <li key={detail} className="border border-accent-100 bg-white px-4 py-3 rounded-lg">
                    {detail}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>

      <Container className="py-12 lg:py-20 bg-gray-50 sm:!px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-accent-700 font-semibold">Nearby Areas</p>
            <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">Available by Request</h2>
            <p className="text-lg leading-relaxed text-primary-700">
              Each event is reviewed for timing, distance, kitchen setup, and menu fit. Share the event location when
              requesting a date so Chef Luis can confirm the details.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nearbyAreas.map((area) => (
              <div key={area} className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="text-xl font-semibold text-primary-900">{area}</h3>
                <p className="mt-2 text-primary-700">Private chef service considered for dinners and events.</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container className="py-12 lg:py-20 sm:!px-16">
        <div className="text-center mb-10">
          <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">Service Area Questions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((faq) => (
            <section key={faq.question} className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-primary-900 mb-3 text-lg">{faq.question}</h3>
              <p className="text-primary-700 leading-relaxed">{faq.answer}</p>
            </section>
          ))}
        </div>
      </Container>

      <Container className="pb-20 sm:!px-16">
        <div className="text-center bg-accent-50 rounded-2xl p-8 md:p-12">
          <h2 className="font-italiana text-4xl md:text-5xl text-primary-900 mb-4">Planning a Private Dinner?</h2>
          <p className="text-lg text-primary-700 max-w-3xl mx-auto mb-8">
            Send the event date, location, guest count, and style of experience. Chef Luis will review availability and
            help shape the right menu for the occasion.
          </p>
          <ActionList
            actions={[
              { label: 'Request Your Event', url: '/request' },
              { label: 'Browse Menus', url: '/menus' },
            ]}
            className="flex-col gap-4 sm:flex-row sm:justify-center"
          />
        </div>
      </Container>
    </>
  );
}
