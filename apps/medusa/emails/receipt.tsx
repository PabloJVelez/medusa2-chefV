import ReceiptEmail from '../src/modules/resend/emails/receipt';
import type { ReceiptEmailProps } from '../src/modules/resend/emails/receipt';

export const previewProps: ReceiptEmailProps = {
  customer: {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
  },
  booking: {
    date: 'Saturday, February 15, 2025',
    time: '6:00 PM',
    event_type: 'Dinner Party',
    location_type: 'Private Residence',
    location_address: '123 Oak Street, Austin, TX 78701',
    party_size: 12,
    notes: 'Outdoor patio setup. Guest of honor is celebrating 50th birthday. Please include a birthday cake if possible.',
  },
  event: {
    status: 'confirmed',
    total_price: '1800.00',
    price_per_person: '150.00',
  },
  product: {
    id: 'prod_01ABC123',
    handle: 'dinner-party-experience',
    title: 'Private Dinner Party Experience',
    purchase_url: 'https://chefvelez.com/products/dinner-party-experience',
  },
  purchasedTickets: 12,
  totalPurchasedPrice: '1800.00',
  tipAmount: 250,
  tipMethod: 'Cash',
  chef: {
    name: 'Chef Luis Velez',
    email: 'luis@chefvelez.com',
    phone: '(702) 349-6158',
  },
  requestReference: 'EVT-2025-0215-001',
  receiptDate: '2025-02-15',
};

export default function ReceiptPreview() {
  return <ReceiptEmail {...previewProps} />;
}
