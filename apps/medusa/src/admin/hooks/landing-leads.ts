import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../sdk"
import type {
  LandingLead,
  AdminLandingLeadsResponse,
  AdminLandingLeadResponse,
  AdminListLandingLeadsQuery,
  AdminUpdateLandingLeadDTO,
} from "../../sdk/admin/admin-landing-leads"

const QUERY_KEY = ["landing-leads"]

// Re-export types for convenience
export type { LandingLead, AdminUpdateLandingLeadDTO }

// Hooks
export const useAdminListLandingLeads = (query: AdminListLandingLeadsQuery = {}) => {
  return useQuery<AdminLandingLeadsResponse>({
    queryKey: [...QUERY_KEY, query],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return await sdk.admin.landingLeads.list(query)
    },
  })
}

export const useAdminRetrieveLandingLead = (id: string) => {
  return useQuery<AdminLandingLeadResponse>({
    queryKey: [...QUERY_KEY, id],
    enabled: !!id,
    queryFn: async () => {
      return await sdk.admin.landingLeads.retrieve(id)
    },
  })
}

export const useAdminUpdateLandingLeadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AdminUpdateLandingLeadDTO }) => {
      return await sdk.admin.landingLeads.update(id, data)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, variables.id] })
    },
  })
}

export const useAdminDeleteLandingLeadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await sdk.admin.landingLeads.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
