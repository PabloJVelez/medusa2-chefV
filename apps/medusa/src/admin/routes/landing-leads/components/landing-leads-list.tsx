import { useState, useMemo } from "react"
import { 
  DataTable,
  createDataTableColumnHelper,
  useDataTable,
  Button, 
  Input, 
  Select,
  Badge,
  toast,
  type DataTablePaginationState,
} from "@medusajs/ui"
import { 
  useAdminListLandingLeads, 
  useAdminUpdateLandingLeadMutation,
  useAdminDeleteLandingLeadMutation,
  type LandingLead 
} from "../../../hooks/landing-leads.js"

const columnHelper = createDataTableColumnHelper<LandingLead>()

interface LandingLeadsListProps {}

export const LandingLeadsList = ({}: LandingLeadsListProps) => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  
  const [query, setQuery] = useState({ 
    q: "",
    status: "",
    source: ""
  })
  
  const queryWithPagination = useMemo(() => ({
    ...query,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  }), [query, pagination])
  
  const { data, isLoading, error } = useAdminListLandingLeads(queryWithPagination)
  const updateLead = useAdminUpdateLandingLeadMutation()
  const deleteLead = useAdminDeleteLandingLeadMutation()

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "orange",
      contacted: "blue", 
      qualified: "green",
      converted: "green",
      unsubscribed: "red",
      spam: "red"
    } as const

    return (
      <Badge color={variants[status as keyof typeof variants] || "grey"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLead.mutateAsync({ 
        id: leadId, 
        data: { status: newStatus as any } 
      })
      toast.success("Lead updated", {
        description: "Lead status has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast.error("Update failed", {
        description: "There was an error updating the lead. Please try again.",
        duration: 5000,
      })
    }
  }

  const handleDelete = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      await deleteLead.mutateAsync(leadId)
      toast.success("Lead deleted", {
        description: "The lead has been deleted successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast.error("Delete failed", {
        description: "There was an error deleting the lead. Please try again.",
        duration: 5000,
      })
    }
  }

  const columns = [
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.original.email}</span>
          {row.original.firstName && (
            <span className="text-sm text-gray-500">
              ({row.original.firstName})
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("source", {
      header: "Source",
      cell: ({ row }) => (
        <Badge color="grey" className="capitalize">
          {row.original.source}
        </Badge>
      ),
    }),
    columnHelper.accessor("utmCampaign", {
      header: "Campaign",
      cell: ({ row }) => row.original.utmCampaign || "-",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),
    columnHelper.accessor("followUpCount", {
      header: "Follow-ups",
      cell: ({ row }) => (
        <Badge color={row.original.followUpCount > 0 ? "blue" : "grey"}>
          {row.original.followUpCount}
        </Badge>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    }),
    columnHelper.action({
      actions: ({ row }) => [
        {
          icon: "Eye",
          label: "View Details",
          onClick: () => {
            window.location.href = `/app/landing-leads/${row.original.id}`
          },
        },
        {
          icon: "Mail",
          label: "Mark as Contacted",
          onClick: () => {
            if (row.original.status !== "contacted") {
              handleStatusChange(row.original.id, "contacted")
            }
          },
          disabled: row.original.status === "contacted",
        },
        {
          icon: "Phone",
          label: "Mark as Qualified",
          onClick: () => {
            if (row.original.status !== "qualified") {
              handleStatusChange(row.original.id, "qualified")
            }
          },
          disabled: row.original.status === "qualified",
        },
        {
          icon: "ExternalLink",
          label: "Mark as Converted",
          onClick: () => {
            if (row.original.status !== "converted") {
              handleStatusChange(row.original.id, "converted")
            }
          },
          disabled: row.original.status === "converted",
        },
        {
          icon: "Trash",
          label: "Delete",
          onClick: () => handleDelete(row.original.id),
        },
      ],
    }),
  ]

  const handleSearch = (value: string) => {
    setQuery(prev => ({ ...prev, q: value }))
    setPagination({ ...pagination, pageIndex: 0 })
  }

  const handleStatusFilter = (value: string) => {
    setQuery(prev => ({ ...prev, status: value }))
    setPagination({ ...pagination, pageIndex: 0 })
  }

  const handleSourceFilter = (value: string) => {
    setQuery(prev => ({ ...prev, source: value }))
    setPagination({ ...pagination, pageIndex: 0 })
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">
          Error loading leads: {error instanceof Error ? error.message : String(error)}
        </p>
        <pre className="mt-4 text-xs text-left bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }

  const tableData = data?.leads || []

  const table = useDataTable({
    columns,
    data: tableData,
    getRowId: (row) => row.id,
    rowCount: data?.count ?? 0,
    isLoading,
    search: {
      state: query.q,
      onSearchChange: (q) => {
        setQuery({ ...query, q })
        setPagination({ ...pagination, pageIndex: 0 })
      },
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <Input
            placeholder="Search by email, name, or campaign..."
            value={query.q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <Select value={query.status || undefined} onValueChange={handleStatusFilter}>
          <Select.Trigger className="w-[150px]">
            <Select.Value placeholder="All Statuses" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="new">New</Select.Item>
            <Select.Item value="contacted">Contacted</Select.Item>
            <Select.Item value="qualified">Qualified</Select.Item>
            <Select.Item value="converted">Converted</Select.Item>
            <Select.Item value="unsubscribed">Unsubscribed</Select.Item>
            <Select.Item value="spam">Spam</Select.Item>
          </Select.Content>
        </Select>

        <Select value={query.source || undefined} onValueChange={handleSourceFilter}>
          <Select.Trigger className="w-[150px]">
            <Select.Value placeholder="All Sources" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="landing_page">Landing Page</Select.Item>
            <Select.Item value="newsletter">Newsletter</Select.Item>
            <Select.Item value="facebook">Facebook</Select.Item>
            <Select.Item value="google">Google</Select.Item>
            <Select.Item value="instagram">Instagram</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </div>
  )
}
