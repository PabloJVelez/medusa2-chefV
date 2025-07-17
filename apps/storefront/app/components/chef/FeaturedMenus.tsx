import { Container } from '@app/components/common/container/Container';
import { ActionList } from '@app/components/common/actions-list/ActionList';
import { MenuCarousel } from '@app/components/menu/MenuCarousel';
import type { StoreMenuDTO } from '@app/../types/menus';
import clsx from 'clsx';
import type { FC } from 'react';

export interface FeaturedMenusProps {
  className?: string;
  title?: string;
  description?: string;
  menus: StoreMenuDTO[];
  maxDisplay?: number;
}

export const FeaturedMenus: FC<FeaturedMenusProps> = ({ 
  className,
  title = "Featured Menu Collections",
  description = "Discover our carefully crafted menu templates, each designed to create memorable culinary experiences for your special occasions.",
  menus,
  maxDisplay 
}) => {
  return (
    <Container className={clsx('py-16 lg:py-20', className)}>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-italiana text-primary-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-primary-600 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {menus.length > 0 ? (
        <>
          <MenuCarousel menus={menus} className="mb-12" />

          <div className="text-center">
            <ActionList
              actions={[
                {
                  label: 'View All Menus',
                  url: '/menus',
                },
                {
                  label: 'Request Custom Event',
                  url: '/request',
                },
              ]}
              className="flex-col gap-4 sm:flex-row sm:justify-center"
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-primary-900 mb-2">
              Menus Coming Soon
            </h3>
            <p className="text-primary-600 mb-6">
              We're crafting exceptional menu templates for your culinary experiences. 
              In the meantime, you can request a custom event.
            </p>
            <ActionList
              actions={[
                {
                  label: 'Request Custom Event',
                  url: '/request',
                },
              ]}
            />
          </div>
        </div>
      )}
    </Container>
  );
};

export default FeaturedMenus; 