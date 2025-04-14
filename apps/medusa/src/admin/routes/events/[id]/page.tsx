import { Container, Heading, Button, Text, Badge, Input, Select, Textarea, Toaster } from "@medusajs/ui"
import { sdk } from "../../../../sdk/index.js"
import { AdminChefEventDTO } from "../../../../sdk/admin/admin-chef-events.js"
import { useState, useEffect, type HTMLAttributes } from "react"
import { useParams } from "react-router-dom"
import { TooltipProvider } from "@medusajs/ui"

interface EventDetailsPageProps extends HTMLAttributes<HTMLDivElement> {}

const EventDetailPage = ({}: EventDetailsPageProps) => {
  const { id } = useParams()
  
  const [event, setEvent] = useState<AdminChefEventDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedEvent, setEditedEvent] = useState<Partial<AdminChefEventDTO>>({})

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
        setEditedEvent(eventData)
      } catch (err) {
        console.error("Error fetching event details:", err)
        setError("Failed to load event details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventDetails()
  }, [id])

  const handleSave = async () => {
    if (!id || !editedEvent) return

    setIsSaving(true)
    setError(null)

    try {
      const { event: updatedEvent } = await sdk.admin.chefEvents.update(id, editedEvent)
      setEvent(updatedEvent)
      setEditedEvent(updatedEvent)
      setIsEditing(false)
    } catch (err) {
      console.error("Error updating event:", err)
      setError("Failed to update event. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: AdminChefEventDTO['status']) => {
    if (!id) return

    setIsSaving(true)
    setError(null)

    try {
      const { event: updatedEvent } = await sdk.admin.chefEvents.updateStatus(id, newStatus)
      setEvent(updatedEvent)
      setEditedEvent(updatedEvent)
    } catch (err) {
      console.error("Error updating event status:", err)
      setError("Failed to update event status. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

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

  const handleInputChange = (field: keyof AdminChefEventDTO, value: any) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const minutesToHours = (minutes: number): number => {
    return minutes / 60
  }

  const hoursToMinutes = (hours: number): number => {
    return hours * 60
  }

  const handleDurationChange = (hours: string) => {
    const minutes = hoursToMinutes(parseFloat(hours))
    handleInputChange("estimatedDuration", minutes)
  }

  return (
    <Container>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Heading>Event Details</Heading>
          <Button
            variant={isEditing ? "secondary" : "primary"}
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            {isEditing ? "Cancel" : "Edit Event"}
          </Button>
        </div>

        {isLoading ? (
          <Text className="text-gray-400 text-center py-12">
            Loading event details...
          </Text>
        ) : error ? (
          <Text className="text-red-500 text-center py-12">
            {error}
          </Text>
        ) : event ? (
          <div className="flex flex-col gap-6">
            <div className="w-fit">
              <Badge color={getStatusColor(event.status)}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Event Information</Heading>
                  <Select
                    value={editedEvent.eventType}
                    onValueChange={(value) => handleInputChange("eventType", value)}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select event type" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="cooking_class">Chef's Cooking Class</Select.Item>
                      <Select.Item value="plated_dinner">Plated Dinner Service</Select.Item>
                      <Select.Item value="buffet_style">Buffet Style Service</Select.Item>
                      <Select.Item value="custom">Custom Event</Select.Item>
                    </Select.Content>
                  </Select>
                  <Input
                    type="date"
                    label="Date"
                    value={editedEvent.requestedDate?.split('T')[0]}
                    onChange={(e) => handleInputChange("requestedDate", e.target.value)}
                  />
                  <Input
                    type="time"
                    label="Time"
                    value={editedEvent.requestedTime}
                    onChange={(e) => handleInputChange("requestedTime", e.target.value)}
                  />
                  <Input
                    type="number"
                    label="Party Size"
                    value={editedEvent.partySize}
                    onChange={(e) => handleInputChange("partySize", parseInt(e.target.value))}
                  />
                  <Select
                    value={editedEvent.locationType}
                    onValueChange={(value) => handleInputChange("locationType", value)}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select location type" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="customer_location">Customer's Location</Select.Item>
                      <Select.Item value="chef_location">Chef's Location</Select.Item>
                    </Select.Content>
                  </Select>
                  {editedEvent.locationType === 'customer_location' && (
                    <Input
                      label="Address"
                      value={editedEvent.locationAddress}
                      onChange={(e) => handleInputChange("locationAddress", e.target.value)}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Customer Information</Heading>
                  <Input
                    label="First Name"
                    value={editedEvent.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                  <Input
                    label="Last Name"
                    value={editedEvent.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                  <Input
                    type="email"
                    label="Email"
                    value={editedEvent.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  <Input
                    type="tel"
                    label="Phone"
                    value={editedEvent.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Additional Information</Heading>
                  <Input
                    type="number"
                    label="Total Price ($)"
                    value={editedEvent.totalPrice ? editedEvent.totalPrice / 100 : ''}
                    onChange={(e) => handleInputChange("totalPrice", Math.round(parseFloat(e.target.value) * 100))}
                  />
                  <Select
                    value={editedEvent.depositPaid ? "true" : "false"}
                    onValueChange={(value) => handleInputChange("depositPaid", value === "true")}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Deposit status" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="true">Paid</Select.Item>
                      <Select.Item value="false">Not Paid</Select.Item>
                    </Select.Content>
                  </Select>
                  <Input
                    type="number"
                    label="Estimated Duration"
                    placeholder="Enter duration in hours"
                    value={editedEvent.estimatedDuration ? minutesToHours(editedEvent.estimatedDuration) : ''}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    min={0}
                    step={0.5}
                  />
                  <Text className="text-xs text-gray-500 -mt-3">
                    Please enter the estimated duration in hours (e.g., 2.5 for 2 hours and 30 minutes)
                  </Text>
                  <Textarea
                    label="Notes"
                    value={editedEvent.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add notes"
                    rows={4}
                  />
                  <Textarea
                    label="Special Requirements"
                    value={editedEvent.specialRequirements}
                    onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                    placeholder="Add special requirements"
                    rows={4}
                  />
                </div>

                <div className="mt-4">
                  <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Event Information</Heading>
                  <Text className="text-gray-900">Event Type: {getEventTypeLabel(event.eventType)}</Text>
                  <Text className="text-gray-900">Date: {formatDate(event.requestedDate)}</Text>
                  <Text className="text-gray-900">Time: {formatTime(event.requestedTime)}</Text>
                  <Text className="text-gray-900">Party Size: {event.partySize} guests</Text>
                  <Text className="text-gray-900">Location: {event.locationType === 'customer_location' ? 'Customer\'s Location' : 'Chef\'s Location'}</Text>
                  {event.locationAddress && <Text className="text-gray-900">Address: {event.locationAddress}</Text>}
                </div>

                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Customer Information</Heading>
                  <Text className="text-gray-900">Customer: {event.firstName} {event.lastName}</Text>
                  <Text className="text-gray-900">Email: {event.email}</Text>
                  {event.phone && <Text className="text-gray-900">Phone: {event.phone}</Text>}
                </div>

                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Additional Information</Heading>
                  {event.totalPrice && <Text className="text-gray-900">Total Price: ${(event.totalPrice / 100).toFixed(2)}</Text>}
                  <Text className="text-gray-900">Deposit Paid: {event.depositPaid ? 'Yes' : 'No'}</Text>
                  {event.estimatedDuration && (
                    <Text className="text-gray-900">
                      Estimated Duration: {minutesToHours(event.estimatedDuration).toFixed(1)} hours
                    </Text>
                  )}
                  {event.notes && <Text className="text-gray-900">Notes: {event.notes}</Text>}
                  {event.specialRequirements && <Text className="text-gray-900">Special Requirements: {event.specialRequirements}</Text>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Text className="text-gray-400 text-center py-12">
            Event not found
          </Text>
        )}
        <Toaster />
      </div>
    </Container>
  )
}

export default EventDetailPage

