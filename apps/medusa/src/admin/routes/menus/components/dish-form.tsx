import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@medusajs/ui"
import { dishSchema } from "../schemas"
import type { AdminDishDTO } from "../../../sdk/admin/admin-menus"

interface DishFormProps {
  initialData?: AdminDishDTO
  onSubmit: (data: AdminDishDTO) => void
  onCancel: () => void
}

export const DishForm = ({ initialData, onSubmit, onCancel }: DishFormProps) => {
  const form = useForm({
    resolver: zodResolver(dishSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Dish Name
        </label>
        <input
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          {...form.register("name")}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={3}
          {...form.register("description")}
        />
      </div>
      {/* Add ingredient form fields here */}
      <div className="flex gap-2 mt-4">
        <Button type="submit">
          {initialData ? "Update Dish" : "Add Dish"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
} 