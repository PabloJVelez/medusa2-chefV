import { useAdminListMenus, useAdminDeleteMenuMutation } from "../../../hooks/menus"
import { DataTable, Heading, createDataTableColumnHelper, useDataTable } from "@medusajs/ui"
import { Link } from "@remix-run/react"
import { useState } from "react"
import type { AdminMenuDTO } from "../../../../sdk/admin/admin-menus"

const columnHelper = createDataTableColumnHelper<AdminMenuDTO>()

export const MenuList = () => {
  const [query, setQuery] = useState({ limit: 10, offset: 0, q: "" })
  const { data, isLoading } = useAdminListMenus(query)
  const deleteMenu = useAdminDeleteMenuMutation()

  const columns = [
    columnHelper.accessor('name', {
      header: "Name",
      cell: ({ row }) => (
        <Link to={`/app/menus/${row.original.id}`} className="hover:underline">
          {row.original.name}
        </Link>
      ),
    }),
    columnHelper.accessor('courses', {
      header: "Courses",
      cell: ({ row }) => row.original.courses.length,
    }),
    columnHelper.accessor('created_at', {
      header: "Created At",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    }),
    columnHelper.action({
      actions: ({ row }) => [
        {
          icon: "Edit",
          label: "Edit",
          onClick: () => {
            // Navigation is handled by the Link component
          },
        },
        {
          icon: "Delete",
          label: "Delete",
          onClick: () => deleteMenu.mutate(row.original.id),
        },
      ],
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.menus || [],
    getRowId: (row) => row.id,
    rowCount: data?.count ?? 0,
    isLoading,
    search: {
      state: query.q,
      onSearchChange: (q) => {
        setQuery({ ...query, q, offset: 0 })
      },
    },
    pagination: {
      state: {
        pageIndex: Math.floor(query.offset / query.limit),
        pageSize: query.limit,
      },
      onPaginationChange: (pagination) => {
        setQuery({
          ...query,
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
        })
      },
    },
  })

  return (
    <DataTable instance={table}>
      <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <Heading>Menus</Heading>
        <DataTable.Search />
      </DataTable.Toolbar>

      <DataTable.Table />

      <DataTable.Pagination />
    </DataTable>
  )
} 