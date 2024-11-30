import { FC } from 'react';
import { Container } from '@app/components/common/container';
import { StoreMenu } from '@app/components/sections/MenuList';
import { Breadcrumbs } from '@app/components/common/breadcrumbs';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';

interface MenuTemplateProps {
  menu: StoreMenu & {
    courses?: {
      id: string;
      title: string;
      items: any[];
    }[];
  };
}

export const MenuTemplate: FC<MenuTemplateProps> = ({ menu }) => {
  const breadcrumbs = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIcon className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: '/',
    },
    {
      label: 'Menus',
      url: '/menus',
    },
    {
      label: menu.title,
    },
  ];

  return (
    <Container>
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
        {/* Menu Image */}
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg">
          {menu.thumbnail && (
            <img
              src={menu.thumbnail}
              alt={menu.title}
              className="h-full w-full object-cover object-center"
            />
          )}
        </div>

        {/* Menu Details */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {menu.title}
          </h1>
          
          {menu.description && (
            <p className="mt-3 text-gray-500">{menu.description}</p>
          )}

          {menu.price && (
            <p className="mt-3 text-xl font-medium text-gray-900">
              {menu.price}
            </p>
          )}

          {/* Courses Section */}
          {menu.courses && menu.courses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Courses</h2>
              <div className="mt-4 space-y-6">
                {menu.courses.map((course) => (
                  <div key={course.id} className="border-t border-gray-200 pt-4">
                    <h3 className="text-base font-medium text-gray-900">
                      {course.title}
                    </h3>
                    {course.items && course.items.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {course.items.map((item: any) => (
                          <li key={item.id} className="text-sm text-gray-500">
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}; 