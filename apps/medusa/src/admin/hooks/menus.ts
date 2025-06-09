import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from '../../sdk'
import type { 
  AdminListMenusQuery, 
  AdminCreateMenuDTO, 
  AdminUpdateMenuDTO,
  AdminMenuDTO,
  AdminMenusResponse
} from '../../sdk/admin/admin-menus'

const QUERY_KEY = ['menus']

export const useAdminListMenus = (query: AdminListMenusQuery = {}) => {
  return useQuery<AdminMenusResponse>({
    queryKey: [...QUERY_KEY, query],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return sdk.menus.list(query)
    },
  })
}

export const useAdminRetrieveMenu = (id: string) => {
  return useQuery<AdminMenuDTO>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      return sdk.menus.retrieve(id)
    },
  })
}

export const useAdminCreateMenuMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AdminCreateMenuDTO) => {
      return await sdk.menus.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useAdminUpdateMenuMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AdminUpdateMenuDTO) => {
      return await sdk.menus.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
    },
  })
}

export const useAdminDeleteMenuMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return await sdk.menus.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
} 