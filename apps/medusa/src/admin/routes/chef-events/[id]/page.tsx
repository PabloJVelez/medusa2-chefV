import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, toast } from "@medusajs/ui"
import { useParams } from "react-router-dom"
import { ChefEventForm } from "../components/chef-event-form"
import { MenuDetails } from "../components/menu-details"
import { useAdminRetrieveChefEvent, useAdminUpdateChefEventMutation } from "../../../hooks/chef-events"
import type { AdminUpdateChefEventDTO } from "../../../../sdk/admin/admin-chef-events"

const ChefEventDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: chefEvent, isLoading } = useAdminRetrieveChefEvent(id!)
  const updateChefEvent = useAdminUpdateChefEventMutation(id!)

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

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">
          Edit Chef Event - {(chefEvent as any).firstName} {(chefEvent as any).lastName}
        </Heading>
      </div>
      
      <div className="p-6 space-y-6">
        <ChefEventForm 
          initialData={chefEvent}
          onSubmit={handleUpdateChefEvent}
          isLoading={updateChefEvent.isPending}
          onCancel={() => window.history.back()}
        />
        
        <MenuDetails templateProductId={(chefEvent as any).templateProductId} />
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Chef Event Details",
})

export default ChefEventDetailPage 