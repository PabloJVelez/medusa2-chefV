import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from '../../sdk'
import type { 
  AdminListChefEventsQuery, 
  AdminCreateChefEventDTO, 
  AdminUpdateChefEventDTO,
  AdminChefEventDTO,
  AdminChefEventsResponse
} from '../../sdk/admin/admin-chef-events'

const QUERY_KEY = ['chef-events']

export const useAdminListChefEvents = (query: AdminListChefEventsQuery = {}) => {
  return useQuery<AdminChefEventsResponse>({
    queryKey: [...QUERY_KEY, query],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return sdk.chefEvents.list(query)
    },
  })
}

export const useAdminRetrieveChefEvent = (id: string) => {
  return useQuery<AdminChefEventDTO>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      return sdk.chefEvents.retrieve(id)
    },
  })
}

export const useAdminCreateChefEventMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AdminCreateChefEventDTO) => {
      return await sdk.chefEvents.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useAdminUpdateChefEventMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AdminUpdateChefEventDTO) => {
      return await sdk.chefEvents.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
    },
  })
}

export const useAdminDeleteChefEventMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return await sdk.chefEvents.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useAdminGetMenuProducts = () => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'menu-products'],
    queryFn: async () => {
      return sdk.chefEvents.getMenuProducts()
    },
  })
} 