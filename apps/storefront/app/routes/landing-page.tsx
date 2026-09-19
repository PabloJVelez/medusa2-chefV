import { Container } from "@app/components/common/container";
import { Image } from "@app/components/common/images/Image";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export const loader = async (_args: LoaderFunctionArgs) => {
  return {};
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Lake Tahoe Private Chef Giveaway - Chef Luis Velez" },
    {
      name: "description",
      content:
        "Enter to win a private Chef Velez dinner in the Lake Tahoe and Carson Valley area.",
    },
    {
      property: "og:title",
      content: "Win a Free Private Chef Dinner - Chef Luis Velez",
    },
    {
      property: "og:description",
      content:
        "Lake Tahoe and Carson Valley hosts can enter to win a private chef dinner experience.",
    },
    { property: "og:type", content: "website" },
    {
      name: "keywords",
      content:
        "Lake Tahoe private chef giveaway, Carson City private chef, Chef Luis Velez, private dinner Lake Tahoe",
    },
  ];
};

const prizeDetails = [
  "Grand prize: private chef dinner experience",
  "Standard curated menu and standard groceries included",
  "On-site cooking in your home or vacation rental",
  "Full service including post-event cleanup",
];

const exclusions = [
  "Alcohol",
  "Premium ingredient upgrades",
  "Specialty rentals",
  "Extra guests or additional staff",
  "Travel outside the agreed service area",
];

const leadQuestions = [
  {
    icon: CalendarDaysIcon,
    title: "Dinner at Your Place",
    description:
      "Chef Velez cooks in your home or vacation rental, so the night feels private, relaxed, and personal.",
  },
  {
    icon: UsersIcon,
    title: "A Real Hosted Night",
    description:
      "The prize is a hosted private dinner experience with a curated menu, service, and cleanup.",
  },
  {
    icon: MapPinIcon,
    title: "Local to Tahoe",
    description:
      "Open to eligible hosts in Lake Tahoe, Carson Valley, Carson City, Stateline, Zephyr Cove, and nearby areas.",
  },
];

const timelineItems = [
  {
    title: "Enter the Giveaway",
    description:
      "Tell us where you would host and what kind of dinner night you have in mind.",
  },
  {
    title: "Grand Prize Drawing",
    description:
      "One eligible entrant receives a private Chef Velez dinner experience.",
  },
  {
    title: "Host Bonus Offers",
    description:
      "Select entrants may receive a limited-time bonus toward a future private event.",
  },
];

const trustHighlights = [
  "Full private dinner experience",
  "Lake Tahoe and Carson Valley service area",
  "No purchase necessary",
];

const heroStats = [
  {
    value: "Full Service",
    label: "Dinner, service, and post-event cleanup",
  },
  {
    value: "Local",
    label: "Lake Tahoe and Carson Valley area",
  },
  {
    value: "Free Entry",
    label: "No purchase necessary",
  },
];

const inputClassName =
  "mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-primary-900 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200";

const labelClassName =
  "text-sm font-semibold uppercase tracking-wide text-primary-700";

export default function LandingPageRoute() {
  return (
    <>
      <link
        rel="preload"
        href="/assets/images/chef_scallops_home.jpg"
        as="image"
      />

      <section className="relative -mt-[var(--mkt-header-height)] md:-mt-[var(--mkt-header-height-desktop)] min-h-[760px] overflow-hidden bg-primary-900 pt-[var(--mkt-header-height)] md:pt-[var(--mkt-header-height-desktop)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.62) 52%, rgba(15,23,42,0.24) 100%), url(/assets/images/chef_scallops_home.jpg)",
          }}
        />
        <Container className="relative z-10 flex min-h-[760px] items-center py-14">
          <div className="max-w-3xl text-white">
            <p className="mb-5 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              Lake Tahoe Private Chef Giveaway
            </p>
            <h1 className="font-italiana text-5xl leading-tight text-white md:text-7xl lg:text-8xl">
              Win a Free Private Chef Dinner
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-2xl">
              Chef Luis Velez will bring the restaurant experience to one
              winner's home or vacation rental, including a curated menu,
              on-site cooking, full service, and post-event cleanup.
            </p>
            <div className="mt-6 flex max-w-2xl flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-white">
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur">
                Grand Prize
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur">
                Tahoe + Carson Valley
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur">
                No Purchase Necessary
              </span>
            </div>
            <div className="mt-8">
              <a
                href="#enter"
                className="inline-flex items-center justify-center rounded-full border border-white bg-white px-8 py-4 text-base font-semibold text-primary-900 shadow-xl transition-colors hover:bg-highlight-100"
              >
                Enter Giveaway
              </a>
            </div>
            <p className="mt-5 text-sm text-white/75">
              Drawing details and winner instructions will be sent by email.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-accent-700 text-primary-900">
        <Container className="grid grid-cols-1 gap-4 py-5 sm:!px-16 md:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.value}
              className="text-center md:border-r md:border-primary-900/20 md:last:border-r-0"
            >
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-primary-900/75">
                {stat.label}
              </p>
            </div>
          ))}
        </Container>
      </section>

      <Container className="py-12 lg:py-20 sm:!px-16">
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">
              Grand Prize
            </p>
            <h2 className="font-italiana text-4xl text-primary-900 md:text-6xl">
              Your Dinner Is Handled
            </h2>
            <p className="text-lg leading-relaxed text-primary-700">
              If your entry is selected, Chef Velez handles the menu, cooking,
              service, and cleanup so you can enjoy the table instead of
              managing the kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 border-y border-primary-900/10 py-6 md:grid-cols-2 lg:border-y-0 lg:border-l lg:py-0 lg:pl-10">
            <div>
              <h3 className="text-xl font-semibold text-primary-900">
                Included in the Prize
              </h3>
              <ul className="mt-5 grid grid-cols-1 gap-4">
                {prizeDetails.map((detail) => (
                  <li key={detail} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-700" />
                    <span className="text-primary-800">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-900">
                Optional Add-Ons
              </h3>
              <p className="mt-3 leading-relaxed text-primary-700">
                These can be arranged separately after eligibility and
                availability are confirmed.
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-3">
                {exclusions.map((item) => (
                  <li
                    key={item}
                    className="border-l border-primary-900/20 pl-4 text-primary-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </Container>

      <Container className="bg-highlight-100 py-12 lg:py-20 sm:!px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">
            Why Enter
          </p>
          <h2 className="mt-3 font-italiana text-4xl text-primary-900 md:text-6xl">
            A Private Chef Night Without the Work
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {leadQuestions.map(({ icon: Icon, title, description }) => (
            <section
              key={title}
              className="rounded-lg border border-white/70 bg-white p-6 shadow-sm"
            >
              <Icon className="h-8 w-8 text-accent-700" />
              <h3 className="mt-4 text-xl font-semibold text-primary-900">
                {title}
              </h3>
              <p className="mt-3 leading-relaxed text-primary-700">
                {description}
              </p>
            </section>
          ))}
        </div>
      </Container>

      <Container id="enter" className="py-12 lg:py-20 sm:!px-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <section className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">
              Enter
            </p>
            <h2 className="font-italiana text-4xl text-primary-900 md:text-6xl">
              Enter in Under a Minute
            </h2>
            <p className="text-lg leading-relaxed text-primary-700">
              Tell us where you would host and what kind of dinner night you
              have in mind. The form is short on purpose.
            </p>
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/assets/images/chef_book_experience.jpg"
                alt="Chef Luis Velez plating a private dining experience"
                width={900}
                height={560}
                className="h-[360px] w-full object-cover"
                fallbackSrc={[
                  "/assets/images/chef_experience.jpg",
                  "/assets/images/plated_dinner.jpg",
                ]}
              />
            </div>
          </section>

          <form
            action="/request"
            method="get"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg lg:p-8"
          >
            <input type="hidden" name="campaign" value="lake-tahoe-giveaway" />
            <div className="mb-6 rounded-lg border border-accent-100 bg-highlight-100 p-4">
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-700" />
                <div>
                  <p className="font-semibold text-primary-900">
                    Do not miss the drawing email.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-primary-700">
                    Enter now and watch your inbox for eligibility, timing, and
                    winner details.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block">
                <span className={labelClassName}>First Name</span>
                <input
                  className={inputClassName}
                  name="firstName"
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClassName}>Last Name</span>
                <input
                  className={inputClassName}
                  name="lastName"
                  autoComplete="family-name"
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClassName}>Email</span>
                <input
                  className={inputClassName}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClassName}>Phone</span>
                <input
                  className={inputClassName}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClassName}>Event Location</span>
                <input
                  className={inputClassName}
                  name="eventLocation"
                  placeholder="City, neighborhood, or rental area"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClassName}>Occasion</span>
                <select
                  className={inputClassName}
                  name="occasion"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Family gathering</option>
                  <option>Vacation rental dinner</option>
                  <option>Holiday party</option>
                  <option>Ski trip dinner</option>
                  <option>Corporate retreat</option>
                  <option>Proposal or celebration</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClassName}>Guest Count</span>
                <select
                  className={inputClassName}
                  name="guestCount"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select range
                  </option>
                  <option>2-5</option>
                  <option>6-8</option>
                  <option>9-10</option>
                  <option>11+</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClassName}>Timing</span>
                <select
                  className={inputClassName}
                  name="eventTiming"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select timing
                  </option>
                  <option>Within 30 days</option>
                  <option>31-60 days</option>
                  <option>61-90 days</option>
                  <option>More than 90 days</option>
                  <option>Just exploring</option>
                </select>
              </label>
            </div>

            <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-primary-700">
              <input
                className="mt-1 rounded border-gray-300 text-primary-900 focus:ring-accent-500"
                type="checkbox"
                name="smsConsent"
                value="yes"
              />
              <span>
                Yes, text me Chef Velez offers and giveaway updates. Consent is
                not required to enter or purchase. Message and data rates may
                apply.
              </span>
            </label>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-primary-900 bg-primary-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Enter to Win
            </button>
            <div className="mt-5 grid grid-cols-1 gap-2">
              {trustHighlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-center gap-2 text-sm text-primary-700"
                >
                  <StarIcon className="h-4 w-4 flex-shrink-0 text-accent-700" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-primary-600">
              No purchase necessary. A purchase does not increase your chance of
              winning.
            </p>
          </form>
        </div>
      </Container>

      <Container className="bg-primary-900 py-12 text-white lg:py-20 sm:!px-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">
              How It Works
            </p>
            <h2 className="mt-3 font-italiana text-4xl text-white md:text-6xl">
              How the Giveaway Works
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              A simple entry, one grand prize drawing, and optional host bonus
              offers for future private events.
            </p>
          </section>
          <div className="grid grid-cols-1 gap-4">
            {timelineItems.map((item, index) => (
              <section
                key={item.title}
                className="rounded-lg border border-white/15 bg-white/10 p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary-900">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-white/80">
                      {item.description}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>

      <Container className="py-12 lg:py-20 sm:!px-16">
        <div className="grid grid-cols-1 gap-8 rounded-lg border border-accent-100 bg-highlight-100 p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-10">
          <div>
            <div className="flex items-center gap-3 text-accent-700">
              <SparklesIcon className="h-7 w-7" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                Tahoe Host Bonus
              </p>
            </div>
            <h2 className="mt-3 font-italiana text-4xl text-primary-900 md:text-5xl">
              You Do Not Need to Win to Host
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-700">
              Entrants may receive a host bonus on a future private event, such
              as a signature starter course or dessert finale.
            </p>
          </div>
          <Link
            to="/request"
            className="inline-flex items-center justify-center rounded-full border border-primary-900 bg-primary-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-800"
          >
            Check Availability
          </Link>
        </div>
      </Container>

      <Container className="pb-14 sm:!px-16">
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-primary-600 md:flex-row md:items-center md:justify-between">
          <p>
            No purchase necessary. A purchase does not increase your chance of
            winning.
          </p>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            <span>Official rules and winner details coming soon.</span>
          </div>
        </div>
      </Container>
    </>
  );
}
