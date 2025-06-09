import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useAdminCreateMenuMutation } from "../../../hooks/menus"
import { MenuForm } from "../components/menu-form"
import { useNavigate } from "@remix-run/react"
import type { AdminCreateMenuDTO } from "../../../../sdk/admin/admin-menus"

const NewMenuPage = () => {
  const createMenu = useAdminCreateMenuMutation()
  const navigate = useNavigate()

  const handleSubmit = async (data: AdminCreateMenuDTO) => {
    const result = await createMenu.mutateAsync(data)
    if (result && 'id' in result) {
      navigate(`/app/menus/${result.id}`)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Create Menu</Heading>
      </div>
      <MenuForm 
        onSubmit={handleSubmit}
        isLoading={createMenu.isPending}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Create Menu",
})

export default NewMenuPage 