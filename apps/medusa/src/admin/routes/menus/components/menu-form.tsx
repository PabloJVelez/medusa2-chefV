import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@medusajs/ui"
import { menuSchema } from "../schemas"
import type { AdminCreateMenuDTO } from "../../../sdk/admin/admin-menus"

interface MenuFormProps {
  initialData?: AdminCreateMenuDTO
  onSubmit: (data: AdminCreateMenuDTO) => void
}

export const MenuForm = ({ initialData, onSubmit }: MenuFormProps) => {
  const form = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Menu Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          {...form.register("name")}
        />
      </div>
      {/* Add course form fields here */}
      <Button type="submit">
        {initialData ? "Update Menu" : "Create Menu"}
      </Button>
    </form>
  )
} 