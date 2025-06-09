import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useMenu, useUpdateMenu } from "../../../hooks/menus.js"
import { MenuForm } from "../components/menu-form.js"
import type { AdminCreateMenuDTO } from "../../../sdk/admin/admin-menus"

interface MenuDetailsPageProps {
  params: {
    id: string
  }
}

const MenuDetailsPage = ({ params }: MenuDetailsPageProps) => {
  const { data: menu } = useMenu(params.id)
  const updateMenu = useUpdateMenu(params.id)

  const handleSubmit = async (data: AdminCreateMenuDTO) => {
    await updateMenu.mutateAsync(data)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Edit Menu</Heading>
      </div>
      {menu && (
        <MenuForm
          initialData={menu}
          onSubmit={handleSubmit}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Edit Menu",
})

export default MenuDetailsPage 