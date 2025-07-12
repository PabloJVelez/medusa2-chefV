import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Label, Text, Input } from "@medusajs/ui"
import { menuSchema } from "../schemas"
import type { AdminCreateMenuDTO, AdminMenuDTO } from "../../../../sdk/admin/admin-menus"

interface MenuFormProps {
  initialData?: AdminMenuDTO
  onSubmit: (data: AdminCreateMenuDTO) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const MenuForm = ({ initialData, onSubmit, onCancel, isLoading }: MenuFormProps) => {
  const form = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: initialData || {
      name: "",
      courses: []
    }
  })

  const handleSubmit = async (data: AdminCreateMenuDTO) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <div className="p-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Menu Name</Label>
            <Input
              id="name"
              placeholder="Enter menu name..."
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <Text className="text-red-500 text-sm mt-1">
                {form.formState.errors.name.message}
              </Text>
            )}
          </div>

          <div>
            <Text size="small" className="text-gray-600">
              Course and dish management will be available after creating the menu.
              You can edit the menu to add courses, dishes, and ingredients.
            </Text>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : initialData ? "Update Menu" : "Create Menu"}
          </Button>
        </div>
      </form>
    </div>
  )
} 