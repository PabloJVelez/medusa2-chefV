import { getSelectedRegion } from './data/regions.server';
import { sdk } from '@libs/util/server/client.server';
import { StoreMenu } from '@app/components/sections/MenuList';

interface FetchMenusParams {
  limit?: number;
  offset?: number;
  category_id?: string[];
  handle?: string;
  id?: string;
}

interface MenuResponse {
  menus: StoreMenu[];
  courses?: {
    id: string;
    title: string;
    items: any[];
  }[];
}

export const fetchMenus = async (
  request: Request,
  query: FetchMenusParams = {}
): Promise<MenuResponse> => {
  const region = await getSelectedRegion(request.headers);
  
  const params = new URLSearchParams();
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.offset) params.append('offset', query.offset.toString());
  if (query.category_id) {
    query.category_id.forEach(id => params.append('category_id[]', id));
  }
  params.append('region_id', region.id);

  const response = await sdk.client.fetch<MenuResponse>(
    `/store/menus`,
    {
      method: 'GET',
    }
  );

  if (!response.menus) {
    throw new Error(`Failed to fetch menus: ${JSON.stringify(response)}`);
  }

  return response;
}; 