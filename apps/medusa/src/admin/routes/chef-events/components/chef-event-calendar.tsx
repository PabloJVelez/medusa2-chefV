import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Button,
  Badge,
  Container,
  toast,
  Text,
  Heading,
  Input
} from "@medusajs/ui"
import {
  ChevronLeft,
  ChevronRight
} from "@medusajs/icons"
import { useNavigate } from "react-router-dom"
import { DateTime } from "luxon"

import { useAdminListChefEvents, useAdminDeleteChefEventMutation } from "../../../hooks/chef-events"
import { eventTypeOptions, locationTypeOptions } from "../schemas"
import type { AdminChefEventDTO } from "../../../../sdk/admin/admin-chef-events"

interface ChefEventCalendarProps {
  onCreateEvent: () => void
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

// Convert 24-hour time to 12-hour format
const formatTime12Hour = (time?: string | null) => {
  if (!time) return ""
  const [hours, minutes] = time.split(":").map(Number)
  if (hours === undefined || minutes === undefined) return time
  
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

const timeToMinutes = (time?: string | null) => {
  if (!time) return 24 * 60
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export const ChefEventCalendar = ({ onCreateEvent }: ChefEventCalendarProps) => {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())

  const [filters] = useState({
    q: "",
    status: "",
    eventType: "",
    locationType: "",
    limit: 1000,
    offset: 0
  })

  const { data, isLoading } = useAdminListChefEvents(filters)
  const chefEvents = data?.chefEvents || []

  // 6-week Google-like grid using Luxon
  const currentDateTime = DateTime.fromJSDate(currentDate)
  const monthStart = currentDateTime.startOf('month')
  const monthEnd = currentDateTime.endOf('month')
  const gridStart = monthStart.startOf('week')
  const gridEnd = monthEnd.endOf('week')
  
  const days: DateTime[] = []
  let currentDay = gridStart
  while (currentDay <= gridEnd) {
    days.push(currentDay)
    currentDay = currentDay.plus({ days: 1 })
  }

  // Group + sort events per day
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, AdminChefEventDTO[]> = {}
    for (const e of chefEvents) {
      const key = DateTime.fromJSDate(new Date(e.requestedDate)).toFormat('yyyy-MM-dd')
      ;(grouped[key] ||= []).push(e)
    }
    Object.values(grouped).forEach(bucket =>
      bucket.sort((a, b) => {
        const t = timeToMinutes(a.requestedTime) - timeToMinutes(b.requestedTime)
        return t !== 0 ? t : (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
      })
    )
    return grouped
  }, [chefEvents])

  const goMonth = (delta: number) => setCurrentDate(d => DateTime.fromJSDate(d).plus({ months: delta }).toJSDate())
  const goToday = () => setCurrentDate(new Date())
  const monthLabel = currentDateTime.toFormat('MMMM yyyy')

  const handleEventClick = (event: AdminChefEventDTO) => {
    // Navigate directly to the event details page
    navigate(`/chef-events/${event.id}`)
  }

  // keyboard shortcuts: ←/→ PgUp/PgDn T
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "PageUp") goMonth(-1)
      else if (e.key === "ArrowRight" || e.key === "PageDown") goMonth(1)
      else if (e.key.toLowerCase() === "t") goToday()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const MonthPicker = () => (
    <Input
      type="month"
      className="w-[10.5rem]"
      value={currentDateTime.toFormat("yyyy-MM")}
      onChange={(e) => {
        const d = DateTime.fromFormat(e.target.value + "-01", "yyyy-MM-dd").toJSDate()
        setCurrentDate(d)
      }}
    />
  )

  return (
    <>
      <Container className="p-0">
        {/* Toolbar (sticky) */}
        <div className="flex items-center justify-between px-6 py-3 border-b sticky top-0 z-[1]
                        bg-[var(--bg-base)] border-b-[var(--border-base)]">
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

            <Heading level="h2" className="text-lg font-semibold ml-1 text-[var(--fg-base)]">
              {monthLabel}
            </Heading>
            <div className="ml-3 hidden md:block">
              <MonthPicker />
            </div>
          </div>

                     <div className="flex items-center gap-2">
             <Button onClick={onCreateEvent}>Create</Button>
           </div>
        </div>

        {/* Day-of-week header (sticky) */}
        <div className="px-4 pt-3">
          <div className="grid grid-cols-7 text-center text-xs sticky top-[3.25rem] z-[1]
                          bg-[var(--bg-base)] text-[var(--fg-muted)]">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="pb-2">{d}</div>
            ))}
          </div>

                     {/* Month grid with theme tokens */}
           <div className="grid grid-cols-7 gap-[1px] rounded-md overflow-hidden bg-[var(--border-base)]">
             {days.map((date) => {
               const key = date.toFormat("yyyy-MM-dd")
               const inMonth = date.month === currentDateTime.month
               const today = date.hasSame(DateTime.now(), 'day')
               const dayEvents = eventsByDate[key] || []
               const visible = dayEvents.slice(0, 3)
               const extra = Math.max(0, dayEvents.length - visible.length)

               return (
                 <div
                   key={key}
                   className={[
                     "min-h-28 p-1 border transition-colors",
                     "bg-[var(--bg-subtle)] border-[var(--border-base)] hover:border-[var(--border-strong)]",
                     !inMonth ? "opacity-50" : "",
                     today ? "ring-1 ring-[var(--accent-base)]" : ""
                   ].join(" ")}
                 >
                   {/* date header */}
                   <div className="flex items-center justify-between mb-1">
                     <span
                       className={[
                         "text-sm leading-none px-[6px] py-[2px] rounded-full",
                         today
                           ? "bg-[var(--accent-base)] text-white"
                           : "text-[var(--fg-base)]"
                       ].join(" ")}
                       title={date.toFormat("EEEE, MMMM d, yyyy")}
                     >
                       {date.toFormat("d")}
                     </span>
                    {dayEvents.length > 0 && (
                      <Text className="text-[11px] text-[var(--fg-muted)]">{dayEvents.length}</Text>
                    )}
                  </div>

                                     {/* events */}
                   <div className="space-y-0.5 max-h-20 overflow-y-auto pr-0.5">
                     {visible.map((event, index) => (
                       <button
                         key={event.id}
                         onClick={() => handleEventClick(event)}
                         className={`w-full text-left text-xs rounded px-1.5 py-1 transition-colors
                                    bg-[var(--bg-elevated)] hover:bg-[var(--bg-base)]
                                    focus:outline-none focus:ring-1 focus:ring-[var(--accent-base)]
                                    ${index > 0 ? 'border-t border-[var(--border-base)] hover:border-[var(--border-strong)]' : ''}`}
                         title={`${event.firstName} ${event.lastName} • ${getEventTypeLabel(event.eventType)} • ${formatTime12Hour(event.requestedTime)}`}
                       >
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusDotClass(event.status)}`} />
                          <span className="truncate font-medium text-[var(--fg-base)]">
                            {event.requestedTime ? `${formatTime12Hour(event.requestedTime)} ` : ""}
                            {event.firstName} {event.lastName}
                          </span>
                        </div>
                        <div className="truncate text-[11px] text-[var(--fg-muted)]">
                          {getEventTypeLabel(event.eventType)}
                        </div>
                      </button>
                    ))}
                    {extra > 0 && (
                      <button
                        className="w-full text-center text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg-base)]"
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
            <div className="text-center text-sm text-[var(--fg-muted)] py-6">Loading events…</div>
          )}
        </div>
            </Container>
    </>
  )
}
