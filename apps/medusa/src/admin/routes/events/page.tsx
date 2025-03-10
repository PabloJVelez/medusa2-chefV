import React, { useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import EventCreateModal from "./components/event-create-modal.js"
//import { useNavigate } from "react-router-dom"

const EventsPage = () => {
  const [showModal, setShowModal] = useState(false)
  //const navigate = useNavigate()

  return (
    <Container>
      <Heading level="h1" className="mb-4">Events</Heading>
      
      <Button 
        variant="primary" 
        size="base"
        onClick={() => setShowModal(true)}
        className="mb-6"
      >
        Create Event
      </Button>
      
      <Text className="text-gray-500 mb-6">
        Manage chef events, including bookings, schedules, and customer requests.
      </Text>
      
      {/* Placeholder for events table - will be implemented in Phase 4 */}
      <Text className="text-gray-400 text-center py-12">
        Events list will be displayed here in a future implementation.
      </Text>

      {showModal && <EventCreateModal onClose={() => setShowModal(false)} />}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Events"
})

export default EventsPage 