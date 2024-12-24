import { buildSearchParamsFromObject } from '@libs/util/buildSearchParamsFromObject';
import type { CustomAction } from '@libs/types';
import { useFetcher } from '@remix-run/react';
import clsx from 'clsx';
import { HTMLAttributes, memo, useEffect, useState, type FC } from 'react';
import { MenuCategoryTabs } from '@app/components/menu/MenuCategoryTabs';
import { MenuListHeader } from '@app/components/menu/MenuListHeader';
import { Container } from '@app/components/common/container/Container';
import MenuCarousel from '@app/components/menu/MenuCarousel';

export interface StoreMenu {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  description?: string;
  price?: string;
}

export interface StoreMenuCategory {
  id: string;
  name: string;
}

export interface MenuListProps<TElement extends HTMLElement = HTMLDivElement> extends HTMLAttributes<TElement> {
  heading?: string;
  text?: string;
  actions?: CustomAction[];
  className?: string;
}

const MenuListBase: FC<{}> = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<number | undefined>(undefined);
  const fetcher = useFetcher<{
    menus: StoreMenu[];
    category_tabs: StoreMenuCategory[];
  }>();

  const { category_tabs, menus } = fetcher.data || {};

  const hasCategoryTabs = !!category_tabs?.length;
  const hasMenus = isInitialized && !menus?.length;

  const fetchData = (filters?: { category_id?: string[] }) => {
    const queryString = buildSearchParamsFromObject({
      subloader: 'menuList',
      data: JSON.stringify({
        content: filters,
      }),
    });

    fetcher.load(`/api/page-data?${queryString}`);
  };

  useEffect(() => {
    if (fetcher.data || fetcher.state === 'loading') {
      return;
    }

    fetchData();
  }, []);

  const handleTabChange = (index: number) => {
    const category = category_tabs?.[index - 1];
    setSelectedTab(index);
    fetchData({ category_id: [category?.id!] });
  };

  useEffect(() => {
    if (!isInitialized && fetcher.data) {
      setIsInitialized(true);
    }
  }, [fetcher.data]);

  return (
    <>
      {hasCategoryTabs && (
        <div className="pb-6">
          <MenuCategoryTabs
            selectedIndex={selectedTab}
            categories={category_tabs}
            onChange={handleTabChange}
          />
        </div>
      )}

      {hasMenus && (
        <div className="mb-8 mt-8">
          <h3 className="text-lg font-bold text-gray-900">
            There are no menu items to show
            {hasCategoryTabs ? ' in this category.' : ''}
          </h3>
        </div>
      )}

      {!hasMenus && <MenuCarousel menus={menus} />}
    </>
  );
};

export const MenuList: FC<MenuListProps> = memo(({ className, heading, text, actions, ...props }) => {
  return (
    <section className={clsx(`mkt-section relative overflow-x-hidden`, className)} {...props}>
      <div className="mkt-section__inner relative z-[2]">
        <Container>
          <MenuListHeader heading={heading} text={text} actions={actions} />
          <MenuListBase {...props} />
        </Container>
      </div>
    </section>
  );
});

export default MenuList;
