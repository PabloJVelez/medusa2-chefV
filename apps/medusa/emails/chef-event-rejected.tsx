import ChefEventRejectedEmail from '../src/modules/resend/emails/chef-event-rejected';
import type { ChefEventRejectedEmailProps } from '../src/modules/resend/emails/chef-event-rejected';

export const previewProps: ChefEventRejectedEmailProps = {
  customer: {
    first_name: 'Jessica',
    last_name: 'Williams',
    email: 'jessica.williams@example.com',
    phone: '(555) 456-7890',
  },
  booking: {
    date: 'Saturday, June 14, 2025',
    time: '6:00 PM',
    menu: 'Seafood Extravaganza',
    event_type: 'Graduation Party',
    location_type: 'Private Residence',
    location_address: '321 Pine Street, Austin, TX 78705',
    party_size: 30,
    notes: 'College graduation celebration for daughter. Large outdoor space available.',
  },
  rejection: {
    reason: 'Unfortunately, I am already booked for another event on this date. I would love to help you celebrate this important milestone on an alternative date.',
    chefNotes: 'Jessica, congratulations to your daughter on her graduation! I have availability on June 21st or June 28th if either of those dates work for your celebration. Please feel free to submit a new request or contact me directly to discuss options.',
  },
  chef: {
    name: 'Chef Luis Velez',
    email: 'luis@chefvelez.com',
    phone: '(702) 349-6158',
  },
  requestReference: 'EVT-2025-0614-005',
  rejectionDate: 'Wednesday, May 28, 2025',
  emailType: 'customer_rejection',
};

export default function ChefEventRejectedPreview() {
  return <ChefEventRejectedEmail {...previewProps} />;
}
