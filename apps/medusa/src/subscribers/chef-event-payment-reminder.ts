import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { CHEF_EVENT_MODULE } from '../modules/chef-event';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { DateTime } from 'luxon';

type EventData = {
  chefEventId: string;
  recipients: string[];
  notes?: string;
};

export default async function chefEventPaymentReminderHandler({
  event: { data },
  container,
}: SubscriberArgs<EventData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info(`Processing payment reminder request for chef event: ${data.chefEventId}`);

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
    let remainingTickets = 0;

    if (chefEvent.productId) {
      const productModuleService = container.resolve(Modules.PRODUCT);
      const inventoryModuleService = container.resolve(Modules.INVENTORY);

      product = await productModuleService.retrieveProduct(chefEvent.productId, {
        relations: ['variants'],
        fields: ['*', 'variants.*', 'variants.inventory_quantity'],
      });

      // Calculate remaining tickets
      if (product && product.variants) {
        for (const variant of product.variants) {
          // First, try to use variant's inventory_quantity if available (simpler approach)
          if (variant.inventory_quantity !== undefined && variant.inventory_quantity !== null) {
            const variantInventory = Number(variant.inventory_quantity);
            remainingTickets += Math.max(0, variantInventory);
            continue;
          }

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
              const stocked = Number(level.stocked_quantity || level.stockedQuantity || 0);
              const reserved = Number(level.reserved_quantity || level.reservedQuantity || 0);
              const available = stocked - reserved;
              remainingTickets += Math.max(0, available);
            }
          }
        }
      }
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
    const totalPrice = pricePerPerson * chefEvent.partySize;

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
        total_price: totalPrice.toFixed(2),
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
      remainingTickets: remainingTickets,
      chef: {
        name: 'Chef Luis Velez',
        email: 'support@chefvelez.com',
        phone: '(347) 695-4445',
      },
      requestReference: chefEvent.id.slice(0, 8).toUpperCase(),
      customNotes: data.notes,
    };

    // Send emails to all recipients
    for (const recipient of data.recipients) {
      await notificationService.createNotifications({
        to: recipient,
        channel: 'email',
        template: 'payment-reminder',
        data: emailData,
      });

      logger.info(`Payment reminder email sent to ${recipient}`);
    }
  } catch (error) {
    logger.error(
      `Failed to process payment reminder for ${data.chefEventId}: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: 'chef-event.payment-reminder',
};
