import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import type { StoreMenuDTO } from '@libs/util/server/data/menus.server';
import clsx from 'clsx';
import { type FC, memo, useEffect } from 'react';
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
          data-card
          // Widths tuned to match grid steps while enabling snap scrolling
          className="xs:w-[85%] xs:snap-center mr-4 inline-block w-[90%] snap-center last:mr-0 sm:w-[70%] sm:mr-6 md:w-[48%] xl:w-[31%] xl:mr-8"
        >
          <NavLink prefetch="viewport" to={`/menus/${menu.id}`} viewTransition>
            {({ isTransitioning }) => <MenuListItem isTransitioning={isTransitioning} menu={menu} />}
          </NavLink>
          {/* Quick actions under each card for mobile ergonomics */}
          <div className="mt-2 flex gap-2 md:hidden">
            <NavLink
              to={`/menus/${menu.id}`}
              className="flex-1 rounded-lg bg-gray-900 text-white text-sm py-2 text-center active:opacity-90"
            >
              View details
            </NavLink>
            <NavLink
              to={`/request?menuId=${menu.id}`}
              className="flex-1 rounded-lg bg-blue-600 text-white text-sm py-2 text-center active:opacity-90"
            >
              Request this
            </NavLink>
          </div>
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

  // Motion polish: parallax image and scale centered card
  useEffect(() => {
    const container = scrollableDivRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const updateMotion = () => {
      rafId = null;
      const rect = container.getBoundingClientRect();
      const containerCenter = rect.left + rect.width / 2;

      const cards = container.querySelectorAll<HTMLElement>('[data-card]');
      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const delta = (cardCenter - containerCenter) / rect.width; // -1..1 approximately
        const clamped = Math.max(-1, Math.min(1, delta));

        const scale = 1 + (1 - Math.min(1, Math.abs(clamped) * 2)) * 0.05; // up to +5% in center
        const parallaxX = -clamped * 24; // px

        card.style.setProperty('--scale', scale.toFixed(3));
        card.style.setProperty('--parallax-x', `${parallaxX.toFixed(1)}px`);
      });
    };

    const onScroll = () => {
      if (rafId == null) {
        rafId = requestAnimationFrame(updateMotion);
      }
    };

    updateMotion();
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [menus, scrollableDivRef]);

  return (
    <div className={clsx('menu-carousel relative', className)}>
      <div
        ref={scrollableDivRef}
        className="w-full snap-x snap-mandatory overflow-x-auto whitespace-nowrap pb-2 sm:snap-proximity text-center no-scrollbar"
      >
        <MenuRow menus={menus} />
      </div>
      <ScrollArrowButtons className="-mt-12" {...scrollArrowProps} />
    </div>
  );
};

export default MenuCarousel; 