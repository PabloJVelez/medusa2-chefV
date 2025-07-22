import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from '../../sdk'
import type { 
  AdminListChefEventsQuery, 
  AdminCreateChefEventDTO, 
  AdminUpdateChefEventDTO,
  AdminChefEventDTO,
  AdminChefEventsResponse,
  AdminAcceptChefEventDTO,
  AdminRejectChefEventDTO
} from '../../sdk/admin/admin-chef-events'

const QUERY_KEY = ['chef-events']

export const useAdminListChefEvents = (query: AdminListChefEventsQuery = {}) => {
  return useQuery<AdminChefEventsResponse>({
    queryKey: [...QUERY_KEY, query],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return sdk.admin.chefEvents.list(query)
    },
  })
}

export const useAdminRetrieveChefEvent = (id: string) => {
  return useQuery<AdminChefEventDTO>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      return sdk.admin.chefEvents.retrieve(id)
    },
  })
}

export const useAdminCreateChefEventMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AdminCreateChefEventDTO) => {
      return await sdk.admin.chefEvents.create(data)
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
      return await sdk.admin.chefEvents.update(id, data)
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
      return await sdk.admin.chefEvents.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useAdminAcceptChefEventMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: AdminAcceptChefEventDTO }) => {
      return await sdk.admin.chefEvents.accept(id, data || {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useAdminRejectChefEventMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AdminRejectChefEventDTO }) => {
      return await sdk.admin.chefEvents.reject(id, data)
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
      return sdk.admin.chefEvents.getMenuProducts()
    },
  })
} 