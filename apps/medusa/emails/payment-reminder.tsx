import PaymentReminderEmail from '../src/modules/resend/emails/payment-reminder';
import type { PaymentReminderEmailProps } from '../src/modules/resend/emails/payment-reminder';

export const previewProps: PaymentReminderEmailProps = {
  customer: {
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    phone: '(555) 987-6543',
  },
  booking: {
    date: 'Saturday, March 1, 2025',
    time: '7:00 PM',
    event_type: 'Corporate Dinner',
    location_type: 'Office Space',
    location_address: '500 Congress Ave, Suite 2000, Austin, TX 78701',
    party_size: 20,
    notes: 'Team celebration dinner. Mix of dietary restrictions - 3 vegetarian, 2 gluten-free.',
  },
  event: {
    status: 'confirmed',
    total_price: '3000.00',
    price_per_person: '150.00',
  },
  product: {
    id: 'prod_02DEF456',
    handle: 'corporate-dinner-experience',
    title: 'Corporate Dinner Experience',
    purchase_url: 'https://chefvelez.com/products/corporate-dinner-experience',
  },
  remainingTickets: 8,
  chef: {
    name: 'Chef Luis Velez',
    email: 'luis@chefvelez.com',
    phone: '(702) 349-6158',
  },
  requestReference: 'EVT-2025-0301-002',
  customNotes: 'Hi Michael! Just a friendly reminder that there are still 8 spots available for your team dinner. Let me know if you need any help encouraging your colleagues to sign up!',
};

export default function PaymentReminderPreview() {
  return <PaymentReminderEmail {...previewProps} />;
}
