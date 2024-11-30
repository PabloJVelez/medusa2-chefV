import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { MenuTemplate } from '@app/templates/MenuTemplate';
import { fetchMenus } from '@libs/util/server/menu.server';
import { StoreMenu } from '@app/components/sections/MenuList';

export const loader = async (args: LoaderFunctionArgs) => {
  const { menus } = await fetchMenus(args.request, {
    id: args.params.menuId,
  }).catch((e) => {
    return { menus: [] };
  });

  if (!menus.length) {
    return redirect('/404');
  }

  return { menu: menus[0] };
};

export type MenuPageLoaderData = typeof loader;

export const meta: MetaFunction<MenuPageLoaderData> = ({ data }) => {
  if (!data?.menu) {
    return [
      { title: 'Menu Not Found | Chef' },
      { description: 'The menu you are looking for does not exist.' },
    ];
  }

  return [
    { title: `${data.menu.title} | Chef` },
    { description: data.menu.description || `View ${data.menu.title} details` },
  ];
};

export default function MenuDetailRoute() {
  const { menu } = useLoaderData<{
    menu: StoreMenu & {
      courses?: {
        id: string;
        title: string;
        items: any[];
      }[];
    };
  }>();

  if (!menu) {
    return <div>404</div>;
  }

  return <MenuTemplate menu={menu} />;
} 