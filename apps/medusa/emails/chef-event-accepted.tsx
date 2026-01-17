import ChefEventAcceptedEmail from '../src/modules/resend/emails/chef-event-accepted';
import type { ChefEventAcceptedEmailProps } from '../src/modules/resend/emails/chef-event-accepted';

export const previewProps: ChefEventAcceptedEmailProps = {
  customer: {
    first_name: 'David',
    last_name: 'Thompson',
    email: 'david.thompson@example.com',
    phone: '(555) 345-6789',
  },
  booking: {
    date: 'Saturday, May 10, 2025',
    time: '7:30 PM',
    menu: 'Five-Course Italian Tasting',
    event_type: 'Birthday Celebration',
    location_type: 'Private Residence',
    location_address: '789 Cedar Lane, Austin, TX 78704',
    party_size: 16,
    notes: 'Surprise 40th birthday for wife. She loves Italian food, especially fresh pasta. One guest is pescatarian.',
  },
  event: {
    status: 'confirmed',
    total_price: '2400.00',
    price_per_person: '150.00',
    deposit_required: '600.00',
    deposit_deadline: 'Friday, April 25, 2025',
    minimum_tickets: 4,
    is_full_deposit: false,
  },
  product: {
    id: 'prod_03GHI789',
    handle: 'italian-tasting-experience',
    title: 'Five-Course Italian Tasting Experience',
    purchase_url: 'https://chefvelez.com/products/italian-tasting-experience',
  },
  chef: {
    name: 'Chef Luis Velez',
    email: 'luis@chefvelez.com',
    phone: '(702) 349-6158',
  },
  requestReference: 'EVT-2025-0510-004',
  acceptanceDate: 'Monday, April 7, 2025',
  chefNotes: 'I am so excited to help you celebrate this special milestone! Fresh handmade pasta is my specialty. I will reach out soon to discuss menu details and ensure we create the perfect surprise.',
  emailType: 'customer_acceptance',
};

export default function ChefEventAcceptedPreview() {
  return <ChefEventAcceptedEmail {...previewProps} />;
}
