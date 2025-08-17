import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, FocusModal, toast } from "@medusajs/ui"
import { ChefEventList } from "./components/chef-event-list"
import { ChefEventCalendar } from "./components/chef-event-calendar"
import { ChefEventForm } from "./components/chef-event-form"
import { useAdminCreateChefEventMutation } from "../../hooks/chef-events"
import { useState } from "react"
import type { AdminCreateChefEventDTO } from "../../../sdk/admin/admin-chef-events"

const ChefEventsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  // Default to calendar view
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar')
  const createChefEvent = useAdminCreateChefEventMutation()

  const handleCreateChefEvent = async (data: any) => {
    try {
      await createChefEvent.mutateAsync(data)
      setShowCreateModal(false)
      toast.success("Chef Event Created", {
        description: "The chef event has been created successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error creating chef event:", error)
      toast.error("Creation Failed", {
        description: "There was an error creating the chef event. Please try again.",
        duration: 5000,
      })
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Chef Events</Heading>
      </div>

      {currentView === 'list' ? (
        <ChefEventList
          onCreateEvent={() => setShowCreateModal(true)}
          onViewChange={setCurrentView}
          currentView={currentView}
        />
      ) : (
        <ChefEventCalendar
          onCreateEvent={() => setShowCreateModal(true)}
          onViewChange={setCurrentView}
          currentView={currentView}
        />
      )}

      {showCreateModal && (
        <FocusModal open onOpenChange={setShowCreateModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Create Chef Event</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <ChefEventForm
                onSubmit={handleCreateChefEvent}
                isLoading={createChefEvent.isPending}
                onCancel={() => setShowCreateModal(false)}
              />
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Chef Events",
})

export default ChefEventsPage
