import { useQuery, useMutation } from "@tanstack/react-query"
import { sdk } from "../../sdk/index"
import type { 
  AdminListMenusQuery, 
  AdminCreateMenuDTO, 
  AdminUpdateMenuDTO 
} from "../../sdk/admin/admin-menus"

export const useMenus = (query?: AdminListMenusQuery) => {
  return useQuery({
    queryKey: ["menus", query],
    queryFn: () => sdk.menus.list(query)
  })
}

export const useMenu = (id: string) => {
  return useQuery({
    queryKey: ["menu", id],
    queryFn: () => sdk.menus.retrieve(id)
  })
}

export const useCreateMenu = () => {
  return useMutation({
    mutationFn: (data: AdminCreateMenuDTO) => sdk.menus.create(data)
  })
}

export const useUpdateMenu = (id: string) => {
  return useMutation({
    mutationFn: (data: AdminUpdateMenuDTO) => sdk.menus.update(id, data)
  })
}

export const useDeleteMenu = () => {
  return useMutation({
    mutationFn: (id: string) => sdk.menus.delete(id)
  })
} 