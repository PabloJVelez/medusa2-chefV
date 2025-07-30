import { useState } from 'react';
import { Image } from '@app/components/common/images/Image';
import { Button } from '@app/components/common/buttons/Button';
import type { StoreMenuDTO } from '@app/../types/menus';
import { useFormContext } from 'react-hook-form';
import type { EventRequestFormData } from '@app/routes/request._index';
import clsx from 'clsx';
import type { FC } from 'react';

export interface MenuSelectorProps {
  menus: StoreMenuDTO[];
}

interface MenuCardProps {
  menu: StoreMenuDTO;
  isSelected: boolean;
  onSelect: (menuId: string) => void;
}

const MenuCard: FC<MenuCardProps> = ({ menu, isSelected, onSelect }) => {
  const courseCount = menu.courses?.length || 0;
  const estimatedTime = "3-4 hours"; // Default estimate

  return (
    <div
      className={clsx(
        "relative bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected
          ? "border-accent-500 bg-accent-50 shadow-md"
          : "border-gray-200 hover:border-accent-300"
      )}
      onClick={() => onSelect(menu.id)}
    >
      {/* Selection indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={clsx(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            isSelected
              ? "border-accent-500 bg-accent-500"
              : "border-gray-300"
          )}
        >
          {isSelected && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
      </div>

      {/* Menu image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-lg mb-4">
        <Image
          src="https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
          alt={menu.name}
          className="w-full h-full object-cover"
          width={400}
          height={300}
          loading="lazy"
        />
      </div>

      {/* Menu details */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-primary-900 mb-1">
            {menu.name}
          </h3>
          <p className="text-sm text-primary-600">
            {courseCount} courses • {estimatedTime}
          </p>
        </div>

        <p className="text-sm text-primary-700 line-clamp-3">
          {/* Generate a description from the first few dishes */}
          {menu.courses
            .slice(0, 2)
            .map(course =>
              course.dishes.slice(0, 2).map(dish => dish.name).join(', ')
            )
            .join(' • ') || 'A carefully crafted menu experience'}
        </p>

        <div className="text-sm text-primary-600">
          <span className="font-medium">From $99.99</span> per person
        </div>
      </div>
    </div>
  );
};

export const MenuSelector: FC<MenuSelectorProps> = ({ menus }) => {
  const { watch, setValue } = useFormContext<EventRequestFormData>();
  const selectedMenuId = watch('menuId');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter menus based on search term
  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.courses.some(course =>
      course.dishes.some(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const handleMenuSelect = (menuId: string) => {
    // Toggle selection - if already selected, deselect it
    const newValue = selectedMenuId === menuId ? undefined : menuId;
    setValue('menuId', newValue, { shouldValidate: true });
  };

  const handleSkip = () => {
    setValue('menuId', undefined, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          Choose a Menu Template (Optional)
        </h3>
        <p className="text-primary-600">
          Select a menu template as inspiration for your event, or skip to create a completely custom experience.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search menus or dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
        />
      </div>

      {/* Skip option */}
      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          className="text-sm"
        >
          Skip menu selection - Create custom experience
        </Button>
      </div>

      {/* Menu grid */}
      {filteredMenus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              isSelected={selectedMenuId === menu.id}
              onSelect={handleMenuSelect}
            />
          ))}
        </div>
      ) : searchTerm ? (
        <div className="text-center py-8">
          <p className="text-primary-600">
            No menus found matching "{searchTerm}". Try a different search term.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-primary-600">
            No menu templates available at the moment.
          </p>
        </div>
      )}

      {/* Selected menu indicator */}
      {selectedMenuId && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-700">
                Selected Menu Template
              </p>
              <p className="text-sm text-accent-600">
                {menus.find(m => m.id === selectedMenuId)?.name}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setValue('menuId', undefined)}
              className="text-accent-600 text-sm"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          How Menu Templates Work
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Menu templates provide inspiration and starting points for your event</li>
                      <li>• Chef Luis will customize any template based on your preferences</li>
          <li>• You can skip this step and create a completely custom menu</li>
          <li>• Final pricing depends on your chosen experience type, not the menu template</li>
        </ul>
      </div>
    </div>
  );
};

export default MenuSelector; 