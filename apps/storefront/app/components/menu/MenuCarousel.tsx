import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import type { StoreMenuDTO } from '@libs/util/server/data/menus.server';
import clsx from 'clsx';
import { type FC, memo } from 'react';
import { NavLink } from 'react-router';
import { MenuGridSkeleton } from './MenuGridSkeleton';
import type { MenuListItemProps } from './MenuListItem';
import { MenuListItem } from './MenuListItem';

export interface MenuCarouselProps {
  menus?: StoreMenuDTO[];
  className?: string;
  renderItem?: FC<MenuListItemProps>;
}

export const MenuRow: FC<{ menus: StoreMenuDTO[] }> = memo(({ menus }) => {
  return (
    <>
      {menus.map((menu) => (
        <div
          key={menu.id}
          // Note: not sure if there is a better way to handle the width of these items, but these match closely to our grid layout
          className="xs:w-[47.5%] xs:snap-start mr-6 inline-block w-[100%] snap-center last:mr-0 sm:mr-6 sm:snap-start md:w-[31.2%] xl:mr-8 xl:w-[23%]"
        >
          <NavLink prefetch="viewport" to={`/menus/${menu.id}`} viewTransition>
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

  if (!menus) return <MenuGridSkeleton />;

  return (
    <div className={clsx('menu-carousel relative', className)}>
      <div
        ref={scrollableDivRef}
        className="w-full snap-both snap-mandatory overflow-x-auto whitespace-nowrap pb-2 sm:snap-proximity text-center"
      >
        <MenuRow menus={menus} />
      </div>
      <ScrollArrowButtons className="-mt-12" {...scrollArrowProps} />
    </div>
  );
};

export default MenuCarousel; 