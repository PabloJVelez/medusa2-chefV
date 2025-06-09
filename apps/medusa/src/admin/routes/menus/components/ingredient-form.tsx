import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@medusajs/ui"
import { ingredientSchema } from "../schemas"
import type { AdminIngredientDTO } from "../../../sdk/admin/admin-menus"

interface IngredientFormProps {
  initialData?: AdminIngredientDTO
  onSubmit: (data: AdminIngredientDTO) => void
  onCancel: () => void
}

export const IngredientForm = ({ initialData, onSubmit, onCancel }: IngredientFormProps) => {
  const form = useForm({
    resolver: zodResolver(ingredientSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Ingredient Name
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
        <label className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            {...form.register("optional")}
          />
          <span className="ml-2 text-sm text-gray-700">Optional</span>
        </label>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit">
          {initialData ? "Update Ingredient" : "Add Ingredient"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
} 