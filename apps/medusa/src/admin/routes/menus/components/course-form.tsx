import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@medusajs/ui"
import { courseSchema } from "../schemas"
import type { AdminCourseDTO } from "../../../sdk/admin/admin-menus"

interface CourseFormProps {
  initialData?: AdminCourseDTO
  onSubmit: (data: AdminCourseDTO) => void
  onCancel: () => void
}

export const CourseForm = ({ initialData, onSubmit, onCancel }: CourseFormProps) => {
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Course Name
        </label>
        <input
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          {...form.register("name")}
        />
      </div>
      {/* Add dish form fields here */}
      <div className="flex gap-2 mt-4">
        <Button type="submit">
          {initialData ? "Update Course" : "Add Course"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
} 