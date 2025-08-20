import { useEffect, useState } from 'react';
import { Image } from '@app/components/common/images/Image';
import { Button } from '@app/components/common/buttons/Button';
import type { StoreMenuDTO } from '@app/../types/menus';
import { useFormContext } from 'react-hook-form';
import type { EventRequestFormData } from '@app/routes/request._index';
import clsx from 'clsx';
import type { FC } from 'react';
import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import { MenuGridSkeleton } from '@app/components/menu/MenuGridSkeleton';
import { Modal } from '@app/components/common/modals/Modal';

export interface MenuSelectorProps {
  menus: StoreMenuDTO[];
}

interface MenuCardProps {
  menu: StoreMenuDTO;
  isSelected: boolean;
  onSelect: (menuId: string) => void;
  onPreview: (menu: StoreMenuDTO) => void;
}

const MenuCard: FC<MenuCardProps> = ({ menu, isSelected, onSelect, onPreview }) => {
  const courseCount = menu.courses?.length || 0;
  const estimatedTime = '3-4 hours'; // Default estimate
  const courseNames = (menu.courses || [])
    .map((c) => c.name)
    .filter((n): n is string => !!n && n.length > 0)
    .slice(0, 3);

  return (
    <div
      className={clsx(
        'relative bg-white rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-md whitespace-normal h-[380px] flex flex-col',
        isSelected ? 'border-accent-500 bg-accent-50 shadow-md' : 'border-gray-200 hover:border-accent-300'
      )}
      onClick={() => onSelect(menu.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(menu.id);
      }}
    >
      {/* Selection indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={clsx(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
            isSelected ? 'border-accent-500 bg-accent-500' : 'border-gray-300'
          )}
        >
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>

      {/* Menu image */}
      <div className="aspect-[16/9] overflow-hidden bg-gray-100 rounded-lg mb-4">
        <Image
          src="https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
          alt={menu.name}
          className="w-full h-full object-cover"
          width={800}
          height={600}
          loading="lazy"
        />
      </div>

      {/* Menu details */}
      <div className="space-y-3 flex-1">
        <div>
          <h4 className="text-xl font-semibold text-primary-900 leading-snug">{menu.name}</h4>
          <p className="text-sm text-primary-600">
            {courseCount} courses • {estimatedTime}
          </p>
        </div>

        {courseNames.length > 0 && (
          <ul className="text-sm text-primary-700 space-y-1">
            {courseNames.map((n, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
                <span className="line-clamp-1">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-3">
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(menu);
          }}
          className="text-accent-700 hover:text-accent-800"
        >
          View full menu
        </Button>
      </div>
    </div>
  );
};

export const MenuSelector: FC<MenuSelectorProps> = ({ menus }) => {
  const { watch, setValue } = useFormContext<EventRequestFormData>();
  const selectedMenuId = watch('menuId');
  const [preview, setPreview] = useState<StoreMenuDTO | null>(null);

  // Ensure there is always a selected menu (first by default)
  useEffect(() => {
    if (!selectedMenuId && menus?.length) {
      setValue('menuId', menus[0].id, { shouldValidate: true });
    }
  }, [menus, selectedMenuId, setValue]);

  const { scrollableDivRef, ...scrollArrowProps } = useScrollArrows({
    buffer: 100,
    resetOnDepChange: [menus],
  });

  if (!menus) return <MenuGridSkeleton />;

  const handleSelect = (menuId: string) => setValue('menuId', menuId, { shouldValidate: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">Select a Menu Template</h3>
        <p className="text-primary-600">Scroll horizontally or use the arrows to choose a menu.</p>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          ref={scrollableDivRef}
          className="w-full snap-both snap-mandatory overflow-x-auto whitespace-nowrap pb-2 sm:snap-proximity"
        >
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="xs:w-[65%] xs:snap-start mr-6 inline-block w-[100%] snap-center last:mr-0 sm:mr-6 sm:snap-start md:w-[55%] xl:mr-8 xl:w-[42%] align-top"
            >
              <MenuCard
                menu={menu}
                isSelected={selectedMenuId === menu.id}
                onSelect={handleSelect}
                onPreview={(m) => setPreview(m)}
              />
            </div>
          ))}
        </div>
        <ScrollArrowButtons className="-mt-12" {...scrollArrowProps} />
      </div>

      {/* Selected indicator */}
      {selectedMenuId && (
        <div className="text-center text-sm text-accent-700">
          Selected menu: {menus.find((m) => m.id === selectedMenuId)?.name}
        </div>
      )}

      {/* Menu preview modal */}
      {preview && (
        <Modal isOpen={!!preview} onClose={() => setPreview(null)}>
          <div className="max-w-2xl">
            <h3 className="mb-2 text-2xl font-bold text-primary-900">{preview.name}</h3>
            <p className="mb-4 text-sm text-primary-600">
              {preview.courses?.length || 0} courses • 3-4 hours
            </p>

            <div className="mb-6 grid grid-cols-1 gap-4">
              {(preview.courses || []).map((course, idx) => (
                <div key={idx} className="rounded-md border border-gray-200 p-4">
                  <h4 className="mb-2 text-base font-semibold text-primary-900">{course.name || `Course ${idx + 1}`}</h4>
                  <ul className="text-sm text-primary-700 space-y-1">
                    {(course.dishes || []).map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
                        <span>{d.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="default" onClick={() => setPreview(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MenuSelector; 