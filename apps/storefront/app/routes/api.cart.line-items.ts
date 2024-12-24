import { type ActionHandler, handleAction } from '@libs/util/handleAction.server';
import { getVariantBySelectedOptions } from '@libs/util/products';
import { setCartId } from '@libs/util/server/cookies.server';
import { addToCart, deleteLineItem, retrieveCart, updateLineItem } from '@libs/util/server/data/cart.server';
import { getProductByHandle, getProductsById } from '@libs/util/server/data/products.server';
import { requestChefEvent, EventRequest, EventResponse } from '@libs/util/server/data/chefEvent.server';
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
    handle: Yup.string().required(),
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

export interface CreateChefEventPayload extends EventRequest {}

export interface CreateLineItemPayLoad {
  cartId: string;
  productId: string;
  handle: string;
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

const createChefEvent: ActionHandler<EventResponse> = async (payload: CreateChefEventPayload, { request }) => {
  const result = await requestChefEvent(payload);
  
  return result;
};

const createItem: ActionHandler<StoreCartResponse> = async (payload: CreateLineItemPayLoad, { request }) => {
  const result = await addCartItemValidation.validate(payload);

  if (result.error) throw new FormValidationError(result.error);

  const { productId, handle, options, quantity = '1' } = payload;

  const region = await getSelectedRegion(request.headers);

  const product = await getProductByHandle(handle, region.id)
  if (!product)
    throw new FormValidationError({
      fieldErrors: { formError: 'Product not found.' },
    });

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

const actions: { [key: string]: ActionHandler<StoreCartResponse | EventResponse> } = {
  createItem,
  updateItem,
  deleteItem,
  createChefEvent,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleAction<StoreCartResponse | EventResponse>({
    actionArgs,
    actions,
  });
}
