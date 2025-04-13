import { Container, Heading, Button, Text, Badge } from "@medusajs/ui"
import { sdk } from "../../../../sdk/index.js"
import { AdminChefEventDTO } from "../../../../sdk/admin/admin-chef-events.js"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

const EventDetailPage = () => {
  // Get the ID directly from the URL without using react-router-dom hooks
  const { id } = useParams()
  
  const [event, setEvent] = useState<AdminChefEventDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const { event: eventData } = await sdk.admin.chefEvents.retrieve(id)
        setEvent(eventData)
      } catch (err) {
        console.error("Error fetching event details:", err)
        setError("Failed to load event details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventDetails()
  }, [id])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'cooking_class':
        return "Chef's Cooking Class"
      case 'plated_dinner':
        return 'Plated Dinner Service'
      case 'buffet_style':
        return 'Buffet Style Service'
      case 'custom':
        return 'Custom Event'
      default:
        return eventType
    }
  }

  return (
    <Container className="flex flex-col gap-6">
      <Text className="flex justify-between items-center">
        <Heading level="h1">Event Details</Heading>
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => {
            window.location.href = "/app/events"
          }}
        >
          Back to Events
        </Button>
      </Text>

      {isLoading ? (
        <Text className="text-gray-400 text-center py-12">
          Loading event details...
        </Text>
      ) : error ? (
        <Text className="text-red-500 text-center py-12">
          {error}
        </Text>
      ) : event ? (
        <>
          <Text className="flex items-center justify-between">
            <Heading level="h2">{getEventTypeLabel(event.eventType)}</Heading>
            <Badge color={getStatusColor(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </Text>

          <Text className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Text className="bg-white p-6 rounded-lg border border-gray-200">
              <Heading level="h3" className="mb-4">Event Information</Heading>
              <Text className="space-y-3">
                <Text className="font-medium">Date: {formatDate(event.requestedDate)}</Text>
                <Text className="font-medium">Time: {formatTime(event.requestedTime)}</Text>
                <Text className="font-medium">Party Size: {event.partySize} guests</Text>
                <Text className="font-medium">
                  Location: {event.locationType === 'customer_location' ? 'Customer\'s Location' : 'Chef\'s Location'}
                </Text>
                {event.locationAddress && (
                  <Text className="font-medium">Address: {event.locationAddress}</Text>
                )}
                {event.estimatedDuration && (
                  <Text className="font-medium">Estimated Duration: {event.estimatedDuration} hours</Text>
                )}
                {event.totalPrice && (
                  <Text className="font-medium">Total Price: ${(event.totalPrice / 100).toFixed(2)}</Text>
                )}
                <Text className="font-medium">Deposit Paid: {event.depositPaid ? 'Yes' : 'No'}</Text>
              </Text>
            </Text>

            <Text className="bg-white p-6 rounded-lg border border-gray-200">
              <Heading level="h3" className="mb-4">Customer Information</Heading>
              <Text className="space-y-3">
                <Text className="font-medium">Name: {event.firstName} {event.lastName}</Text>
                <Text className="font-medium">Email: {event.email}</Text>
                {event.phone && (
                  <Text className="font-medium">Phone: {event.phone}</Text>
                )}
              </Text>
            </Text>
          </Text>

          {(event.notes || event.specialRequirements) && (
            <Text className="bg-white p-6 rounded-lg border border-gray-200">
              <Heading level="h3" className="mb-4">Additional Information</Heading>
              {event.notes && (
                <Text className="font-medium mb-4">Notes: {event.notes}</Text>
              )}
              {event.specialRequirements && (
                <Text className="font-medium">Special Requirements: {event.specialRequirements}</Text>
              )}
            </Text>
          )}

          <Text className="text-sm text-gray-500 space-y-1">
            <Text>Created: {new Date(event.createdAt).toLocaleString()}</Text>
            <Text>Last Updated: {new Date(event.updatedAt).toLocaleString()}</Text>
          </Text>
        </>
      ) : (
        <Text className="text-gray-400 text-center py-12">
          Event not found
        </Text>
      )}
    </Container>
  )
}


export default EventDetailPage

