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
import EventCreateModal from "../../components/event-create-modal.js"
import { sdk } from "../../../sdk/index.js"
import { AdminChefEventDTO } from "../../../sdk/admin/admin-chef-events.js"

const columnHelper = createDataTableColumnHelper<AdminChefEventDTO>()
const filterHelper = createDataTableFilterHelper<AdminChefEventDTO>()

const columns = [
  columnHelper.accessor("requestedDate", {
    header: "Date",
    cell: ({ getValue }) => {
      return new Date(getValue()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    enableSorting: true,
    sortLabel: "Date"
  }),
  columnHelper.accessor("requestedTime", {
    header: "Time",
    cell: ({ getValue }) => {
      return new Date(`2000-01-01T${getValue()}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }),
  columnHelper.accessor("eventType", {
    header: "Type",
    cell: ({ getValue }) => {
      const eventType = getValue()
      const eventTypeMap = {
        cooking_class: "Chef's Cooking Class",
        plated_dinner: 'Plated Dinner Service',
        buffet_style: 'Buffet Style Service',
        custom: 'Custom Event'
      }
      return eventTypeMap[eventType] || eventType
    },
    enableSorting: true,
    sortLabel: "Event Type"
  }),
  columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
    id: "customerName",
    header: "Customer",
    enableSorting: true,
    sortLabel: "Customer Name"
  }),
  columnHelper.accessor("partySize", {
    header: "Party Size",
    enableSorting: true,
    sortLabel: "Party Size"
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue()
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'confirmed':
            return 'green'
          case 'pending':
            return 'orange'
          case 'cancelled':
            return 'red'
          case 'completed':
            return 'blue'
          default:
            return 'gray'
        }
      }
      return (
        <Badge color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
    enableSorting: true,
    sortLabel: "Status"
  })
]

const filters = [
  filterHelper.accessor("eventType", {
    type: "select",
    label: "Event Type",
    options: [
      { label: "Cooking Class", value: "cooking_class" },
      { label: "Plated Dinner", value: "plated_dinner" },
      { label: "Buffet Style", value: "buffet_style" },
      { label: "Custom Event", value: "custom" }
    ]
  }),
  filterHelper.accessor("status", {
    type: "select",
    label: "Status",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Confirmed", value: "confirmed" },
      { label: "Cancelled", value: "cancelled" },
      { label: "Completed", value: "completed" }
    ]
  }),
  filterHelper.accessor("requestedDate", {
    type: "date",
    label: "Event Date",
    format: "date",
    formatDateValue: (date) => date.toLocaleDateString(),
    rangeOptionLabel: "Date Range",
    rangeOptionStartLabel: "From",
    rangeOptionEndLabel: "To",
    options: [
      {
        label: "Today",
        value: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)).toString(),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)).toString()
        }
      },
      {
        label: "Next 7 Days",
        value: {
          $gte: new Date().toString(),
          $lte: new Date(new Date().setDate(new Date().getDate() + 7)).toString()
        }
      },
      {
        label: "Next 30 Days",
        value: {
          $gte: new Date().toString(),
          $lte: new Date(new Date().setDate(new Date().getDate() + 30)).toString()
        }
      }
    ]
  })
]

const EventsPage = () => {
  const [showModal, setShowModal] = useState(false)
  const [events, setEvents] = useState<AdminChefEventDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: 10,
    pageIndex: 0
  })

  const [filtering, setFiltering] = useState<DataTableFilteringState>({})
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)
  const [search, setSearch] = useState("")

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(event => 
        event.firstName.toLowerCase().includes(searchLower) ||
        event.lastName.toLowerCase().includes(searchLower) ||
        event.eventType.toLowerCase().includes(searchLower)
      )
    }

    // Apply filters
    filtered = filtered.filter(event => {
      return Object.entries(filtering).every(([key, value]) => {
        if (!value) return true
        if (key === "requestedDate") {
          const date = new Date(event[key])
          const filterValue = value as any
          if (filterValue.$gte) {
            if (date < new Date(filterValue.$gte)) return false
          }
          if (filterValue.$lte) {
            if (date > new Date(filterValue.$lte)) return false
          }
          return true
        }
        if (Array.isArray(value)) {
          return value.includes(event[key])
        }
        return true
      })
    })

    // Apply sorting
    if (sorting) {
      filtered.sort((a, b) => {
        const aVal = sorting.id === "customerName" 
          ? `${a.firstName} ${a.lastName}`
          : a[sorting.id]
        const bVal = sorting.id === "customerName"
          ? `${b.firstName} ${b.lastName}`
          : b[sorting.id]
        
        if (aVal < bVal) return sorting.desc ? 1 : -1
        if (aVal > bVal) return sorting.desc ? -1 : 1
        return 0
      })
    }

    return filtered
  }, [events, filtering, sorting, search])

  // Apply pagination
  const paginatedEvents = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredEvents.slice(start, end)
  }, [filteredEvents, pagination])

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const { events: fetchedEvents } = await sdk.admin.chefEvents.list()
        setEvents(fetchedEvents || [])
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const table = useDataTable({
    columns,
    data: paginatedEvents,
    getRowId: (event) => event.id,
    rowCount: filteredEvents.length,
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
      window.location.href = `/app/events/${row.id}`
    }
  })

  return (
    <Container>
      <TooltipProvider>
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <Heading level="h1">Events</Heading>
              <Text className="text-gray-500">
                Manage chef events, including bookings, schedules, and customer requests.
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <DataTable.Search placeholder="Search events..." />
              <DataTable.FilterMenu tooltip="Filter events" />
              <DataTable.SortingMenu tooltip="Sort events" />
              <Button 
                variant="primary" 
                size="base"
                onClick={() => setShowModal(true)}
                disabled={isLoading}
              >
                Create Event
              </Button>
            </div>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </TooltipProvider>

      {showModal && (
        <EventCreateModal 
          onClose={() => setShowModal(false)} 
          onSubmit={async (data) => {
            try {
              // ... existing event creation logic ...
              const { events: fetchedEvents } = await sdk.admin.chefEvents.list()
              setEvents(fetchedEvents || [])
              setShowModal(false)
            } catch (error) {
              console.error("Error creating event:", error)
            }
          }}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Events"
})

export default EventsPage 