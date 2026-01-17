import { defineRouteConfig } from '@medusajs/admin-sdk';
import { Container, Heading, toast, Button, FocusModal, Textarea, Label, Checkbox, Input, Select } from '@medusajs/ui';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { ChefEventForm } from '../components/chef-event-form';
import { MenuDetails } from '../components/menu-details';
import { EmailManagementSection } from '../components/EmailManagementSection';
import {
  useAdminRetrieveChefEvent,
  useAdminUpdateChefEventMutation,
  useAdminAcceptChefEventMutation,
  useAdminRejectChefEventMutation,
  useAdminSendPaymentReminderMutation,
  useAdminSendReceiptMutation,
} from '../../../hooks/chef-events';

const ChefEventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: chefEvent, isLoading } = useAdminRetrieveChefEvent(id!);
  const updateChefEvent = useAdminUpdateChefEventMutation(id!);
  const acceptChefEvent = useAdminAcceptChefEventMutation();
  const rejectChefEvent = useAdminRejectChefEventMutation();
  const sendPaymentReminder = useAdminSendPaymentReminderMutation();
  const sendReceipt = useAdminSendReceiptMutation();

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [chefNotes, setChefNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendAcceptanceEmail, setSendAcceptanceEmail] = useState(true);
  
  // Receipt tip input state
  const [tipAmount, setTipAmount] = useState<string>('');
  const [isCashTip, setIsCashTip] = useState(false);
  const [tipMethod, setTipMethod] = useState<string>('');
  const [customTipMethod, setCustomTipMethod] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>('');

  const handleUpdateChefEvent = async (data: any) => {
    try {
      await updateChefEvent.mutateAsync(data);
      toast.success('Chef Event Updated', {
        description: 'The chef event has been updated successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating chef event:', error);
      toast.error('Update Failed', {
        description: 'There was an error updating the chef event. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleAcceptEvent = async () => {
    try {
      await acceptChefEvent.mutateAsync({
        id: id!,
        data: {
          chefNotes: chefNotes || undefined,
          sendAcceptanceEmail: sendAcceptanceEmail,
        },
      });
      toast.success('Event Accepted', {
        description: 'The event has been accepted and a product has been created for ticket sales.',
        duration: 5000,
      });
      setShowAcceptModal(false);
      setChefNotes('');
      setSendAcceptanceEmail(true);
    } catch (error) {
      console.error('Error accepting chef event:', error);
      toast.error('Acceptance Failed', {
        description: 'There was an error accepting the chef event. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleRejectEvent = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection Reason Required', {
        description: 'Please provide a reason for rejecting this event.',
        duration: 3000,
      });
      return;
    }

    try {
      await rejectChefEvent.mutateAsync({
        id: id!,
        data: {
          rejectionReason: rejectionReason.trim(),
          chefNotes: chefNotes || undefined,
        },
      });
      toast.success('Event Rejected', {
        description: 'The event has been rejected and the customer has been notified.',
        duration: 5000,
      });
      setShowRejectModal(false);
      setRejectionReason('');
      setChefNotes('');
    } catch (error) {
      console.error('Error rejecting chef event:', error);
      toast.error('Rejection Failed', {
        description: 'There was an error rejecting the chef event. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleSendPaymentReminder = async () => {
    try {
      await sendPaymentReminder.mutateAsync({
        chefEventId: id!,
      });
      toast.success('Payment Reminder Sent', {
        description: 'The payment reminder has been sent to the host.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      toast.error('Payment Reminder Failed', {
        description: 'There was an error sending the payment reminder. Please try again.',
        duration: 5000,
      });
    }
  };

  // Helper function to check if event has taken place (date-only comparison)
  const hasEventTakenPlace = (eventDate: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);
    return eventDateOnly < today;
  };

  const handleSendReceipt = async () => {
    // Validate tip amount if provided
    if (tipAmount && tipAmount.trim() !== '') {
      const amount = parseFloat(tipAmount);
      if (isNaN(amount) || amount < 0) {
        toast.error('Invalid Tip Amount', {
          description: 'Tip amount must be a valid non-negative number.',
          duration: 3000,
        });
        return;
      }

      // Validate tip method if tip amount provided
      let finalTipMethod: string | undefined;
      if (isCashTip) {
        finalTipMethod = 'cash';
      } else if (tipMethod) {
        if (tipMethod === 'other') {
          if (!customTipMethod.trim()) {
            toast.error('Custom Tip Method Required', {
              description: 'Please specify the tip method when "Other" is selected.',
              duration: 3000,
            });
            return;
          }
          finalTipMethod = customTipMethod.trim();
        } else {
          finalTipMethod = tipMethod;
        }
      } else {
        toast.error('Tip Method Required', {
          description: 'Please select a tip method when tip amount is provided.',
          duration: 3000,
        });
        return;
      }

      try {
        await sendReceipt.mutateAsync({
          chefEventId: id!,
          tipAmount: amount,
          tipMethod: finalTipMethod,
          receiptDate: receiptDate || undefined,
        });
        toast.success('Receipt Sent', {
          description: 'The receipt has been sent to the host.',
          duration: 3000,
        });
        setShowReceiptModal(false);
        // Reset tip fields
        setTipAmount('');
        setIsCashTip(false);
        setTipMethod('');
        setCustomTipMethod('');
        setReceiptDate('');
      } catch (error) {
        console.error('Error sending receipt:', error);
        toast.error('Receipt Failed', {
          description: 'There was an error sending the receipt. Please try again.',
          duration: 5000,
        });
      }
    } else {
      // Send receipt without tip
      try {
        await sendReceipt.mutateAsync({
          chefEventId: id!,
          receiptDate: receiptDate || undefined,
        });
        toast.success('Receipt Sent', {
          description: 'The receipt has been sent to the host.',
          duration: 3000,
        });
        setShowReceiptModal(false);
        // Reset tip fields
        setTipAmount('');
        setIsCashTip(false);
        setTipMethod('');
        setCustomTipMethod('');
        setReceiptDate('');
      } catch (error) {
        console.error('Error sending receipt:', error);
        toast.error('Receipt Failed', {
          description: 'There was an error sending the receipt. Please try again.',
          duration: 5000,
        });
      }
    }
  };

  // Check if receipt was previously sent
  const hasReceiptBeenSent = (): boolean => {
    if (!chefEvent?.emailHistory || !Array.isArray(chefEvent.emailHistory)) {
      return false;
    }
    return chefEvent.emailHistory.some((entry: any) => entry.type === 'receipt');
  };

  if (isLoading) {
    return (
      <Container className="p-6">
        <div>Loading...</div>
      </Container>
    );
  }

  if (!chefEvent) {
    return (
      <Container className="p-6">
        <div>Chef event not found</div>
      </Container>
    );
  }

  const isPending = chefEvent.status === 'pending';
  const isConfirmed = chefEvent.status === 'confirmed';
  const availableTickets = (chefEvent as any).availableTickets ?? 0;
  const showPaymentReminderButton = isConfirmed && chefEvent.productId && availableTickets > 0;
  
  // Receipt button enablement logic
  const eventDate = chefEvent.requestedDate ? new Date(chefEvent.requestedDate) : null;
  const eventHasTakenPlace = eventDate ? hasEventTakenPlace(eventDate) : false;
  const allTicketsPurchased = availableTickets === 0;
  const showReceiptButton = isConfirmed && chefEvent.productId && (eventHasTakenPlace || allTicketsPurchased);

  // Debug logging (can be removed in production)
  if (isConfirmed && chefEvent.productId) {
    console.log('Payment Reminder Button Debug:', {
      isConfirmed,
      productId: chefEvent.productId,
      availableTickets,
      showPaymentReminderButton,
    });
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">
          Edit Chef Event - {(chefEvent as any).firstName} {(chefEvent as any).lastName}
        </Heading>

        {isPending && (
          <div className="flex space-x-2">
            <Button variant="primary" size="small" onClick={() => setShowAcceptModal(true)}>
              Accept Event
            </Button>
            <Button variant="danger" size="small" onClick={() => setShowRejectModal(true)}>
              Reject Event
            </Button>
          </div>
        )}

        {isConfirmed && chefEvent.productId && (
          <div className="flex items-center space-x-2">
            <Button
              variant={showPaymentReminderButton ? 'primary' : 'secondary'}
              size="small"
              onClick={handleSendPaymentReminder}
              disabled={sendPaymentReminder.isPending || !showPaymentReminderButton}
              title={
                !showPaymentReminderButton
                  ? `No tickets available (${availableTickets} remaining). The button will appear when tickets are available.`
                  : `Send payment reminder for ${availableTickets} remaining ticket${availableTickets !== 1 ? 's' : ''}`
              }
            >
              {sendPaymentReminder.isPending
                ? 'Sending...'
                : `Send Payment Reminder${availableTickets > 0 ? ` (${availableTickets})` : ''}`}
            </Button>
            <Button
              variant={showReceiptButton ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setShowReceiptModal(true)}
              disabled={sendReceipt.isPending || !showReceiptButton}
              title={
                !showReceiptButton
                  ? 'Receipt can only be sent after event date has passed or all tickets have been purchased'
                  : 'Send receipt to host'
              }
            >
              Send Receipt
            </Button>
            <Button variant="secondary" size="small" asChild>
              <a href={`/products/${chefEvent.productId}`} target="_blank">
                View Product
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <ChefEventForm
          initialData={chefEvent}
          onSubmit={handleUpdateChefEvent}
          isLoading={updateChefEvent.isPending}
          onCancel={() => window.history.back()}
        />

        {/* Email Management Section for confirmed events */}
        {isConfirmed && (
          <EmailManagementSection
            chefEvent={chefEvent}
            onEmailSent={(emailData) => {
              // Refresh event data to show updated email history
              // refetch() - will be available once we update the hooks
              toast.success('Email Sent', {
                description: `Event details sent successfully`,
                duration: 3000,
              });
            }}
          />
        )}

        <MenuDetails templateProductId={(chefEvent as any).templateProductId} />
      </div>

      {/* Accept Event Modal */}
      {showAcceptModal && (
        <FocusModal open onOpenChange={setShowAcceptModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Accept Event</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <div className="space-y-4">
                <p>This will accept the event and create a product for ticket sales.</p>

                {/* Email Notification Control */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-acceptance-email"
                    checked={sendAcceptanceEmail}
                    onCheckedChange={(checked) => setSendAcceptanceEmail(checked === true)}
                  />
                  <Label htmlFor="send-acceptance-email">Send acceptance email to customer</Label>
                </div>

                <div>
                  <Label htmlFor="chef-notes">Chef Notes (Optional)</Label>
                  <Textarea
                    id="chef-notes"
                    placeholder="Add any notes about this acceptance..."
                    value={chefNotes}
                    onChange={(e) => setChefNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleAcceptEvent} disabled={acceptChefEvent.isPending}>
                    {acceptChefEvent.isPending ? 'Accepting...' : 'Accept Event'}
                  </Button>
                </div>
              </div>
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}

      {/* Reject Event Modal */}
      {showRejectModal && (
        <FocusModal open onOpenChange={setShowRejectModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Reject Event</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <div className="space-y-4">
                <p>This will reject the event and send a rejection email to the customer.</p>
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a reason for rejecting this event..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rejection-notes">Chef Notes (Optional)</Label>
                  <Textarea
                    id="rejection-notes"
                    placeholder="Add any additional notes..."
                    value={chefNotes}
                    onChange={(e) => setChefNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleRejectEvent} disabled={rejectChefEvent.isPending}>
                    {rejectChefEvent.isPending ? 'Rejecting...' : 'Reject Event'}
                  </Button>
                </div>
              </div>
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}

      {/* Send Receipt Modal */}
      {showReceiptModal && (
        <FocusModal open onOpenChange={setShowReceiptModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Send Receipt</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <div className="space-y-4">
                {hasReceiptBeenSent() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm font-medium">
                      ⚠️ A receipt has already been sent for this event. Sending another receipt will update the tip information if provided.
                    </p>
                  </div>
                )}
                
                <p className="text-gray-600">
                  Send a receipt to the host. You can optionally include tip information received on the day of the event.
                </p>

                {/* Receipt Date Input */}
                <div>
                  <Label htmlFor="receipt-date">Receipt Date</Label>
                  <Input
                    id="receipt-date"
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                  />
                  <p className="text-gray-500 text-sm mt-1">Date to display on the receipt (defaults to today if not set)</p>
                </div>

                {/* Tip Amount Input */}
                <div>
                  <Label htmlFor="tip-amount">Tip Amount (Optional)</Label>
                  <Input
                    id="tip-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                  />
                  <p className="text-gray-500 text-sm mt-1">Enter the tip amount if one was received</p>
                </div>

                {/* Tip Method - Cash Checkbox */}
                {tipAmount && tipAmount.trim() !== '' && parseFloat(tipAmount) > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cash-tip"
                        checked={isCashTip}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setIsCashTip(isChecked);
                          if (isChecked) {
                            setTipMethod('');
                            setCustomTipMethod('');
                          }
                        }}
                      />
                      <Label htmlFor="cash-tip">Cash</Label>
                    </div>

                    {/* Other Payment Methods Dropdown (only if not cash) */}
                    {!isCashTip && (
                      <div>
                        <Label htmlFor="tip-method">Payment Method</Label>
                        <Select
                          value={tipMethod}
                          onValueChange={(value) => {
                            setTipMethod(value);
                            if (value !== 'other') {
                              setCustomTipMethod('');
                            }
                          }}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select payment method" />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="venmo">Venmo</Select.Item>
                            <Select.Item value="zelle">Zelle</Select.Item>
                            <Select.Item value="paypal">PayPal</Select.Item>
                            <Select.Item value="other">Other</Select.Item>
                          </Select.Content>
                        </Select>
                      </div>
                    )}

                    {/* Custom Tip Method Input (only if "Other" selected) */}
                    {!isCashTip && tipMethod === 'other' && (
                      <div>
                        <Label htmlFor="custom-tip-method">Custom Payment Method</Label>
                        <Input
                          id="custom-tip-method"
                          type="text"
                          placeholder="e.g., Cash App, Apple Pay"
                          value={customTipMethod}
                          onChange={(e) => setCustomTipMethod(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="secondary" onClick={() => {
                    setShowReceiptModal(false);
                    setTipAmount('');
                    setIsCashTip(false);
                    setTipMethod('');
                    setCustomTipMethod('');
                    setReceiptDate('');
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSendReceipt} 
                    disabled={sendReceipt.isPending}
                  >
                    {sendReceipt.isPending ? 'Sending...' : 'Send Receipt'}
                  </Button>
                </div>
              </div>
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: 'Chef Event Details',
});

export default ChefEventDetailPage;
