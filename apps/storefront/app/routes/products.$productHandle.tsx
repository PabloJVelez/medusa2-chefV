import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductTemplate } from '@app/templates/ProductTemplate';
import { getMergedProductMeta } from '@libs/util/products';
import { fetchProducts } from '@libs/util/server/products.server';
import { StoreProduct } from '@medusajs/types';

export const loader = async (args: LoaderFunctionArgs) => {
  const { products } = await fetchProducts(args.request, {
    handle: args.params.productHandle,
    fields: '*categories,+menu.*,menu.courses.*, menu.courses.dishes.*,'
  }).catch((e) => {
    return { products: [] };
  });
  console.log('PRODUCTS------->', products);
  //FOR each course list all the dishes
  products[0].menu?.courses.forEach((course) => {
    console.log('COURSE------->', course.name);
    console.log('DISHES------->', course.dishes);
  });

  if (!products.length) {
    return redirect('/404');
  }

  return { product: products[0] };
};

export type ProductPageLoaderData = typeof loader;

export const meta: MetaFunction<ProductPageLoaderData> = getMergedProductMeta;

export default function ProductDetailRoute() {
  const { product } = useLoaderData<{
    product: StoreProduct & { menu: {
      name: string;
      courses: {
        name: string;
      }[];
    } };
  }>();

  if (!product) {
    return <div>404</div>;
  }

  return <ProductTemplate product={product} />;
}
