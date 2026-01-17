import { Text, Container, Html, Section, Head, Preview, Body, Link, Hr } from '@react-email/components';

export type ReceiptEmailProps = {
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
  purchasedTickets: number;
  totalPurchasedPrice: string;
  tipAmount?: number;
  tipMethod?: string;
  chef: {
    name: string;
    email: string;
    phone: string;
  };
  requestReference: string;
  receiptDate?: string;
  customNotes?: string;
};

// Helper function to format currency with thousands separators
const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

// Format date - parses YYYY-MM-DD without timezone conversion issues
const formatDate = (dateString?: string): string => {
  if (!dateString) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Parse the date string manually to avoid timezone issues
  // Expected format: YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Fallback for other formats
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function ReceiptEmailComponent({
  customer,
  booking,
  event,
  product,
  purchasedTickets = 0,
  totalPurchasedPrice,
  tipAmount,
  tipMethod,
  chef,
  requestReference,
  receiptDate,
  customNotes,
}: ReceiptEmailProps) {
  // Calculate totals
  const eventTotal = parseFloat(event.total_price);
  const tipTotal = tipAmount || 0;
  const grandTotal = eventTotal + tipTotal;

  return (
    <Html>
      <Head />
      <Preview>
        Receipt #{requestReference} - {formatCurrency(grandTotal)} from {chef.name}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <table width="100%" cellPadding="0" cellSpacing="0" style={headerTable}>
            <tr>
              <td style={headerLeft}>
                <Text style={logoText}>{chef.name}</Text>
              </td>
              <td style={headerRight}>
                <Text style={receiptLabel}>RECEIPT</Text>
              </td>
            </tr>
          </table>

          {/* Combined Bill To + Receipt Meta Section */}
          <table width="100%" cellPadding="0" cellSpacing="0" style={infoSection}>
            <tr>
              {/* Bill To - Left Side */}
              <td style={billToCell}>
                <table cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style={billToAccent}></td>
                    <td style={billToContent}>
                      <Text style={billToLabel}>BILL TO</Text>
                      <Text style={customerNameText}>
                        {customer.first_name} {customer.last_name}
                      </Text>
                      <Text style={customerDetailText}>{customer.email}</Text>
                      <Text style={customerDetailText}>{customer.phone}</Text>
                    </td>
                  </tr>
                </table>
              </td>

              {/* Receipt Details - Right Side */}
              <td style={metaCell}>
                <table cellPadding="0" cellSpacing="0" style={metaTable}>
                  <tr>
                    <td style={metaLabelCell}>Receipt #</td>
                    <td style={metaValueCell}>{requestReference}</td>
                  </tr>
                  <tr>
                    <td style={metaLabelCell}>Date</td>
                    <td style={metaValueCell}>{formatDate(receiptDate)}</td>
                  </tr>
                  <tr>
                    <td style={metaLabelCell}>Status</td>
                    <td style={metaValueCellStatus}>
                      <span style={paidStatus}>PAID</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <Hr style={divider} />

          {/* Line Items */}
          <Section style={lineItemsSection}>
            {/* Event Service */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={lineItemTable}>
              <tr>
                <td style={lineItemDesc}>
                  <Text style={lineItemTitle}>{booking.event_type}</Text>
                  <Text style={lineItemSubtitle}>
                    {booking.date} at {booking.time}
                  </Text>
                  <Text style={lineItemSubtitle}>
                    {booking.party_size} guests × {formatCurrency(event.price_per_person)}
                  </Text>
                </td>
                <td style={lineItemAmount}>
                  <Text style={amountText}>{formatCurrency(event.total_price)}</Text>
                </td>
              </tr>
            </table>

            {/* Gratuity (if applicable) */}
            {tipAmount && tipAmount > 0 && (
              <table width="100%" cellPadding="0" cellSpacing="0" style={lineItemTable}>
                <tr>
                  <td style={lineItemDesc}>
                    <Text style={lineItemTitle}>Gratuity</Text>
                  </td>
                  <td style={lineItemAmount}>
                    <Text style={amountText}>{formatCurrency(tipAmount)}</Text>
                  </td>
                </tr>
              </table>
            )}
          </Section>

          <Hr style={divider} />

          {/* Totals */}
          <table width="100%" cellPadding="0" cellSpacing="0" style={totalsTable}>
            <tr>
              <td style={totalLabelCell}>Subtotal</td>
              <td style={totalValueCell}>{formatCurrency(event.total_price)}</td>
            </tr>
            {tipAmount && tipAmount > 0 && (
              <tr>
                <td style={totalLabelCell}>Gratuity</td>
                <td style={totalValueCell}>{formatCurrency(tipAmount)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={2}>
                <Hr style={totalsDivider} />
              </td>
            </tr>
            <tr>
              <td style={grandTotalLabelCell}>Total</td>
              <td style={grandTotalValueCell}>{formatCurrency(grandTotal)}</td>
            </tr>
          </table>

          {/* Thank You Message */}
          <Section style={thankYouSection}>
            <Text style={thankYouText}>Thank you for your business!</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Contact us at{' '}
              <Link href={`mailto:${chef.email}`} style={footerLink}>
                {chef.email}
              </Link>{' '}
              or call {chef.phone}
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} {chef.name}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '40px 20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  border: '1px solid #e0e0e0',
};

const headerTable = {
  backgroundColor: '#1a1a1a',
  padding: '24px 32px',
};

const headerLeft = {
  verticalAlign: 'middle' as const,
};

const headerRight = {
  verticalAlign: 'middle' as const,
  textAlign: 'right' as const,
};

const logoText = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '0',
};

const receiptLabel = {
  color: '#888888',
  fontSize: '12px',
  fontWeight: '600' as const,
  letterSpacing: '2px',
  margin: '0',
};

const infoSection = {
  padding: '28px 32px',
  backgroundColor: '#fafafa',
};

const billToCell = {
  verticalAlign: 'top' as const,
  width: '50%',
};

const billToAccent = {
  width: '4px',
  backgroundColor: '#16a34a',
  borderRadius: '2px',
  verticalAlign: 'top' as const,
};

const billToContent = {
  paddingLeft: '12px',
  verticalAlign: 'top' as const,
};

const billToLabel = {
  color: '#16a34a',
  fontSize: '10px',
  fontWeight: '700' as const,
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px 0',
};

const customerNameText = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 4px 0',
};

const customerDetailText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '1.4',
  margin: '0 0 2px 0',
};

const metaCell = {
  verticalAlign: 'top' as const,
  width: '50%',
  textAlign: 'right' as const,
};

const metaTable = {
  marginLeft: 'auto',
};

const metaLabelCell = {
  color: '#888888',
  fontSize: '11px',
  fontWeight: '500' as const,
  textAlign: 'right' as const,
  paddingRight: '12px',
  paddingBottom: '6px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const metaValueCell = {
  color: '#1a1a1a',
  fontSize: '13px',
  fontWeight: '600' as const,
  textAlign: 'right' as const,
  paddingBottom: '6px',
};

const metaValueCellStatus = {
  textAlign: 'right' as const,
  paddingBottom: '6px',
};

const paidStatus = {
  backgroundColor: '#dcfce7',
  color: '#166534',
  fontSize: '10px',
  fontWeight: '700' as const,
  padding: '3px 10px',
  borderRadius: '4px',
  letterSpacing: '0.5px',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '0',
};

const lineItemsSection = {
  padding: '24px 32px',
};

const lineItemTable = {
  marginBottom: '16px',
};

const lineItemDesc = {
  verticalAlign: 'top' as const,
};

const lineItemAmount = {
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
  width: '120px',
};

const lineItemTitle = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '600' as const,
  margin: '0 0 4px 0',
};

const lineItemSubtitle = {
  color: '#666666',
  fontSize: '13px',
  margin: '0 0 2px 0',
};

const amountText = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '600' as const,
  margin: '0',
};

const totalsTable = {
  padding: '24px 32px',
  width: '100%',
};

const totalLabelCell = {
  color: '#666666',
  fontSize: '14px',
  textAlign: 'right' as const,
  paddingRight: '16px',
  paddingBottom: '8px',
};

const totalValueCell = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '500' as const,
  textAlign: 'right' as const,
  width: '120px',
  paddingBottom: '8px',
};

const totalsDivider = {
  borderColor: '#1a1a1a',
  borderWidth: '2px',
  margin: '8px 0',
};

const grandTotalLabelCell = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700' as const,
  textAlign: 'right' as const,
  paddingRight: '16px',
  paddingTop: '8px',
};

const grandTotalValueCell = {
  color: '#16a34a',
  fontSize: '24px',
  fontWeight: '700' as const,
  textAlign: 'right' as const,
  width: '120px',
  paddingTop: '8px',
};

const thankYouSection = {
  padding: '24px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f0fdf4',
};

const thankYouText = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0',
};

const footer = {
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '13px',
  margin: '0 0 8px 0',
};

const footerLink = {
  color: '#16a34a',
  textDecoration: 'none',
};

const footerCopyright = {
  color: '#999999',
  fontSize: '12px',
  margin: '0',
};

export const receiptEmail = (props: ReceiptEmailProps) => <ReceiptEmailComponent {...props} />;

export default ReceiptEmailComponent;
