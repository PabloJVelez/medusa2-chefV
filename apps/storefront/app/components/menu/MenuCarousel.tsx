import { NavLink } from 'react-router';
import clsx from 'clsx';
import { memo, type FC } from 'react';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { MenuCarouselSkeleton } from './MenuCarouselSkeleton';
import type { MenuListItemProps } from './MenuListItem';
import { MenuListItem } from './MenuListItem';
import { StoreMenu } from '@app/components/sections/MenuList';

export interface MenuCarouselProps {
  menus?: StoreMenu[];
  className?: string;
  renderItem?: FC<MenuListItemProps>;
}

export const MenuRow: FC<{ menus: StoreMenu[] }> = memo(({ menus }) => {
  return (
    <>
      {menus.map((menu) => (
        <div
          key={menu.id}
          className="xs:w-[47.5%] xs:snap-start mr-6 inline-block w-[100%] snap-center last:mr-0 sm:mr-6 sm:snap-start md:w-[31.2%] xl:mr-8 xl:w-[23%]"
        >
          <NavLink prefetch="intent" to={`/menus/${menu.id}`} viewTransition>
            {({ isTransitioning }) => <MenuListItem isTransitioning={isTransitioning} menu={menu} />}
          </NavLink>
        </div>
      ))}
    </>
  );
});

export const MenuCarousel: FC<MenuCarouselProps> = ({ menus, className }) => {
  const { scrollableDivRef, ...scrollArrowProps } = useScrollArrows({
    buffer: 100,
    resetOnDepChange: [menus],
  });

  if (!menus) return <MenuCarouselSkeleton length={4} />;

  return (
    <div className={clsx('menu-carousel relative', className)}>
      <div
        ref={scrollableDivRef}
        className="w-full snap-both snap-mandatory overflow-x-auto whitespace-nowrap pb-2 sm:snap-proximity"
      >
        <MenuRow menus={menus} />
      </div>
      <ScrollArrowButtons className="-mt-12" {...scrollArrowProps} />
    </div>
  );
};

export default MenuCarousel; 