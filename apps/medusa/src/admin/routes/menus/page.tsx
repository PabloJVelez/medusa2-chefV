import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, FocusModal } from "@medusajs/ui"
import { MenuList } from "./components/menu-list.js"
import { MenuForm } from "./components/menu-form.js"
import { useAdminCreateMenuMutation } from "../../hooks/menus.js"
import { useState } from "react"
import type { AdminCreateMenuDTO } from "../../../sdk/admin/admin-menus.js"

const MenusPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const createMenu = useAdminCreateMenuMutation()

  const handleCreateMenu = async (data: AdminCreateMenuDTO) => {
    try {
      await createMenu.mutateAsync(data)
      setShowCreateModal(false)
    } catch (error) {
      console.error("Error creating menu:", error)
      // Error handling is done in the form component
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Menus</Heading>
      </div>
      
      <MenuList onCreateMenu={() => setShowCreateModal(true)} />
      
      {showCreateModal && (
        <FocusModal open onOpenChange={setShowCreateModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Create Menu</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <MenuForm 
                onSubmit={handleCreateMenu}
                isLoading={createMenu.isPending}
                onCancel={() => setShowCreateModal(false)}
              />
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Menus",
})

export default MenusPage 