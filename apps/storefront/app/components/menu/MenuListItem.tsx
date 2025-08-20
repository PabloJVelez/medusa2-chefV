import { StoreMenu } from '@app/components/sections/MenuList';
import clsx from 'clsx';
import { FC } from 'react';

export interface MenuListItemProps {
  menu: StoreMenu;
  isTransitioning?: boolean;
}

export const MenuListItem: FC<MenuListItemProps> = ({ menu, isTransitioning }) => {
  return (
    <div className={clsx('group relative', { 'view-transition-name': isTransitioning })}>
      <div className="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
        {menu.thumbnail && (
          <img
            src={menu.thumbnail}
            alt={menu.title}
            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
          />
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <span aria-hidden="true" className="absolute inset-0" />
            {menu.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{menu.description}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">{menu.price}</p>
      </div>
    </div>
  );
}; 