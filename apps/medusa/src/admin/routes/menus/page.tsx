import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { MenuList } from "./components/menu-list.js"

const MenusPage = () => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Menus</Heading>
      </div>
      <MenuList />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Menus",
})

export default MenusPage 