import ChefEventRequestedEmail from '../src/modules/resend/emails/chef-event-requested';
import type { ChefEventRequestedEmailProps } from '../src/modules/resend/emails/chef-event-requested';

// Customer confirmation version
export const customerPreviewProps: ChefEventRequestedEmailProps = {
  customer: {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '(555) 234-5678',
  },
  booking: {
    date: 'Friday, April 18, 2025',
    time: '6:30 PM',
    menu: 'Mediterranean Feast',
    event_type: 'Anniversary Dinner',
    location_type: 'Private Residence',
    location_address: '456 Maple Drive, Austin, TX 78703',
    party_size: 8,
    notes: '10th wedding anniversary celebration. Husband loves Greek cuisine. One guest has a nut allergy.',
  },
  event: {
    status: 'pending',
    total_price: '1200.00',
    conflict: false,
  },
  requestReference: 'EVT-2025-0418-003',
  chefContact: {
    email: 'luis@chefvelez.com',
    phone: '(702) 349-6158',
  },
  emailType: 'customer_confirmation',
};

// Chef notification version
export const chefPreviewProps: ChefEventRequestedEmailProps = {
  ...customerPreviewProps,
  emailType: 'chef_notification',
  magicLinkUrl: 'https://admin.chefvelez.com/events/EVT-2025-0418-003?token=abc123xyz',
};

export const previewProps = customerPreviewProps;

export default function ChefEventRequestedPreview() {
  return <ChefEventRequestedEmail {...previewProps} />;
}
