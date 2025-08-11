import { Image } from '@app/components/common/images/Image';
import type { StoreMenuDTO } from '@libs/util/server/data/menus.server';
import clsx from 'clsx';
import type { FC } from 'react';

export interface MenuListItemProps {
  menu: StoreMenuDTO;
  isTransitioning?: boolean;
  className?: string;
}

export const MenuListItem: FC<MenuListItemProps> = ({ 
  menu, 
  isTransitioning = false, 
  className 
}) => {
  const courseCount = menu.courses?.length || 0;
  const estimatedTime = "3-4 hours"; // Default estimate since not in data model yet
  
  // Generate a description from the first few dishes
  const description = menu.courses
    .slice(0, 2)
    .map(course => 
      course.dishes.slice(0, 2).map(dish => dish.name).join(', ')
    )
    .join(' • ') || 'A carefully crafted menu experience';

  return (
    <div 
      className={clsx(
        // Make card a flex column so heights align and footer sticks to bottom
        "group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col",
        {
          'scale-105': isTransitioning,
        },
        className
      )}
    >
      {/* Menu Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src="/assets/images/chef_beef_menu.JPG"
          alt={menu.name}
          className="w-full h-full object-cover [transform:translateX(var(--parallax-x,0))] group-hover:scale-105 transition-transform duration-300"
          width={400}
          height={300}
          loading="lazy"
        />
      </div>
      
      {/* Menu Content */}
      <div className="p-6 space-y-4 flex-1 flex flex-col" style={{ transform: 'scale(var(--scale,1))' }}>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {menu.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {courseCount} course{courseCount !== 1 ? 's' : ''} • {estimatedTime}
          </p>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed flex-1">
          {description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
          <div className="text-sm text-gray-600">
            <span className="font-medium">From $99.99</span> per person
          </div>
          <div className="text-sm font-medium text-blue-600 flex items-center">
            View Menu
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-2xl" />
    </div>
  );
}; 