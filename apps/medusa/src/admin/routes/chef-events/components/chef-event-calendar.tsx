import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Button,
  Badge,
  Container,
  DropdownMenu,
  IconButton,
  toast,
  Text,
  Heading,
  FocusModal,
  Input
} from "@medusajs/ui"
import {
  ChevronLeft,
  ChevronRight,
  EllipsisHorizontal,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  PencilSquare,
  Trash
} from "@medusajs/icons"
import { Link } from "react-router-dom"
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  format,
  parse,
  eachDayOfInterval
} from "date-fns"

import { useAdminListChefEvents, useAdminDeleteChefEventMutation } from "../../../hooks/chef-events"
import { eventTypeOptions, locationTypeOptions } from "../schemas"
import type { AdminChefEventDTO } from "../../../../sdk/admin/admin-chef-events"

interface ChefEventCalendarProps {
  onCreateEvent: () => void
  onViewChange: (view: 'calendar' | 'list') => void
  currentView: 'calendar' | 'list'
}

const getStatusDotClass = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-green-500"
    case "pending": return "bg-orange-500"
    case "cancelled": return "bg-red-500"
    case "completed": return "bg-blue-500"
    default: return "bg-gray-500"
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'pending': return 'orange'
    case 'confirmed': return 'green'
    case 'cancelled': return 'red'
    case 'completed': return 'blue'
    default: return 'grey'
  }
}

const getEventTypeLabel = (eventType: string) =>
  eventTypeOptions.find(o => o.value === eventType)?.label || eventType

const getLocationTypeLabel = (locationType: string) =>
  locationTypeOptions.find(o => o.value === locationType)?.label || locationType

// Parse "HH:mm" -> minutes since midnight for sorting
const timeToMinutes = (time: string | undefined | null) => {
  if (!time) return 24 * 60 // push to bottom if missing
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export const ChefEventCalendar = ({ onCreateEvent, onViewChange, currentView }: ChefEventCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<AdminChefEventDTO | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  const [filters] = useState({
    q: "",
    status: "",
    eventType: "",
    locationType: "",
    limit: 1000,
    offset: 0
  })

  const { data, isLoading, refetch } = useAdminListChefEvents(filters)
  const deleteChefEvent = useAdminDeleteChefEventMutation()
  const chefEvents = data?.chefEvents || []

  // Google-like 6-week month grid covering leading & trailing days
  const gridStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // Group events by date key: YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, AdminChefEventDTO[]> = {}
    for (const e of chefEvents) {
      const key = format(new Date(e.requestedDate), "yyyy-MM-dd")
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(e)
    }
    // Sort within the day by time, then name
    Object.values(grouped).forEach(bucket =>
      bucket.sort((a, b) => {
        const t = timeToMinutes(a.requestedTime) - timeToMinutes(b.requestedTime)
        return t !== 0 ? t : (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
      })
    )
    return grouped
  }, [chefEvents])

  const monthLabel = format(currentDate, "MMMM yyyy")
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const goMonth = (delta: number) => setCurrentDate(d => addMonths(d, delta))
  const goToday = () => setCurrentDate(new Date())

  const handleEventClick = (event: AdminChefEventDTO) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleDeleteEvent = async (id: string, customerName: string) => {
    if (!window.confirm(`Delete the event for ${customerName}?`)) return
    try {
      await deleteChefEvent.mutateAsync(id)
      toast.success("Event Deleted", {
        description: `Chef event for ${customerName} has been deleted.`,
        duration: 3000,
      })
      setShowEventModal(false)
      setSelectedEvent(null)
      refetch()
    } catch (err) {
      console.error(err)
      toast.error("Deletion Failed", {
        description: "There was an error deleting the chef event. Please try again.",
        duration: 5000,
      })
    }
  }

  // Keyboard shortcuts like Google: ←/→ PgUp/PgDn T
  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "PageUp") goMonth(-1)
    else if (e.key === "ArrowRight" || e.key === "PageDown") goMonth(1)
    else if (e.key.toLowerCase() === "t") goToday()
  }, [])
  useEffect(() => {
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onKey])

  const MonthPicker = () => (
    <Input
      type="month"
      className="w-[10.5rem]"
      value={format(currentDate, "yyyy-MM")}
      onChange={(e) => {
        const d = parse(e.target.value + "-01", "yyyy-MM-dd", new Date())
        setCurrentDate(d)
      }}
    />
  )

  return (
    <>
      <Container className="p-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-[var(--bg-base)] z-[1]">
          <div className="flex items-center gap-2">
            <Button variant="transparent" size="small" onClick={() => goMonth(-1)} aria-label="Previous month">
              <ChevronLeft />
            </Button>
            <Button variant="transparent" size="small" onClick={goToday}>
              Today
            </Button>
            <Button variant="transparent" size="small" onClick={() => goMonth(1)} aria-label="Next month">
              <ChevronRight />
            </Button>

            <Heading level="h2" className="text-lg font-semibold ml-1">{monthLabel}</Heading>
            <div className="ml-3 hidden md:block">
              <MonthPicker />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'calendar' ? 'primary' : 'transparent'}
              size="small"
              onClick={() => onViewChange('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Month
            </Button>
            <Button
              variant={currentView === 'list' ? 'primary' : 'transparent'}
              size="small"
              onClick={() => onViewChange('list')}
            >
              <EllipsisHorizontal className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button onClick={onCreateEvent}>Create</Button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="px-4 pt-3">
          <div className="grid grid-cols-7 text-center text-xs text-gray-400 sticky top-[3.25rem] bg-[var(--bg-base)] z-[1]">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="pb-2">{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-[1px] bg-gray-700 rounded-md overflow-hidden">
            {days.map((date) => {
              const key = format(date, "yyyy-MM-dd")
              const inMonth = isSameMonth(date, currentDate)
              const today = isSameDay(date, new Date())
              const dayEvents = eventsByDate[key] || []
              const visible = dayEvents.slice(0, 3)
              const extra = Math.max(0, dayEvents.length - visible.length)

              return (
                <div
                  key={key}
                  className={`min-h-28 bg-gray-900 p-1 border border-gray-700/50 hover:border-gray-500 transition-colors
                    ${!inMonth ? "opacity-50" : ""}
                    ${today ? "ring-1 ring-blue-500" : ""}`}
                >
                  {/* date header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm leading-none px-[6px] py-[2px] rounded-full
                        ${today ? "bg-blue-600 text-white" : "text-gray-200"}`}
                      title={format(date, "PPPP")}
                    >
                      {format(date, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <Text className="text-[11px] text-gray-400">{dayEvents.length}</Text>
                    )}
                  </div>

                  {/* events */}
                  <div className="space-y-0.5 max-h-20 overflow-y-auto pr-0.5">
                    {visible.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        title={`${event.firstName} ${event.lastName} • ${getEventTypeLabel(event.eventType)} • ${event.requestedTime ?? ""}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusDotClass(event.status)}`} />
                          <span className="truncate font-medium text-white">
                            {event.requestedTime ? `${event.requestedTime} ` : ""}
                            {event.firstName} {event.lastName}
                          </span>
                        </div>
                        <div className="truncate text-[11px] text-gray-300">
                          {getEventTypeLabel(event.eventType)}
                        </div>
                      </button>
                    ))}
                    {extra > 0 && (
                      <button
                        className="w-full text-center text-[11px] text-gray-300 hover:text-white"
                        onClick={() => {
                          if (dayEvents[0]) handleEventClick(dayEvents[0])
                        }}
                      >
                        +{extra} more
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {isLoading && (
            <div className="text-center text-sm text-gray-400 py-6">Loading events…</div>
          )}
        </div>
      </Container>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <FocusModal open onOpenChange={setShowEventModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Event Details</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-sm font-medium text-gray-500">Customer</Text>
                    <Text className="text-base">
                      {selectedEvent.firstName} {selectedEvent.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">{selectedEvent.email}</Text>
                  </div>
                  <div>
                    <Text className="text-sm font-medium text-gray-500">Status</Text>
                    <Badge color={getStatusBadgeColor(selectedEvent.status)}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <Text className="text-sm font-medium text-gray-500">Date & Time</Text>
                      <Text className="text-base">
                        {format(new Date(selectedEvent.requestedDate), "PP")}{" "}
                        {selectedEvent.requestedTime ? `at ${selectedEvent.requestedTime}` : ""}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <Text className="text-sm font-medium text-gray-500">Party Size</Text>
                      <Text className="text-base">{selectedEvent.partySize} people</Text>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-sm font-medium text-gray-500">Event Type</Text>
                    <Text className="text-base">{getEventTypeLabel(selectedEvent.eventType)}</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <Text className="text-sm font-medium text-gray-500">Location</Text>
                      <Text className="text-base">{getLocationTypeLabel(selectedEvent.locationType)}</Text>
                    </div>
                  </div>
                </div>

                {selectedEvent.notes && (
                  <div>
                    <Text className="text-sm font-medium text-gray-500">Notes</Text>
                    <Text className="text-base whitespace-pre-wrap">{selectedEvent.notes}</Text>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Link to={`/chef-events/${selectedEvent.id}`}>
                    <Button variant="secondary" size="small">
                      <PencilSquare className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() =>
                      handleDeleteEvent(
                        selectedEvent.id,
                        `${selectedEvent.firstName} ${selectedEvent.lastName}`
                      )
                    }
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}
    </>
  )
}
