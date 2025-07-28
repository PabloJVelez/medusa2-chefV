import { StoreCart, StoreCartLineItem, StoreProduct, StoreProductVariant } from '@medusajs/types';
import isNumber from 'lodash/isNumber';
import merge from 'lodash/merge';

const locale = 'en-US';
export interface FormatPriceOptions {
  currency: Intl.NumberFormatOptions['currency'];
  quantity?: number;
}

export function formatPrice(amount: number | null, options: FormatPriceOptions) {
  const defaultOptions = {
    currency: 'usd',
    quantity: 1,
  };
  const { currency, quantity } = merge({}, defaultOptions, options);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format((amount || 0) * quantity);
}

export function sortProductVariantsByPrice(product: StoreProduct) {
  if (!product.variants) return [];
  return product.variants.sort((a, b) => getVariantFinalPrice(a) - getVariantFinalPrice(b));
}

export function getVariantPrices(variant: StoreProductVariant) {
  return {
    calculated: variant.calculated_price?.calculated_amount,
    original: variant.calculated_price?.original_amount,
  };
}

export function getVariantFinalPrice(variant: StoreProductVariant) {
  const { calculated, original } = getVariantPrices(variant);

  return (isNumber(calculated) ? calculated : original) as number;
}

export function getCheapestProductVariant(product: StoreProduct) {
  return sortProductVariantsByPrice(product)[0];
}

export function formatLineItemPrice(lineItem: StoreCartLineItem, regionCurrency: string) {
  console.log('💰 formatLineItemPrice Debug:', {
    lineItemId: lineItem.id,
    productTitle: lineItem.product_title,
    unitPrice: lineItem.unit_price,
    unitPriceInDollars: lineItem.unit_price ? lineItem.unit_price / 100 : null,
    quantity: lineItem.quantity,
    regionCurrency: regionCurrency,
    totalBeforeFormat: lineItem.unit_price && lineItem.quantity ? lineItem.unit_price * lineItem.quantity : null
  });

  // FIXED: Medusa stores prices in cents, so divide by 100
  const priceInDollars = (lineItem.unit_price || 0) / 100;
  
  return formatPrice(priceInDollars, {
    currency: regionCurrency,
    quantity: lineItem.quantity,
  });
}

export function formatCartSubtotal(cart: StoreCart) {
  console.log('💰 formatCartSubtotal Debug:', {
    itemSubtotal: cart.item_subtotal,
    itemSubtotalInDollars: cart.item_subtotal ? cart.item_subtotal / 100 : null,
    currencyCode: cart.region?.currency_code
  });

  // FIXED: Medusa stores prices in cents, so divide by 100
  const subtotalInDollars = (cart.item_subtotal || 0) / 100;
  
  return formatPrice(subtotalInDollars, {
    currency: cart.region?.currency_code,
  });
}
