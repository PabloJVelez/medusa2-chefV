import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useAdminRetrieveMenu, useAdminUpdateMenuMutation } from "../../../hooks/menus"
import { MenuForm } from "../components/menu-form"
import { useParams, useNavigate } from "react-router-dom"
import type { AdminUpdateMenuDTO } from "../../../../sdk/admin/admin-menus"

interface MenuDetailsPageProps {
  params: {
    id: string
  }
}

const MenuDetailsPage = ({ params }: MenuDetailsPageProps) => {
  const { id } = useParams()
  console.log("id", id)
  const { data: menu, isLoading } = useAdminRetrieveMenu(id as string)
  const updateMenu = useAdminUpdateMenuMutation(id as string)
  const navigate = useNavigate()

  const handleSubmit = async (data: AdminUpdateMenuDTO) => {
    try {
      await updateMenu.mutateAsync(data)
      navigate("/app/menus")
    } catch (error) {
      console.error("Error updating menu:", error)
    }
  }

  const handleCancel = () => {
    navigate("/app/menus")
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
        onCancel={handleCancel}
        isLoading={updateMenu.isPending}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Edit Menu",
})

export default MenuDetailsPage 