// apps/storefront/libs/util/server/root.server.ts
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

/** ---- small logging helpers ---- */
const now = () => Date.now();
const dur = (t0: number) => `${(Date.now() - t0).toFixed(1)}ms`;

function reqIdFrom(headers: Headers) {
  // Prefer infra-populated header if present
  return (
    headers.get('x-request-id') ||
    headers.get('cf-ray') ||
    Math.random().toString(36).slice(2, 10)
  );
}

function logStart(scope: string, meta: Record<string, unknown>) {
  console.log(`[rootLoader] ${scope}:start`, meta);
}
function logEnd(scope: string, meta: Record<string, unknown>) {
  console.log(`[rootLoader] ${scope}:end`, meta);
}
function logError(scope: string, err: unknown, meta: Record<string, unknown> = {}) {
  // Try to surface common HTTP error shapes without crashing
  const anyErr: any = err || {};
  const shaped = {
    message: anyErr.message,
    name: anyErr.name,
    status: anyErr.status || anyErr.response?.status,
    statusText: anyErr.statusText || anyErr.response?.statusText,
    url: anyErr.url || anyErr.config?.url,
    body: typeof anyErr.body === 'string' ? anyErr.body.slice(0, 300) : undefined,
    ...meta,
  };
  console.error(`[rootLoader] ${scope}:error`, shaped);
}

export const getRootLoader = async ({ request }: LoaderFunctionArgs) => {
  const rid = reqIdFrom(request.headers);
  const method = request.method;
  const url = request.url;

  // Log the top-level request + key env (non-secret) for SSR base URL sanity
  logStart('request', {
    rid,
    method,
    url,
    PUBLIC_MEDUSA_API_URL: config.PUBLIC_MEDUSA_API_URL,
    STOREFRONT_URL: config.STOREFRONT_URL,
    NODE_ENV: config.NODE_ENV,
    ENVIRONMENT: config.ENVIRONMENT,
  });

  // 1) Region (wrapped; SSR must not crash if regions endpoint flakes)
  let region: Awaited<ReturnType<typeof getSelectedRegion>> | null = null;
  {
    const t0 = now();
    try {
      region = await getSelectedRegion(request.headers);
      logEnd('region', { rid, duration: dur(t0), regionId: region?.id ?? null });
    } catch (err) {
      logError('region', err, { rid, duration: dur(t0) });
      // keep region as null so page can still render
      region = null;
    }
  }

  // 2) Parallel calls, but don't let failures throw
  const tAll0 = now();
  logStart('parallel', { rid });

  const [cartRes, regionsRes, customerRes, hasProductsRes] = await Promise.allSettled([
    (async () => {
      const t0 = now();
      try {
        const c = await retrieveCart(request);
        logEnd('cart.retrieve', {
          rid,
          duration: dur(t0),
          items: c?.items?.length ?? 0,
          region_id: c?.region_id ?? null,
        });
        return c;
      } catch (err) {
        logError('cart.retrieve', err, { rid, duration: dur(t0) });
        return null;
      }
    })(),
    (async () => {
      const t0 = now();
      try {
        const r = await listRegions();
        logEnd('regions.list', {
          rid,
          duration: dur(t0),
          count: Array.isArray(r) ? r.length : 0,
        });
        return r;
      } catch (err) {
        logError('regions.list', err, { rid, duration: dur(t0) });
        return [];
      }
    })(),
    (async () => {
      const t0 = now();
      try {
        const cu = await getCustomer(request);
        logEnd('customer.me', {
          rid,
          duration: dur(t0),
          isAuthenticated: Boolean(cu),
        });
        return cu ?? null;
      } catch (err) {
        // Treat 401 as normal anonymous user
        logError('customer.me', err, { rid, duration: dur(t0) });
        return null;
      }
    })(),
    (async () => {
      const t0 = now();
      try {
        const has = await fetchHasProducts(request);
        logEnd('products.hasPublished', { rid, duration: dur(t0), has });
        return has;
      } catch (err) {
        logError('products.hasPublished', err, { rid, duration: dur(t0) });
        return false;
      }
    })(),
  ]);

  const cart = cartRes.status === 'fulfilled' ? cartRes.value : null;
  const regions = regionsRes.status === 'fulfilled' ? regionsRes.value : [];
  const customer = customerRes.status === 'fulfilled' ? customerRes.value : null;
  const hasPublishedProducts =
    hasProductsRes.status === 'fulfilled' ? hasProductsRes.value : false;

  logEnd('parallel', { rid, duration: dur(tAll0) });

  // 3) Cookies for region (only if we actually have one)
  const headers = new Headers();
  try {
    const currentRegionCookieId = await getSelectedRegionId(headers);
    if (region?.id && currentRegionCookieId !== region.id) {
      await setSelectedRegionId(headers, region.id);
      console.log('[rootLoader] region.cookie:set', {
        rid,
        from: currentRegionCookieId ?? null,
        to: region.id,
      });
    } else {
      console.log('[rootLoader] region.cookie:unchanged', {
        rid,
        value: currentRegionCookieId ?? null,
      });
    }
  } catch (err) {
    logError('region.cookie', err, { rid });
  }

  // 4) Enrich cart items (defensive)
  if (cart?.items?.length && cart.region_id) {
    const t0 = now();
    try {
      const enrichedItems = await enrichLineItems(cart.items, cart.region_id);
      cart.items = enrichedItems as HttpTypes.StoreCartLineItem[];
      logEnd('cart.enrich', {
        rid,
        duration: dur(t0),
        items: cart.items.length,
        region_id: cart.region_id,
      });
    } catch (err) {
      logError('cart.enrich', err, {
        rid,
        duration: dur(t0),
        items: cart.items.length,
        region_id: cart.region_id,
      });
    }
  }

  // 5) Font preloads (left empty for now, but keep the key for visibility)
  const fontLinks: string[] = [];

  // Add a couple of debug headers you can see in browser devtools (harmless in prod)
  headers.set('X-Debug-Request-Id', rid);
  headers.set('X-Debug-Region-Id', region?.id ?? 'none');
  headers.set('X-Debug-Regions-Count', String(Array.isArray(regions) ? regions.length : 0));
  headers.set('X-Debug-Cart-Items', String(cart?.items?.length ?? 0));

  // Final log snapshot
  logEnd('request', {
    rid,
    regionId: region?.id ?? null,
    regionsCount: Array.isArray(regions) ? regions.length : 0,
    cartItems: cart?.items?.length ?? 0,
    isAuthenticated: Boolean(customer),
    hasPublishedProducts,
  });

  return remixData(
    {
      hasPublishedProducts,
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
      customer,
      regions,
      region,
      siteDetails: {
        store: {
          name: 'Chef Velez',
        },
        settings: siteSettings,
        headerNavigationItems,
        footerNavigationItems,
      } as SiteDetailsRootData,
      cart: cart,
    },
    { headers },
  );
};

export type RootLoader = typeof getRootLoader;
export type RootLoaderResponse = RemixLoaderResponse<typeof getRootLoader>['data'];
