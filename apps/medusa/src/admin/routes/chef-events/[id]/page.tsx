import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, toast, Button, FocusModal, Textarea, Label, Checkbox } from "@medusajs/ui"
import { useParams } from "react-router-dom"
import { useState } from "react"
import { ChefEventForm } from "../components/chef-event-form"
import { MenuDetails } from "../components/menu-details"
import { EmailManagementSection } from "../components/EmailManagementSection"
import { useAdminRetrieveChefEvent, useAdminUpdateChefEventMutation, useAdminAcceptChefEventMutation, useAdminRejectChefEventMutation } from "../../../hooks/chef-events"

const ChefEventDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: chefEvent, isLoading } = useAdminRetrieveChefEvent(id!)
  const updateChefEvent = useAdminUpdateChefEventMutation(id!)
  const acceptChefEvent = useAdminAcceptChefEventMutation()
  const rejectChefEvent = useAdminRejectChefEventMutation()
  
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [chefNotes, setChefNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [sendAcceptanceEmail, setSendAcceptanceEmail] = useState(true)

  const handleUpdateChefEvent = async (data: any) => {
    try {
      await updateChefEvent.mutateAsync(data)
      toast.success("Chef Event Updated", {
        description: "The chef event has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating chef event:", error)
      toast.error("Update Failed", {
        description: "There was an error updating the chef event. Please try again.",
        duration: 5000,
      })
    }
  }

  const handleAcceptEvent = async () => {
    try {
      await acceptChefEvent.mutateAsync({ 
        id: id!, 
        data: { 
          chefNotes: chefNotes || undefined,
          sendAcceptanceEmail: sendAcceptanceEmail
        }
      })
      toast.success("Event Accepted", {
        description: "The event has been accepted and a product has been created for ticket sales.",
        duration: 5000,
      })
      setShowAcceptModal(false)
      setChefNotes("")
      setSendAcceptanceEmail(true)
    } catch (error) {
      console.error("Error accepting chef event:", error)
      toast.error("Acceptance Failed", {
        description: "There was an error accepting the chef event. Please try again.",
        duration: 5000,
      })
    }
  }

  const handleRejectEvent = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection Reason Required", {
        description: "Please provide a reason for rejecting this event.",
        duration: 3000,
      })
      return
    }

    try {
      await rejectChefEvent.mutateAsync({ 
        id: id!, 
        data: { 
          rejectionReason: rejectionReason.trim(),
          chefNotes: chefNotes || undefined
        }
      })
      toast.success("Event Rejected", {
        description: "The event has been rejected and the customer has been notified.",
        duration: 5000,
      })
      setShowRejectModal(false)
      setRejectionReason("")
      setChefNotes("")
    } catch (error) {
      console.error("Error rejecting chef event:", error)
      toast.error("Rejection Failed", {
        description: "There was an error rejecting the chef event. Please try again.",
        duration: 5000,
      })
    }
  }

  if (isLoading) {
    return (
      <Container className="p-6">
        <div>Loading...</div>
      </Container>
    )
  }

  if (!chefEvent) {
    return (
      <Container className="p-6">
        <div>Chef event not found</div>
      </Container>
    )
  }

  const isPending = chefEvent.status === 'pending'
  const isConfirmed = chefEvent.status === 'confirmed'

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">
          Edit Chef Event - {(chefEvent as any).firstName} {(chefEvent as any).lastName}
        </Heading>
        
        {isPending && (
          <div className="flex space-x-2">
            <Button variant="primary" size="small" onClick={() => setShowAcceptModal(true)}>
              Accept Event
            </Button>
            <Button variant="danger" size="small" onClick={() => setShowRejectModal(true)}>
              Reject Event
            </Button>
          </div>
        )}
        
        {isConfirmed && chefEvent.productId && (
          <Button variant="secondary" size="small" asChild>
            <a href={`/products/${chefEvent.productId}`} target="_blank">
              View Product
            </a>
          </Button>
        )}
      </div>
      
      <div className="p-6 space-y-6">
        <ChefEventForm 
          initialData={chefEvent}
          onSubmit={handleUpdateChefEvent}
          isLoading={updateChefEvent.isPending}
          onCancel={() => window.history.back()}
        />
        
        {/* Email Management Section for confirmed events */}
        {isConfirmed && (
          <EmailManagementSection 
            chefEvent={chefEvent}
            onEmailSent={(emailData) => {
              // Refresh event data to show updated email history
              // refetch() - will be available once we update the hooks
              toast.success("Email Sent", {
                description: `Event details sent successfully`,
                duration: 3000,
              })
            }}
          />
        )}
        
        <MenuDetails templateProductId={(chefEvent as any).templateProductId} />
      </div>

      {/* Accept Event Modal */}
      {showAcceptModal && (
        <FocusModal open onOpenChange={setShowAcceptModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Accept Event</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <div className="space-y-4">
                <p>This will accept the event and create a product for ticket sales.</p>
                
                {/* Email Notification Control */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-acceptance-email"
                    checked={sendAcceptanceEmail}
                    onCheckedChange={setSendAcceptanceEmail}
                  />
                  <Label htmlFor="send-acceptance-email">
                    Send acceptance email to customer
                  </Label>
                </div>
                
                <div>
                  <Label htmlFor="chef-notes">Chef Notes (Optional)</Label>
                  <Textarea
                    id="chef-notes"
                    placeholder="Add any notes about this acceptance..."
                    value={chefNotes}
                    onChange={(e) => setChefNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handleAcceptEvent}
                    disabled={acceptChefEvent.isPending}
                  >
                    {acceptChefEvent.isPending ? "Accepting..." : "Accept Event"}
                  </Button>
                </div>
              </div>
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}

      {/* Reject Event Modal */}
      {showRejectModal && (
        <FocusModal open onOpenChange={setShowRejectModal}>
          <FocusModal.Content>
            <FocusModal.Header>
              <FocusModal.Title>Reject Event</FocusModal.Title>
            </FocusModal.Header>
            <FocusModal.Body>
              <div className="space-y-4">
                <p>This will reject the event and send a rejection email to the customer.</p>
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a reason for rejecting this event..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rejection-notes">Chef Notes (Optional)</Label>
                  <Textarea
                    id="rejection-notes"
                    placeholder="Add any additional notes..."
                    value={chefNotes}
                    onChange={(e) => setChefNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={handleRejectEvent}
                    disabled={rejectChefEvent.isPending}
                  >
                    {rejectChefEvent.isPending ? "Rejecting..." : "Reject Event"}
                  </Button>
                </div>
              </div>
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Chef Event Details",
})

export default ChefEventDetailPage 