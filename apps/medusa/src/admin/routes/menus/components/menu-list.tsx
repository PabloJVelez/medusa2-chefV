import { useMenus, useDeleteMenu } from "../../../hooks/menus.js"
import { DataTable } from "@medusajs/ui"
import { Link } from "@remix-run/react"

export const MenuList = () => {
  const { data: menus } = useMenus()
  const deleteMenu = useDeleteMenu()

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Courses",
      accessorKey: "courses",
      cell: ({ row }) => row.original.courses.length
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link to={`/app/menus/${row.original.id}`}>
            Edit
          </Link>
          <button
            onClick={() => deleteMenu.mutate(row.original.id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={menus?.menus || []}
    />
  )
} 