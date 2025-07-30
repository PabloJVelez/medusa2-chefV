import { Breadcrumbs } from '@app/components/common/breadcrumbs';
import { Container } from '@app/components/common/container';
import { MenuListWithPagination } from '@app/components/menu/MenuListWithPagination';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { fetchMenus } from '@libs/util/server/data/menus.server';
import { getMergedPageMeta } from '@libs/util/page';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const q = url.searchParams.get('q') || undefined;

    const { menus, count } = await fetchMenus({ limit, offset, q });

    return { 
      menus, 
      count, 
      limit, 
      offset,
      searchQuery: q,
      success: true 
    };
  } catch (error) {
    console.error('Failed to load menus:', error);
    return { 
      menus: [], 
      count: 0, 
      limit: 12, 
      offset: 0,
      searchQuery: undefined,
      success: false 
    };
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const count = data?.count || 0;
  const searchQuery = data?.searchQuery;
  
  const title = searchQuery 
            ? `Search Results for "${searchQuery}" - Menu Templates | Chef Luis Velez`
        : `Menu Templates (${count}) | Chef Luis Velez`;
    
  const description = searchQuery
    ? `Found ${count} menu templates matching "${searchQuery}". Browse our curated collection of chef-designed menus for your culinary experience.`
          : `Browse ${count} professionally designed menu templates by Chef Luis Velez. From intimate dinners to group celebrations, find the perfect menu for your culinary experience.`;

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
          { name: 'keywords', content: 'chef menus, culinary templates, private dining menus, cooking class menus, chef Luis Velez' },
    ...(count === 0 ? [{ name: 'robots', content: 'noindex' }] : []),
  ];
};

export type MenusIndexRouteLoader = typeof loader;

export default function MenusIndexRoute() {
  const data = useLoaderData<MenusIndexRouteLoader>();

  if (!data) return null;

  const { menus, count, limit, offset, searchQuery } = data;

  const breadcrumbs = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIcon className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: `/`,
    },
    {
      label: 'Menu Templates',
    },
  ];

  return (
    <Container className="pb-16">
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-italiana text-gray-900 mb-4">
          Menu Templates
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explore our carefully crafted menu collections, each designed to create memorable 
          culinary experiences. Every menu can be customized to your preferences and dietary requirements.
        </p>
        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {count} results for "<span className="font-medium">{searchQuery}</span>"
          </div>
        )}
      </div>

      {/* Menu Search */}
      <div className="mb-8">
        <form method="get" className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery || ''}
              placeholder="Search menu templates..."
              className="w-full px-4 py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button type="submit" className="sr-only">Search</button>
        </form>
      </div>

      {/* Menu List */}
      <div className="flex flex-col gap-4">
        <MenuListWithPagination
          menus={menus}
          paginationConfig={{ count, offset, limit }}
          context="menus"
          heading={count > 0 ? `${count} Menu Template${count !== 1 ? 's' : ''}` : undefined}
        />
      </div>

      {/* Empty State */}
      {count === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No menus found' : 'No menu templates available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No menu templates match "${searchQuery}". Try adjusting your search terms.`
                : 'We\'re currently preparing our menu templates. Check back soon for exciting culinary options!'
              }
            </p>
            {searchQuery ? (
              <a
                href="/menus"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Menus
              </a>
            ) : (
              <a
                href="/request"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Request Custom Event
              </a>
            )}
          </div>
        </div>
      )}
    </Container>
  );
} 