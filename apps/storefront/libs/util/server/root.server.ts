import type { SiteDetailsRootData } from '@libs/types';

import { footerNavigationItems, headerNavigationItems } from '@libs/config/site/navigation-items';
import { siteSettings } from '@libs/config/site/site-settings';
import type { HttpTypes } from '@medusajs/types';
import { type LoaderFunctionArgs, data as remixData } from 'react-router';
import { RemixLoaderResponse } from 'types/remix';
import { config } from './config.server';
import { getSelectedRegionId, setSelectedRegionId } from './cookies.server';
import { enrichLineItems, retrieveCart } from './data/cart.server';
import { getCustomer } from './data/customer.server';
import { getSelectedRegion, listRegions } from './data/regions.server';
import { fetchProducts } from './products.server';

const fetchHasProducts = async (request: Request) => {
  return await fetchProducts(request, { limit: 1, offset: 999_999 }).then((res) => res.count > 0);
};

export const getRootLoader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();

  // Provide minimal region data to prevent useRegion hook errors
  // This is a fallback region for deployment - in production you'd want real region data
  const fallbackRegion = {
    id: 'us-region',
    name: 'United States',
    currency_code: 'usd',
    countries: [
      {
        id: 'us',
        iso_2: 'us',
        iso_3: 'usa',
        num_code: '840',
        name: 'United States',
        display_name: 'United States',
      }
    ]
  };

  // Provide minimal cart data to prevent cart-related errors
  const fallbackCart = {
    id: null,
    items: [],
    region_id: fallbackRegion.id,
    currency_code: fallbackRegion.currency_code,
    subtotal: 0,
    tax_total: 0,
    total: 0,
  };

  const fontLinks: string[] = [];

  return remixData(
    {
      hasPublishedProducts: true, // Assume we have products for now
      fontLinks,
      env: {
        NODE_ENV: config.NODE_ENV,
        ENVIRONMENT: config.ENVIRONMENT,
        STRIPE_PUBLIC_KEY: config.STRIPE_PUBLIC_KEY,
        PUBLIC_MEDUSA_API_URL: config.PUBLIC_MEDUSA_API_URL,
        STOREFRONT_URL: config.STOREFRONT_URL,
        SENTRY_DSN: config.SENTRY_DSN,
        SENTRY_ENVIRONMENT: config.SENTRY_ENVIRONMENT,
        EVENT_LOGGING: config.EVENT_LOGGING,
      },
      customer: null, // No customer data for now
      region: fallbackRegion,
      regions: [fallbackRegion], // Provide regions array for useRegions hook
      siteDetails: {
        store: {
          name: 'Chef Velez',
        },
        settings: siteSettings,
        headerNavigationItems,
        footerNavigationItems,
      } as SiteDetailsRootData,
      cart: fallbackCart,
    },
    { headers },
  );
};

export type RootLoader = typeof getRootLoader;

export type RootLoaderResponse = RemixLoaderResponse<typeof getRootLoader>['data'];
