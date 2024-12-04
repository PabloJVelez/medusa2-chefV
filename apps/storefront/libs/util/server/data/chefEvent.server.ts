import { sdk } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';

export const requestChefEvent = async () => {
  return sdk.client.fetch('/store/custom', {});
}

