import EventDetailsResendEmail from '../src/modules/resend/emails/event-details-resend';
import type { EventDetailsResendEmailProps } from '../src/modules/resend/emails/event-details-resend';

export const previewProps: EventDetailsResendEmailProps = {
  customer: {
    first_name: 'Robert',
    last_name: 'Garcia',
    email: 'robert.garcia@example.com',
    phone: '(555) 567-8901',
  },
  booking: {
    date: 'Sunday, July 20, 2025',
    time: '5:00 PM',
    event_type: 'Family Reunion',
    location_type: 'Event Venue',
    location_address: '100 Event Center Blvd, Austin, TX 78702',
    party_size: 25,
    notes: 'Annual Garcia family reunion. Mix of adults and children. Need kid-friendly options alongside gourmet dishes.',
  },
  event: {
    status: 'confirmed',
    total_price: '3750.00',
    price_per_person: '150.00',
  },
  product: {
    id: 'prod_04JKL012',
    handle: 'family-reunion-package',
    title: 'Family Reunion Catering Package',
    purchase_url: 'https://chefvelez.com/products/family-reunion-package',
  },
  chef: {
    name: 'Chef Luis Velez',
    email: 'luis@chefvelez.com',
    phone: '(702) 349-6158',
  },
  requestReference: 'EVT-2025-0720-006',
  customNotes: 'Hi Robert! Here are your event details as requested. I am looking forward to creating a memorable meal for your family reunion. I will be in touch next week to finalize the menu and discuss the kid-friendly options.',
  emailType: 'event_details_resend',
};

export default function EventDetailsResendPreview() {
  return <EventDetailsResendEmail {...previewProps} />;
}
