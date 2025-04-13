import { useParams } from "react-router-dom"
import { Container, Heading, Button } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const EventDetailPage = () => {
  const { id } = useParams()

  return (
    <Container className="flex items-center justify-between px-6 py-4 divide-y p-0">
        <Heading level="h1">Event Details: {id}</Heading>
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => {
            window.location.href = "/app/events"
          }}
        >
          Back to Events
        </Button>
    </Container>
  )
}

export default EventDetailPage

