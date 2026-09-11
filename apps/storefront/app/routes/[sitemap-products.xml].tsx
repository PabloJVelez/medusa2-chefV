import { sdk } from '@libs/util/server/client.server';
import { isEventProduct } from '@libs/util/products';
import { SitemapUrl, buildSitemapUrlSetXML } from '@libs/util/xml/sitemap-builder';
import { LoaderFunctionArgs } from 'react-router';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { products } = await sdk.store.product.list({
    fields: 'handle,updated_at,variants.sku',
    limit: 1000,
  });

  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;

  const urls: SitemapUrl[] = products
    .filter((product) => !isEventProduct(product))
    .map(({ handle, updated_at }) => ({
      loc: `${baseUrl}/products/${handle}`,
      lastmod: updated_at?.toString(),
      priority: 0.8,
      changefreq: 'daily',
    }));

  const content = buildSitemapUrlSetXML(urls);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  });
};
