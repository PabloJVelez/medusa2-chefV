import React, { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Table, Badge } from "@medusajs/ui"
import EventCreateModal from "./components/event-create-modal.js"
import { sdk } from "../../../sdk/index.js"
import { AdminChefEventDTO } from "../../../sdk/admin/admin-chef-events.js"
//import { useNavigate } from "react-router-dom"

const EventsPage = () => {
  const [showModal, setShowModal] = useState(false)
  const [menuProducts, setMenuProducts] = useState<Array<{ id: string, title: string }>>([])
  const [events, setEvents] = useState<AdminChefEventDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  
  
  //const navigate = useNavigate()

  // Fetch available menu products when the page loads
  useEffect(() => {
    const fetchMenuProducts = async () => {
      console.log("FETCHING THE MENU PRODUCTS")
      setIsLoading(true)
      try {
        // Use our extended SDK to fetch menu products
        const { products } = await sdk.admin.chefEvents.getMenuProducts()
        //Filter out products that are not menu products
        //const menuProducts = products.filter((product) => product.)
        setMenuProducts(menuProducts || [])
      } catch (error) {
        console.error("Error fetching menu products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuProducts()
  }, [sdk.admin.chefEvents])

  // Fetch events when the page loads
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true)
      try {
        // Use our extended SDK to fetch events
        console.log("FETCHING THE EVENTS")
        const { events: fetchedEvents } = await sdk.admin.chefEvents.list()
        console.log("FETCHED THE EVENTS", fetchedEvents)
        setEvents(fetchedEvents || [])
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [sdk.admin.chefEvents])

  const getProductType = async (): Promise<string> => {
    const { product_types } = await sdk.admin.productType.list()
    const eventType = product_types.find((type) => type.value === "event")
    if (!eventType) {
      throw new Error("Event product type not found")
    }
    return eventType.id
  }

  const handleCreateEvent = async (data: any) => {
    try {
      
      // Get the event product type
      const eventTypeId = await getProductType()

      const eventTypeMap = {
        cooking_class: "Chef's Cooking Class",
        plated_dinner: "Plated Dinner Service",
        buffet_style: "Buffet Style Service"
      }

      // Format date and time
      const formattedDate = new Date(data.requestedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const formattedTime = new Date(`2000-01-01T${data.requestedTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })

      // Create the product with event data
      await sdk.admin.product.create({
        title: `${eventTypeMap[data.eventType]} - ${formattedDate}`,
        description: `
Event Details:
• Date: ${formattedDate}
• Time: ${formattedTime}
• Type: ${eventTypeMap[data.eventType]}
• Location: ${data.locationType === 'customer_location' ? 'at Customer\'s Location' : 'at Chef\'s Location'}
${data.locationAddress ? `• Address: ${data.locationAddress}` : ''}
• Party Size: ${data.partySize} guests
• Total Price: ${data.totalPrice / 100} USD
        `.trim(),
        status: "published",
        options: [{
          title: "Event Type",
          values: ["Chef Event"]
        }],
        variants: [{
          title: 'Chef Event Ticket',
          manage_inventory: true,
          allow_backorder: false,
          sku: `EVENT-${Date.now()}`,
          prices: [{
            amount: data.totalPrice / data.partySize,
            currency_code: "usd"
          }]
        }],
        type_id: eventTypeId,
        metadata: {
          event_type: data.eventType,
          event_date: data.requestedDate,
          event_time: data.requestedTime,
          party_size: data.partySize,
          is_event_product: true
        },
        additional_data: {
          chefEvent: {
            status: "pending",
            requestedDate: data.requestedDate,
            requestedTime: data.requestedTime,
            partySize: data.partySize,
            eventType: data.eventType,
            locationType: data.locationType,
            locationAddress: data.locationAddress,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
            totalPrice: data.totalPrice,
            depositPaid: data.depositPaid,
            specialRequirements: data.specialRequirements,
            estimatedDuration: data.estimatedDuration
          },
          product_details: {
            type: "event"
          }
        }
      })
      // Refresh the events list
      const { events: fetchedEvents } = await sdk.admin.chefEvents.list()
      setEvents(fetchedEvents || [])
      setShowModal(false)
    } catch (error) {
      console.error("Error creating event:", error)
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

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading level="h1">Events</Heading>
        
        <Button 
          variant="primary" 
          size="base"
          onClick={() => setShowModal(true)}
          disabled={isLoading}
        >
          Create Event
        </Button>
      </div>
      
      <Text className="text-gray-500 mb-6">
        Manage chef events, including bookings, schedules, and customer requests.
      </Text>
      
      {isLoading && (
        <Text className="text-gray-400 text-center py-12">
          Loading menu products...
        </Text>
      )}
      
      {isLoadingEvents ? (
        <Text className="text-gray-400 text-center py-12">
          Loading events...
        </Text>
      ) : events.length === 0 ? (
        <Text className="text-gray-400 text-center py-12">
          No events found. Create your first event by clicking the button above.
        </Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Time</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Party Size</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {events.map((event) => (
              <Table.Row key={event.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {
                // Navigate to event detail page
                // navigate(`/events/${event.id}`)
              }}>
                <Table.Cell>{new Date(event.requestedDate).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{event.requestedTime}</Table.Cell>
                <Table.Cell>
                  {event.eventType === 'cooking_class' ? 'Cooking Class' : 
                   event.eventType === 'plated_dinner' ? 'Plated Dinner' : 
                   event.eventType === 'buffet_style' ? 'Buffet' : 'Custom'}
                </Table.Cell>
                <Table.Cell>{`${event.firstName} ${event.lastName}`}</Table.Cell>
                <Table.Cell>{event.partySize}</Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(event.status)}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {showModal && (
        <EventCreateModal 
          onClose={() => setShowModal(false)} 
          availableMenuProducts={menuProducts}
          onSubmit={handleCreateEvent}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Events"
})

export default EventsPage 