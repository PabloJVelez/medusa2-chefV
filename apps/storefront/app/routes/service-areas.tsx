import { ActionList } from '@app/components/common/actions-list/ActionList';
import { Container } from '@app/components/common/container';
import Hero from '@app/components/sections/Hero';
import { ButtonStyleVariant } from '@libs/types';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';

export const loader = async (_args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = () => [
  { title: 'Private Chef Service Areas: Park City & Salt Lake City | Chef Luis Velez' },
  {
    name: 'description',
    content:
      'Chef Luis Velez serves Park City, Salt Lake City, and surrounding areas with private dinners, vacation-rental meals, cooking classes, and buffet-style events.',
  },
  { property: 'og:title', content: 'Park City & Salt Lake City Private Chef | Chef Luis Velez' },
  {
    property: 'og:description',
    content:
      'Personalized private dining for homes, vacation rentals, retreats, and celebrations in Park City, Salt Lake City, and surrounding areas.',
  },
  { property: 'og:type', content: 'website' },
];

const serviceAreaSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Chef Luis Velez',
  url: 'https://chefvelez.com/service-areas',
  description: 'Private chef serving Park City, Salt Lake City, and surrounding areas in Utah.',
  areaServed: [
    { '@type': 'City', name: 'Park City', containedInPlace: { '@type': 'State', name: 'Utah' } },
    { '@type': 'City', name: 'Salt Lake City', containedInPlace: { '@type': 'State', name: 'Utah' } },
  ],
  makesOffer: [
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private plated dinners' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cooking classes' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Buffet-style events' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Vacation-rental meals' } },
  ],
};

const primaryAreas = [
  {
    id: 'park-city',
    title: 'Park City',
    description:
      'Come home from the slopes to a chef-prepared meal, gather friends for a birthday, or settle in for a relaxed dinner during your mountain getaway. Make your vacation home part of the experience.',
  },
  {
    id: 'salt-lake-city',
    title: 'Salt Lake City',
    description:
      'Turn an evening at home into an occasion. Bring family together, celebrate a milestone, or host friends over a personalized menu while Chef Luis takes care of the cooking.',
  },
];

const experiences = [
  {
    title: 'Private dinners',
    description: 'A personalized plated menu for an intimate evening or special celebration.',
  },
  {
    title: 'Vacation-rental meals',
    description: 'Chef-prepared dining that lets your group spend more time enjoying the trip.',
  },
  { title: 'Cooking classes', description: 'A hands-on culinary experience to share with friends or family.' },
  { title: 'Buffet-style events', description: 'A welcoming spread for group gatherings and relaxed celebrations.' },
];

const faqItems = [
  {
    question: 'Can you cook at our vacation rental?',
    answer:
      'Yes. Share the property details and kitchen setup with your request so Chef Luis can plan a meal that fits your stay.',
  },
  {
    question: 'How do I request a private chef experience?',
    answer:
      'Browse the menus and send an event request with your date, location, guest count, and preferred experience. Chef Luis will follow up to discuss your menu and event details.',
  },
];

export default function ServiceAreasRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaSchema) }} />

      <Container className="!px-0 py-0 sm:!p-16">
        <Hero
          className="min-h-[360px] sm:min-h-[390px] lg:min-h-[420px] !max-w-full bg-accent-50 sm:rounded-3xl px-6 py-10 sm:p-10 md:p-16 lg:p-20"
          content={
            <div className="text-center w-full space-y-6 md:space-y-8">
              <p className="text-base md:text-2xl font-italiana tracking-wider">SERVICE AREAS</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-italiana tracking-wider [text-shadow:_1px_1px_2px_rgb(0_0_0_/_30%)]">
                Private Chef in Park City and Salt Lake City
              </h1>
              <p className="mx-auto text-base md:text-xl lg:text-2xl !leading-normal max-w-4xl">
                Bring everyone together over a personalized meal. Chef Luis Velez creates memorable dining experiences
                for gatherings at home and time away.
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
                <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">{area.title}</h2>
                <p className="text-lg leading-relaxed text-primary-700">{area.description}</p>
              </div>
            </section>
          ))}
        </div>
      </Container>

      <Container className="py-12 lg:py-20 bg-gray-50 sm:!px-16">
        <h2 className="font-italiana text-4xl md:text-5xl text-primary-900 text-center mb-10">Find Your Experience</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((experience) => (
            <section key={experience.title} className="bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-primary-900">{experience.title}</h3>
              <p className="mt-3 text-primary-700">{experience.description}</p>
            </section>
          ))}
        </div>
      </Container>

      <Container className="py-12 lg:py-20 sm:!px-16">
        <div className="text-center mb-10">
          <h2 className="font-italiana text-4xl md:text-5xl text-primary-900">Planning Your Experience</h2>
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
          <h2 className="font-italiana text-4xl md:text-5xl text-white mb-4">Planning a Private Dinner?</h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
            Send the event date, location, guest count, and style of experience. Chef Luis will review availability and
            help shape the right menu for the occasion.
          </p>
          <p className="text-white/90 mb-6">Hosting nearby? Include your event location in your request.</p>
          <ActionList
            actions={[
              { label: 'Request Your Event', url: '/request', style_variant: ButtonStyleVariant.PRIMARY },
              { label: 'Browse Menus', url: '/menus' },
            ]}
            className="flex-col gap-4 sm:flex-row sm:justify-center"
          />
        </div>
      </Container>
    </>
  );
}
