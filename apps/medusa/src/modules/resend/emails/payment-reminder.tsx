import {
  Text,
  Column,
  Container,
  Heading,
  Html,
  Row,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Button,
} from '@react-email/components';

export type PaymentReminderEmailProps = {
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  booking: {
    date: string;
    time: string;
    event_type: string;
    location_type: string;
    location_address: string;
    party_size: number;
    notes: string;
  };
  event: {
    status: string;
    total_price: string;
    price_per_person: string;
  };
  product: {
    id: string;
    handle: string;
    title: string;
    purchase_url: string;
  } | null;
  remainingTickets: number;
  chef: {
    name: string;
    email: string;
    phone: string;
  };
  requestReference: string;
  customNotes?: string;
};

function PaymentReminderEmailComponent({
  customer,
  booking,
  event,
  product,
  remainingTickets = 0, // Default to 0 if not provided
  chef,
  requestReference,
  customNotes,
}: PaymentReminderEmailProps) {
  // Ensure remainingTickets is a valid number
  const tickets = typeof remainingTickets === 'number' ? remainingTickets : 0;

  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Reminder: Purchase remaining tickets for your chef event</Preview>
        <Body className="bg-white my-10 mx-auto w-full max-w-2xl">
          {/* Header */}
          <Section className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <Container>
              <Row>
                <Column>
                  <Heading className="text-2xl font-bold m-0 text-white">💳 Payment Reminder</Heading>
                  <Text className="text-orange-100 m-0">Complete your event ticket purchase</Text>
                </Column>
              </Row>
            </Container>
          </Section>

          {/* Main Content */}
          <Container className="p-6">
            <Heading className="text-2xl font-bold text-gray-800 mb-4">Hi {customer.first_name}!</Heading>
            <Text className="text-gray-600 mb-6">
              This is a friendly reminder that there are still{' '}
              <strong>
                {tickets} ticket{tickets !== 1 ? 's' : ''}
              </strong>{' '}
              available for your upcoming chef event. Complete your purchase to secure all spots for your guests!
            </Text>

            {/* Remaining Tickets Highlight */}
            <Section className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
              <Heading className="text-xl font-bold text-orange-800 mb-2">🎫 Remaining Tickets</Heading>
              <Text className="text-3xl font-bold text-orange-600 mb-2">{tickets}</Text>
              <Text className="text-gray-600">
                {tickets === 1
                  ? `ticket remaining at $${event.price_per_person} per person`
                  : `tickets remaining at $${event.price_per_person} per person`}
              </Text>
              {tickets > 1 && (
                <Text className="text-gray-600 mt-2">
                  Total for all remaining tickets:{' '}
                  <strong>${(parseFloat(event.price_per_person) * tickets).toFixed(2)}</strong>
                </Text>
              )}
            </Section>

            {/* Custom Notes from Chef */}
            {customNotes && (
              <Section className="bg-blue-50 rounded-lg p-6 mb-6">
                <Heading className="text-lg font-semibold text-gray-800 mb-4">Message from Chef Luis Velez</Heading>
                <Text className="text-gray-600 italic">"{customNotes}"</Text>
              </Section>
            )}

            {/* Event Details */}
            <Section className="bg-gray-50 rounded-lg p-6 mb-6">
              <Heading className="text-lg font-semibold text-gray-800 mb-4">Your Event Details</Heading>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="font-semibold text-gray-700">Date & Time</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-gray-600">
                    {booking.date} at {booking.time}
                  </Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="font-semibold text-gray-700">Event Type</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-gray-600">{booking.event_type}</Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="font-semibold text-gray-700">Party Size</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-gray-600">{booking.party_size} guests</Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="font-semibold text-gray-700">Location</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-gray-600">
                    {booking.location_type} - {booking.location_address}
                  </Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="font-semibold text-gray-700">Price per Person</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-gray-600">${event.price_per_person}</Text>
                </Column>
              </Row>
            </Section>

            {/* Purchase CTA */}
            {product && (
              <Section className="bg-green-50 rounded-lg p-6 mb-6">
                <Heading className="text-lg font-semibold text-gray-800 mb-4">Complete Your Purchase</Heading>
                <Text className="text-gray-600 mb-4">
                  Click the button below to purchase the remaining tickets and secure all spots for your event.
                </Text>

                <Row className="text-center">
                  <Column>
                    <Button
                      href={product.purchase_url}
                      className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg"
                    >
                      Purchase Remaining Tickets
                    </Button>
                  </Column>
                </Row>
                <Text className="text-center text-gray-500 text-sm mt-4">
                  Or copy this link: {product.purchase_url}
                </Text>
              </Section>
            )}

            {/* Important Information */}
            <Section className="bg-yellow-50 rounded-lg p-6 mb-6">
              <Heading className="text-lg font-semibold text-gray-800 mb-4">Important Reminders</Heading>
              <Text className="text-gray-600 mb-3">
                • Tickets are limited and available on a first-come, first-served basis
              </Text>
              <Text className="text-gray-600 mb-3">
                • Complete your purchase soon to ensure all your guests can attend
              </Text>
              <Text className="text-gray-600 mb-3">• Chef Luis Velez will contact you 24 hours before the event</Text>
              <Text className="text-gray-600">
                • Contact us immediately if you have any questions or need assistance
              </Text>
            </Section>

            {/* Reference Number */}
            <Section className="text-center mb-6">
              <Text className="text-sm text-gray-500">
                Reference: <strong>{requestReference}</strong>
              </Text>
            </Section>
          </Container>

          {/* Footer */}
          <Section className="bg-gray-50 p-6">
            <Container>
              <Row>
                <Column>
                  <Text className="text-center text-gray-500 text-sm mb-4">
                    Questions? Contact Chef Luis Velez at {chef.email} or {chef.phone}
                  </Text>
                  <Text className="text-center text-gray-400 text-xs">
                    © {new Date().getFullYear()} Chef Luis Velez. All rights reserved.
                  </Text>
                </Column>
              </Row>
            </Container>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  );
}

export const paymentReminderEmail = (props: PaymentReminderEmailProps) => <PaymentReminderEmailComponent {...props} />;

export default PaymentReminderEmailComponent;
