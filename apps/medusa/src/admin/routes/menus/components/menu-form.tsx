import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Label, Text, Textarea } from "@medusajs/ui"
import { menuSchema } from "../schemas"
import type { AdminCreateMenuDTO, AdminMenuDTO } from "../../../../sdk/admin/admin-menus"

interface MenuFormProps {
  initialData?: AdminMenuDTO
  onSubmit: (data: AdminCreateMenuDTO) => void
  isLoading?: boolean
}

export const MenuForm = ({ initialData, onSubmit, isLoading }: MenuFormProps) => {
  const form = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Menu Name</Label>
          <Textarea
            id="name"
            placeholder="Enter menu name..."
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <Text className="text-red-500" size="small">
              {form.formState.errors.name.message}
            </Text>
          )}
        </div>

        {/* Add course form fields here */}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Menu" : "Create Menu"}
          </Button>
        </div>
      </div>
    </form>
  )
} 