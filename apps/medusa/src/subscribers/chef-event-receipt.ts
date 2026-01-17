import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { CHEF_EVENT_MODULE } from '../modules/chef-event';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { DateTime } from 'luxon';

type EventData = {
  chefEventId: string;
  recipients: string[];
  notes?: string;
  tipAmount?: number;
  tipMethod?: string;
  receiptDate?: string;
};

export default async function chefEventReceiptHandler({ event: { data }, container }: SubscriberArgs<EventData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info(`Processing receipt request for chef event: ${data.chefEventId}`);

  try {
    const chefEventModuleService = container.resolve(CHEF_EVENT_MODULE) as any;
    const notificationService = container.resolve(Modules.NOTIFICATION);

    // Get chef event details
    const chefEvent = await chefEventModuleService.retrieveChefEvent(data.chefEventId);

    if (!chefEvent) {
      throw new Error(`Chef event not found: ${data.chefEventId}`);
    }

    // Get product details if event is confirmed
    let product = null;
    let purchasedTickets = 0;
    let availableTickets = 0;

    if (chefEvent.productId) {
      const productModuleService = container.resolve(Modules.PRODUCT);
      const inventoryModuleService = container.resolve(Modules.INVENTORY);

      product = await productModuleService.retrieveProduct(chefEvent.productId, {
        relations: ['variants'],
      });

      // Calculate ticket information
      if (product && product.variants) {
        for (const variant of product.variants) {
          if (!variant.sku) continue;

          // Get inventory items for this variant
          const inventoryItems = await inventoryModuleService.listInventoryItems({
            sku: variant.sku,
          });

          if (inventoryItems.length > 0) {
            // Get inventory levels for this item
            const levels = await inventoryModuleService.listInventoryLevels({
              inventory_item_id: inventoryItems[0].id,
            });

            // Sum available inventory (stocked - reserved)
            for (const level of levels) {
              const stocked = Number(level.stocked_quantity || 0);
              const reserved = Number(level.reserved_quantity || 0);
              const available = stocked - reserved;
              availableTickets += Math.max(0, available);
            }
          }
        }
      }

      // Calculate purchased tickets: original party size minus available tickets
      purchasedTickets = chefEvent.partySize - availableTickets;
    }

    // Format data for email template
    const formattedDate = DateTime.fromJSDate(chefEvent.requestedDate).toFormat('LLL d, yyyy');
    const formattedTime = chefEvent.requestedTime;

    const eventTypeMap: Record<string, string> = {
      cooking_class: 'Cooking Class',
      plated_dinner: 'Plated Dinner',
      buffet_style: 'Buffet Style',
    };

    const locationTypeMap: Record<string, string> = {
      customer_location: "at Customer's Location",
      chef_location: "at Chef's Location",
    };

    // Calculate pricing
    const PRICING_STRUCTURE = {
      buffet_style: 99.99,
      cooking_class: 119.99,
      plated_dinner: 149.99,
    };

    const pricePerPerson = PRICING_STRUCTURE[chefEvent.eventType as keyof typeof PRICING_STRUCTURE];
    const totalEventPrice = pricePerPerson * chefEvent.partySize;
    const totalPurchasedPrice = pricePerPerson * purchasedTickets;

    // Common email data
    const emailData = {
      customer: {
        first_name: chefEvent.firstName,
        last_name: chefEvent.lastName,
        email: chefEvent.email,
        phone: chefEvent.phone || 'Not provided',
      },
      booking: {
        date: formattedDate,
        time: formattedTime,
        event_type: eventTypeMap[chefEvent.eventType] || chefEvent.eventType,
        location_type: locationTypeMap[chefEvent.locationType] || chefEvent.locationType,
        location_address: chefEvent.locationAddress || 'Not provided',
        party_size: chefEvent.partySize,
        notes: chefEvent.notes || 'No special notes provided',
      },
      event: {
        status: chefEvent.status,
        total_price: totalEventPrice.toFixed(2),
        price_per_person: pricePerPerson.toFixed(2),
      },
      product: product
        ? {
            id: product.id,
            handle: product.handle,
            title: product.title,
            purchase_url: `${process.env.STOREFRONT_URL || 'http://localhost:3000'}/products/${product.handle}`,
          }
        : null,
      purchasedTickets: purchasedTickets,
      totalPurchasedPrice: totalPurchasedPrice.toFixed(2),
      tipAmount: data.tipAmount,
      tipMethod: data.tipMethod,
      chef: {
        name: 'Chef Luis Velez',
        email: 'support@chefvelez.com',
        phone: '(702) 349-6158',
      },
      requestReference: chefEvent.id.slice(0, 8).toUpperCase(),
      receiptDate: data.receiptDate,
      customNotes: data.notes,
    };

    // Combine customer recipients with chef notification list
    const chefEmails =
      process.env.CHEF_NOTIFICATIONS_LIST?.split(',')
        .map((email) => email.trim())
        .filter(Boolean) || [];

    // Create full recipient list (customer recipients + chef notifications)
    const allRecipients = [...data.recipients];

    // Add chef emails that aren't already in the list
    for (const chefEmail of chefEmails) {
      if (!allRecipients.includes(chefEmail)) {
        allRecipients.push(chefEmail);
      }
    }

    if (chefEmails.length === 0) {
      logger.warn('No chef emails configured in CHEF_NOTIFICATIONS_LIST');
    }

    // Send emails to all recipients with 2-second delay between each
    // (Resend free plan has rate limits for concurrent sends)
    for (let i = 0; i < allRecipients.length; i++) {
      const recipient = allRecipients[i];

      await notificationService.createNotifications({
        to: recipient,
        channel: 'email',
        template: 'receipt',
        data: emailData,
      });

      logger.info(`Receipt email sent to ${recipient}`);

      // Wait 2 seconds before sending the next email (except for the last one)
      if (i < allRecipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    logger.info(`Receipt sent to ${allRecipients.length} recipient(s): ${allRecipients.join(', ')}`);
  } catch (error) {
    logger.error(
      `Failed to process receipt for ${data.chefEventId}: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: 'chef-event.receipt',
};
