import { StoreProduct } from '@medusajs/types';
import { useMemo } from 'react';

export const useProductInventory = (product: StoreProduct) => {
  return useMemo(() => {
    const totalInventory =
      product.variants?.reduce((total, variant) => {
        console.log("VARIANT", variant)
        if (variant.allow_backorder || !variant.manage_inventory) return Infinity;
        return total + (variant.inventory_quantity || 0);
      }, 0) ?? 0;
      console.log("DID NOT MAKE IT IN THE VARIANTS")
    const averageInventory = totalInventory / (product?.variants?.length ?? 1);

    return { averageInventory, totalInventory };
  }, [product]);
};
