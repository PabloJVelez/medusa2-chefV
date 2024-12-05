import { type ActionHandler, handleAction } from '@libs/util/handleAction.server';
import { getVariantBySelectedOptions } from '@libs/util/products';
import { setCartId } from '@libs/util/server/cookies.server';
import { addToCart, deleteLineItem, retrieveCart, updateLineItem } from '@libs/util/server/data/cart.server';
import { getProductsById } from '@libs/util/server/data/products.server';
import { requestChefEvent } from '@libs/util/server/data/chefEvent.server';
import { getSelectedRegion } from '@libs/util/server/data/regions.server';
import { FormValidationError } from '@libs/util/validation/validation-error';
import { StoreCart, StoreCartResponse } from '@medusajs/types';
import type { ActionFunctionArgs } from '@remix-run/node';
import { data as remixData } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';

export const addCartItemValidation = withYup(
  Yup.object().shape({
    productId: Yup.string().required(),
    options: Yup.object().default({}).optional(),
    quantity: Yup.number().optional(),
  }),
);

export enum LineItemActions {
  CREATE = 'createItem',
  UPDATE = 'updateItem',
  DELETE = 'deleteItem',
  CREATE_CHEF_EVENT = 'createChefEvent',
}

export interface CreateChefEventPayload {
  productId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  date: string;
  time: string;
}

export interface CreateLineItemPayLoad {
  cartId: string;
  productId: string;
  options: { [key: string]: string };
  quantity: string;
}

export interface UpdateLineItemRequestPayload {
  cartId: string;
  lineItemId: string;
  quantity: string;
}

export interface DeleteLineItemRequestPayload {
  cartId: string;
  lineItemId: string;
}

export interface LineItemRequestResponse extends StoreCartResponse {}

const createChefEvent: ActionHandler = async (payload: CreateChefEventPayload, { request }) => {
  const result = await requestChefEvent(payload);
  
  if (!result.success) {
    throw new Error('Failed to create chef event');
  }

  return result;
};

const createItem: ActionHandler<StoreCartResponse> = async (payload: CreateLineItemPayLoad, { request }) => {
  console.log('RUNNING CREATE ITEM WITH PAYLOAD', payload);
  const result = await addCartItemValidation.validate(payload);

  if (result.error) throw new FormValidationError(result.error);

  const { productId, options, quantity = '1' } = payload;

  const region = await getSelectedRegion(request.headers);

  const [product] = await getProductsById({
    ids: [productId],
    regionId: region.id,
  }).catch(() => []);

  if (!product)
    throw new FormValidationError({
      fieldErrors: { formError: 'Product not found.' },
    });

  //const variant = getVariantBySelectedOptions(product.variants || [], options);

  const variant = product.variants?.[0];
  if (!variant)
    throw new FormValidationError({
      fieldErrors: {
        formError: 'Product variant not found. Please select all required options.',
      },
    });

  const responseHeaders = new Headers();

  const { cart } = await addToCart(request, {
    variantId: variant.id!,
    quantity: parseInt(quantity, 10),
  });

  await setCartId(responseHeaders, cart.id);

  return remixData({ cart }, { headers: responseHeaders });
};

const updateItem: ActionHandler<StoreCartResponse> = async (
  { lineItemId, cartId, quantity }: UpdateLineItemRequestPayload,
  { request },
) => {
  return await updateLineItem(request, {
    lineId: lineItemId,
    quantity: parseInt(quantity, 10),
  });
};

const deleteItem: ActionHandler<StoreCartResponse> = async (
  { lineItemId, cartId }: DeleteLineItemRequestPayload,
  { request },
) => {
  await deleteLineItem(request, lineItemId);

  const cart = (await retrieveCart(request)) as StoreCart;

  return { cart };
};

const actions = {
  createItem,
  updateItem,
  deleteItem,
  createChefEvent,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleAction({
    actionArgs,
    actions,
  });
}
