import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useAdminRetrieveMenu, useAdminUpdateMenuMutation } from "../../../hooks/menus"
import { MenuForm } from "../components/menu-form"
import type { AdminUpdateMenuDTO } from "../../../../sdk/admin/admin-menus"

interface MenuDetailsPageProps {
  params: {
    id: string
  }
}

const MenuDetailsPage = ({ params }: MenuDetailsPageProps) => {
  const { data: menu, isLoading } = useAdminRetrieveMenu(params.id)
  const updateMenu = useAdminUpdateMenuMutation(params.id)

  const handleSubmit = async (data: AdminUpdateMenuDTO) => {
    await updateMenu.mutateAsync(data)
  }

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-full">
          <span>Loading...</span>
        </div>
      </Container>
    )
  }

  if (!menu) {
    return (
      <Container>
        <div className="flex items-center justify-center h-full">
          <span>Menu not found</span>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Edit Menu</Heading>
      </div>
      <MenuForm
        initialData={menu}
        onSubmit={handleSubmit}
        isLoading={updateMenu.isPending}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Edit Menu",
})

export default MenuDetailsPage 