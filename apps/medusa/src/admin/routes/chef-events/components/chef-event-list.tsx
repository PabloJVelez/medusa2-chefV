import { useState } from "react"
import { 
  Table, 
  Button, 
  Badge, 
  Input, 
  Select, 
  Container,
  DropdownMenu,
  IconButton,
  toast
} from "@medusajs/ui"
import { PencilSquare, Trash, EllipsisHorizontal, Calendar } from "@medusajs/icons"
import { useAdminListChefEvents, useAdminDeleteChefEventMutation } from "../../../hooks/chef-events"
import { eventTypeOptions, locationTypeOptions, statusOptions } from "../schemas"
import { Link } from "react-router-dom"

interface ChefEventListProps {
  onCreateEvent: () => void
  onViewChange: (view: 'calendar' | 'list') => void
  currentView: 'calendar' | 'list'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (date: Date, time: string) => {
  return `${formatDate(date)} at ${time}`
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'orange'
    case 'confirmed':
      return 'green'
    case 'cancelled':
      return 'red'
    case 'completed':
      return 'blue'
    default:
      return 'grey'
  }
}

const getEventTypeLabel = (eventType: string) => {
  return eventTypeOptions.find(option => option.value === eventType)?.label || eventType
}

const getLocationTypeLabel = (locationType: string) => {
  return locationTypeOptions.find(option => option.value === locationType)?.label || locationType
}

export const ChefEventList = ({ onCreateEvent, onViewChange, currentView }: ChefEventListProps) => {
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    eventType: '',
    locationType: '',
    limit: 20,
    offset: 0
  })

  const { data, isLoading, refetch } = useAdminListChefEvents(filters)
  const deleteChefEvent = useAdminDeleteChefEventMutation()

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset to first page when filtering
    }))
  }

  const handleDeleteEvent = async (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the chef event for ${customerName}?`)) {
      try {
        await deleteChefEvent.mutateAsync(id)
        toast.success("Event Deleted", {
          description: `Chef event for ${customerName} has been deleted successfully.`,
          duration: 3000,
        })
        refetch()
      } catch (error) {
        console.error("Error deleting chef event:", error)
        toast.error("Deletion Failed", {
          description: "There was an error deleting the chef event. Please try again.",
          duration: 5000,
        })
      }
    }
  }

  const chefEvents = data?.chefEvents || []
  const count = data?.count || 0

  return (
    <Container className="p-0">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search by customer name or email..."
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="w-64"
          />
          
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
          >
            <Select.Trigger className="w-32">
              <Select.Value placeholder="Status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Status</Select.Item>
              {statusOptions.map(option => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Select
            value={filters.eventType || 'all'}
            onValueChange={(value) => handleFilterChange('eventType', value === 'all' ? '' : value)}
          >
            <Select.Trigger className="w-40">
              <Select.Value placeholder="Event Type" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Types</Select.Item>
              {eventTypeOptions.map(option => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Select
            value={filters.locationType || 'all'}
            onValueChange={(value) => handleFilterChange('locationType', value === 'all' ? '' : value)}
          >
            <Select.Trigger className="w-36">
              <Select.Value placeholder="Location" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Locations</Select.Item>
              {locationTypeOptions.map(option => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === 'calendar' ? 'primary' : 'transparent'}
            size="small"
            onClick={() => onViewChange('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
                      <Button
              variant={currentView === 'list' ? 'primary' : 'transparent'}
              size="small"
              onClick={() => onViewChange('list')}
            >
              <EllipsisHorizontal className="w-4 h-4 mr-2" />
              List
            </Button>
          <Button onClick={onCreateEvent}>
            Create Chef Event
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Event Date & Time</Table.HeaderCell>
              <Table.HeaderCell>Event Type</Table.HeaderCell>
              <Table.HeaderCell>Party Size</Table.HeaderCell>
              <Table.HeaderCell>Menu Template</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Location</Table.HeaderCell>
              <Table.HeaderCell>Created</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell className="text-center py-12">
                  Loading chef events...
                </Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
            ) : chefEvents.length === 0 ? (
              <Table.Row>
                <Table.Cell className="text-center py-12">
                  No chef events found
                </Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
            ) : (
              chefEvents.map((event: any) => (
                <Table.Row key={event.id}>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">
                        {event.firstName} {event.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.email}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDateTime(event.requestedDate, event.requestedTime)}
                  </Table.Cell>
                  <Table.Cell>
                    {getEventTypeLabel(event.eventType)}
                  </Table.Cell>
                  <Table.Cell>
                    {event.partySize} {event.partySize === 1 ? 'person' : 'people'}
                  </Table.Cell>
                  <Table.Cell>
                    {event.templateProductId ? (
                      <span className="text-sm text-gray-600">Menu linked</span>
                    ) : (
                      <span className="text-sm text-gray-400">No menu</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusBadgeColor(event.status)}>
                      {statusOptions.find(s => s.value === event.status)?.label || event.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {getLocationTypeLabel(event.locationType)}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(event.createdAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <IconButton variant="transparent">
                          <EllipsisHorizontal className="h-4 w-4" />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item asChild>
                          <Link 
                            to={`/chef-events/${event.id}`}
                            className="flex items-center space-x-2"
                          >
                            <PencilSquare className="h-4 w-4" />
                            <span>Edit Event</span>
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item 
                          onClick={() => handleDeleteEvent(event.id, `${event.firstName} ${event.lastName}`)}
                          className="flex items-center space-x-2 text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                          <span>Delete Event</span>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Pagination */}
      {count > filters.limit && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, count)} of {count} events
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={filters.offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={filters.offset + filters.limit >= count}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
} 