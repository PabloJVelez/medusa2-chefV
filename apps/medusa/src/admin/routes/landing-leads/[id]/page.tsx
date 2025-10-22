import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge, toast } from "@medusajs/ui"
import { useParams } from "react-router-dom"
import { useAdminRetrieveLandingLead, useAdminUpdateLandingLeadMutation } from "../../../hooks/landing-leads.js"
import { LandingLeadDetails } from "./components/landing-lead-details.js"
import { ArrowLeft } from "lucide-react"

const LandingLeadDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return (
      <Container className="p-6">
        <div className="text-center">
          <p className="text-red-600">Invalid lead ID</p>
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Back to Leads
          </Button>
        </div>
      </Container>
    )
  }
  
  const { data, isLoading, error } = useAdminRetrieveLandingLead(id)
  const updateLead = useAdminUpdateLandingLeadMutation()

  const handleUpdate = async (updateData: any) => {
    try {
      await updateLead.mutateAsync({ id: id, data: updateData })
      toast.success("Lead updated", {
        description: "Lead has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast.error("Update failed", {
        description: "There was an error updating the lead. Please try again.",
        duration: 5000,
      })
    }
  }

  if (error) {
    return (
      <Container className="p-6">
        <div className="text-center">
          <p className="text-red-600">Error loading lead: {error.message}</p>
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Back to Leads
          </Button>
        </div>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container className="p-6">
        <div className="text-center">
          <p>Loading lead details...</p>
        </div>
      </Container>
    )
  }

  const lead = data?.lead

  if (!lead) {
    return (
      <Container className="p-6">
        <div className="text-center">
          <p>Lead not found</p>
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Back to Leads
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="small"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Heading level="h1">{lead.email}</Heading>
            <p className="text-sm text-gray-500">
              Lead #{lead.id.slice(-8)} • Created {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <Badge 
          color={
            lead.status === 'new' ? 'orange' :
            lead.status === 'contacted' ? 'blue' :
            lead.status === 'qualified' ? 'green' :
            lead.status === 'converted' ? 'green' :
            lead.status === 'unsubscribed' ? 'red' :
            'red'
          }
        >
          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
        </Badge>
      </div>
      
      <LandingLeadDetails lead={lead} onUpdate={handleUpdate} />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Lead Details",
})

export default LandingLeadDetailsPage
