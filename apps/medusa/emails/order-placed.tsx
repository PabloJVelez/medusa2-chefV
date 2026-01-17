import OrderPlacedEmail from '../src/modules/resend/emails/order-placed';
import type { OrderPlacedEmailProps } from '../src/modules/resend/emails/order-placed';

export const previewProps: OrderPlacedEmailProps = {
  order: {
    id: 'order_01HJ8KXYZABC123DEF456',
    display_id: 1042,
    currency_code: 'usd',
    customer: {
      id: 'cus_01ABC123',
      first_name: 'Amanda',
      last_name: 'Smith',
      email: 'amanda.smith@example.com',
    },
    shipping_address: {
      first_name: 'Amanda',
      last_name: 'Smith',
      address_1: '555 River Road',
      city: 'Austin',
      province: 'TX',
      postal_code: '78701',
      country_code: 'US',
    },
    items: [
      {
        id: 'item_01ABC',
        product_title: 'Private Chef Dinner Experience',
        variant_title: '4 Guests',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        quantity: 1,
        total: 600,
      },
      {
        id: 'item_02DEF',
        product_title: 'Wine Pairing Add-on',
        variant_title: 'Premium Selection',
        thumbnail: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
        quantity: 1,
        total: 120,
      },
    ],
    shipping_methods: [
      {
        id: 'ship_01ABC',
        name: 'Standard Delivery',
        total: 0,
      },
    ],
    item_total: 720,
    tax_total: 59.40,
    total: 779.40,
  } as any,
};

export default function OrderPlacedPreview() {
  return <OrderPlacedEmail {...previewProps} />;
}
