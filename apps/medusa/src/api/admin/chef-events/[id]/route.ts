import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { z } from 'zod';
import { updateChefEventWorkflow } from '../../../../workflows/update-chef-event';
import { deleteChefEventWorkflow } from '../../../../workflows/delete-chef-event';
import { CHEF_EVENT_MODULE } from '../../../../modules/chef-event';
import { Modules } from '@medusajs/framework/utils';

const updateChefEventSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  requestedDate: z.string().optional(),
  requestedTime: z.string().optional(),
  partySize: z.number().min(1).optional(),
  eventType: z.enum(['cooking_class', 'plated_dinner', 'buffet_style']).optional(),
  templateProductId: z.string().optional(),
  locationType: z.enum(['customer_location', 'chef_location']).optional(),
  locationAddress: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  totalPrice: z.number().optional(),
  depositPaid: z.boolean().optional(),
  specialRequirements: z.string().optional(),
  estimatedDuration: z.number().optional(),
});

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const chefEventModuleService = req.scope.resolve(CHEF_EVENT_MODULE) as any;
  const { id } = req.params;

  const chefEvent = await chefEventModuleService.retrieveChefEvent(id);

  if (!chefEvent) {
    return res.status(404).json({ message: 'Chef event not found' });
  }

  // Calculate available tickets if productId exists
  let availableTickets = 0;
  if (chefEvent.productId) {
    try {
      const productModuleService = req.scope.resolve(Modules.PRODUCT);
      const inventoryModuleService = req.scope.resolve(Modules.INVENTORY);
      const logger = req.scope.resolve('logger');

      // Retrieve product with variants and inventory information
      const product = await productModuleService.retrieveProduct(chefEvent.productId, {
        relations: ['variants'],
        fields: ['*', 'variants.*', 'variants.inventory_quantity'],
      });

      logger.info(
        `Calculating inventory for product ${chefEvent.productId}, found ${product?.variants?.length || 0} variants`,
      );

      if (product && product.variants) {
        for (const variant of product.variants) {
          // First, try to use variant's inventory_quantity if available (simpler approach)
          if (variant.inventory_quantity !== undefined && variant.inventory_quantity !== null) {
            const variantInventory = Number(variant.inventory_quantity);
            logger.info(`Using variant inventory_quantity: ${variantInventory} for variant ${variant.id}`);
            availableTickets += Math.max(0, variantInventory);
            continue;
          }

          if (!variant.sku) {
            logger.warn(`Variant ${variant.id} has no SKU`);
            continue;
          }

          logger.info(`Checking inventory for variant SKU: ${variant.sku}`);

          // Get inventory items for this variant
          const inventoryItems = await inventoryModuleService.listInventoryItems({
            sku: variant.sku,
          });

          logger.info(`Found ${inventoryItems.length} inventory items for SKU ${variant.sku}`);

          if (inventoryItems.length > 0) {
            const inventoryItem = inventoryItems[0];

            // Get inventory levels for this item
            // Try different filter formats that Medusa v2 might expect
            let levels: any[] = [];

            try {
              // Try with object filter
              levels = await inventoryModuleService.listInventoryLevels({
                inventory_item_id: inventoryItem.id,
              });
            } catch (e) {
              logger.warn(`First query format failed, trying alternative: ${e}`);
            }

            // If no levels found, try with array format
            if (levels.length === 0) {
              try {
                levels = await inventoryModuleService.listInventoryLevels({
                  inventory_item_id: [inventoryItem.id],
                });
              } catch (e) {
                logger.warn(`Array format failed: ${e}`);
              }
            }

            // If still no levels, try retrieving all and filtering
            if (levels.length === 0) {
              try {
                const allLevels = await inventoryModuleService.listInventoryLevels({});
                levels = allLevels.filter((level: any) => level.inventory_item_id === inventoryItem.id);
                logger.info(`Filtered ${levels.length} levels from all levels`);
              } catch (e) {
                logger.warn(`Fallback query failed: ${e}`);
              }
            }

            logger.info(`Found ${levels.length} inventory levels for item ${inventoryItem.id}`);

            // Sum available inventory (stocked - reserved)
            for (const level of levels) {
              const stocked = Number(level.stocked_quantity || level.stockedQuantity || 0);
              const reserved = Number(level.reserved_quantity || level.reservedQuantity || 0);
              const available = stocked - reserved;
              logger.info(`Level ${level.id}: stocked=${stocked}, reserved=${reserved}, available=${available}`);
              availableTickets += Math.max(0, available);
            }

            if (levels.length === 0) {
              logger.warn(`No inventory levels found for inventory item ${inventoryItem.id} (SKU: ${variant.sku})`);
            }
          } else {
            logger.warn(`No inventory items found for variant SKU: ${variant.sku}`);
          }
        }
      }

      logger.info(`Total available tickets calculated: ${availableTickets}`);
    } catch (error) {
      // Log error but don't fail the request
      const logger = req.scope.resolve('logger');
      logger.error(
        `Failed to calculate available tickets for chef event ${id}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  res.json({
    chefEvent: {
      ...chefEvent,
      availableTickets,
    },
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const validatedBody = updateChefEventSchema.parse(req.body);

  const { result } = await updateChefEventWorkflow(req.scope).run({
    input: {
      id,
      ...validatedBody,
    },
  });

  res.json({ chefEvent: result.chefEvent });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const { result } = await deleteChefEventWorkflow(req.scope).run({
    input: { id },
  });

  res.json({ deleted: result.result.deleted });
}
