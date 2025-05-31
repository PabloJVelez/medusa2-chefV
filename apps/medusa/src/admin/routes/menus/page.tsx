import React, { useState, useEffect, useMemo } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Badge,
  DataTable,
  createDataTableColumnHelper,
  useDataTable,
  DataTablePaginationState,
  DataTableFilteringState,
  DataTableSortingState,
  createDataTableFilterHelper,
  TooltipProvider
} from "@medusajs/ui"
import MenuCreateModal from "../../components/menu-create-modal.jsx"
import { sdk } from "../../../sdk/index.js"

// Define the Menu type based on the model
type MenuDTO = {
  id: string
  name: string
  courses: CourseDTO[]
  createdAt: Date
  updatedAt: Date
}

type CourseDTO = {
  id: string
  name: string
  dishes: DishDTO[]
}

type DishDTO = {
  id: string
  name: string
  description: string | null
  ingredients: IngredientDTO[]
}

type IngredientDTO = {
  id: string
  name: string
  optional: boolean | null
}

const columnHelper = createDataTableColumnHelper<MenuDTO>()
const filterHelper = createDataTableFilterHelper<MenuDTO>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("id", {
    header: "Courses",
    cell: (info) => {
      const courses = info.row.original.courses || []
      return courses.length
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => {
      return new Date(info.getValue()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    enableSorting: true,
    sortLabel: "Created Date"
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: (info) => {
      return new Date(info.getValue()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    enableSorting: true,
    sortLabel: "Last Updated Date"
  })
]

const filters = [
  filterHelper.accessor("name", {
    type: "text",
    label: "Menu Name"
  }),
  filterHelper.accessor("courses", {
    type: "number",
    label: "Number of Courses",
    format: "number",
    rangeOptionLabel: "Course Range",
    rangeOptionStartLabel: "From",
    rangeOptionEndLabel: "To"
  })
]

const MenusPage = () => {
  const [showModal, setShowModal] = useState(false)
  const [menus, setMenus] = useState<MenuDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: 10,
    pageIndex: 0
  })

  const [filtering, setFiltering] = useState<DataTableFilteringState>({})
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)
  const [search, setSearch] = useState("")

  // Filter and sort menus
  const filteredMenus = useMemo(() => {
    let filtered = [...menus]

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(menu => 
        menu.name.toLowerCase().includes(searchLower)
      )
    }

    // Apply filters
    filtered = filtered.filter(menu => {
      return Object.entries(filtering).every(([key, value]) => {
        if (!value) return true
        if (key === "courses") {
          const courseCount = menu.courses.length
          const filterValue = value as any
          if (filterValue.$gte !== undefined && courseCount < filterValue.$gte) return false
          if (filterValue.$lte !== undefined && courseCount > filterValue.$lte) return false
          return true
        }
        if (key === "name") {
          return menu.name.toLowerCase().includes((value as string).toLowerCase())
        }
        return true
      })
    })

    // Apply sorting
    if (sorting) {
      filtered.sort((a, b) => {
        let aVal, bVal
        
        if (sorting.id === "totalDishes") {
          aVal = a.courses.reduce((total, course) => total + course.dishes.length, 0)
          bVal = b.courses.reduce((total, course) => total + course.dishes.length, 0)
        } else {
          aVal = a[sorting.id]
          bVal = b[sorting.id]
        }
        
        if (aVal < bVal) return sorting.desc ? 1 : -1
        if (aVal > bVal) return sorting.desc ? -1 : 1
        return 0
      })
    }

    return filtered
  }, [menus, filtering, sorting, search])

  // Apply pagination
  const paginatedMenus = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredMenus.slice(start, end)
  }, [filteredMenus, pagination])

  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoading(true)
      try {
        const productTypesResponse = await sdk.admin.productType.list({
          value: "menu"
        })
        const productType = productTypesResponse.product_types[0].id
        const productMenus = await sdk.admin.product.list({
          type_id: productType
        })
        const productMenuIds = productMenus.products.map(product => product.id)

        const { menus: fetchedMenus } = await sdk.admin.menus.list({
          product_ids: productMenuIds
        })
        
        setMenus(fetchedMenus || [])
      } catch (error) {
        console.error("Error fetching menus:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenus()
  }, [])

  const table = useDataTable({
    columns,
    data: paginatedMenus,
    getRowId: (menu) => menu.id,
    rowCount: filteredMenus.length,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination
    },
    sorting: {
      state: sorting,
      onSortingChange: setSorting
    },
    filtering: {
      state: filtering,
      onFilteringChange: setFiltering
    },
    search: {
      state: search,
      onSearchChange: setSearch
    },
    filters,
    onRowClick: (_, row) => {
      window.location.href = `/app/menus/${row.id}`
    }
  })

  return (
    <Container>
      <TooltipProvider>
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <Heading level="h1">Menus</Heading>
              <Text className="text-gray-500">
                Manage chef menus, including courses, dishes, and ingredients.
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <DataTable.Search placeholder="Search menus..." />
              <DataTable.FilterMenu tooltip="Filter menus" />
              <DataTable.SortingMenu tooltip="Sort menus" />
              <Button 
                variant="primary" 
                size="base"
                onClick={() => setShowModal(true)}
                disabled={isLoading}
              >
                Create Menu
              </Button>
            </div>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </TooltipProvider>

      {showModal && (
        <MenuCreateModal 
          onClose={() => setShowModal(false)} 
          onSubmit={async (data) => {
            try {
              // We'll need to implement this in the SDK
              await sdk.admin.menus.create(data)
              const { menus: fetchedMenus } = await sdk.admin.menus.list()
              setMenus(fetchedMenus || [])
              setShowModal(false)
            } catch (error) {
              console.error("Error creating menu:", error)
            }
          }}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Menus"
})

export default MenusPage 