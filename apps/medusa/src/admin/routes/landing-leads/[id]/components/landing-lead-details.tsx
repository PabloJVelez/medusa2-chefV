import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Container,
  Text, 
  Badge, 
  Button, 
  Input, 
  Textarea,
  Select,
  Heading
} from "@medusajs/ui"
import { 
  Mail, 
  Phone, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Tag,
  MessageSquare,
  User
} from "lucide-react"
import type { LandingLead } from "../../../../hooks/landing-leads.js"

const leadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "converted", "unsubscribed", "spam"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
})

type LeadUpdateFormData = z.infer<typeof leadUpdateSchema>

interface LandingLeadDetailsProps {
  lead: LandingLead
  onUpdate: (data: any) => Promise<void>
}

export const LandingLeadDetails = ({ lead, onUpdate }: LandingLeadDetailsProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  
  // Contact Information Form
  const contactForm = useForm<Pick<LeadUpdateFormData, 'firstName' | 'lastName' | 'phone'>>({
    resolver: zodResolver(leadUpdateSchema.pick({ firstName: true, lastName: true, phone: true })),
    defaultValues: {
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      phone: lead.phone || "",
    }
  })

  // Lead Management Form
  const managementForm = useForm<Pick<LeadUpdateFormData, 'status' | 'assignedTo' | 'notes'>>({
    resolver: zodResolver(leadUpdateSchema.pick({ status: true, assignedTo: true, notes: true })),
    defaultValues: {
      status: lead.status,
      assignedTo: lead.assignedTo || "",
      notes: lead.notes || "",
    }
  })

  // Reset forms when lead data changes
  useEffect(() => {
    contactForm.reset({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      phone: lead.phone || "",
    })
    managementForm.reset({
      status: lead.status,
      assignedTo: lead.assignedTo || "",
      notes: lead.notes || "",
    })
  }, [lead, contactForm, managementForm])

  const handleContactSave = async (data: Pick<LeadUpdateFormData, 'firstName' | 'lastName' | 'phone'>) => {
    try {
      await onUpdate(data)
      setEditingSection(null)
    } catch (error) {
      console.error("Failed to update contact info:", error)
    }
  }

  const handleManagementSave = async (data: Pick<LeadUpdateFormData, 'status' | 'assignedTo' | 'notes'>) => {
    try {
      await onUpdate(data)
      setEditingSection(null)
    } catch (error) {
      console.error("Failed to update management info:", error)
    }
  }

  const handleCancel = (section: string) => {
    if (section === 'contact') {
      contactForm.reset()
    } else if (section === 'management') {
      managementForm.reset()
    }
    setEditingSection(null)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: "orange",
      contacted: "blue", 
      qualified: "green",
      converted: "green",
      unsubscribed: "red",
      spam: "red"
    } as const
    return colors[status as keyof typeof colors] || "grey"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Contact Information */}
      <Container>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <Heading level="h3">Contact Information</Heading>
            </div>
            <Button 
              variant={editingSection === 'contact' ? "secondary" : "primary"} 
              size="small"
              onClick={() => setEditingSection(editingSection === 'contact' ? null : 'contact')}
            >
              {editingSection === 'contact' ? "Cancel" : "Edit"}
            </Button>
          </div>
          
          {editingSection === 'contact' ? (
            <form onSubmit={contactForm.handleSubmit(handleContactSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-2">First Name</Text>
                  <Input
                    {...contactForm.register("firstName")}
                    placeholder="Enter first name"
                  />
                  {contactForm.formState.errors.firstName && (
                    <Text size="small" className="text-red-600 mt-1">
                      {contactForm.formState.errors.firstName.message}
                    </Text>
                  )}
                </div>
                
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-2">Last Name</Text>
                  <Input
                    {...contactForm.register("lastName")}
                    placeholder="Enter last name"
                  />
                  {contactForm.formState.errors.lastName && (
                    <Text size="small" className="text-red-600 mt-1">
                      {contactForm.formState.errors.lastName.message}
                    </Text>
                  )}
                </div>
              </div>

              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-2">Phone</Text>
                <Input
                  {...contactForm.register("phone")}
                  placeholder="Enter phone number"
                />
                {contactForm.formState.errors.phone && (
                  <Text size="small" className="text-red-600 mt-1">
                    {contactForm.formState.errors.phone.message}
                  </Text>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={contactForm.formState.isSubmitting}>
                  {contactForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => handleCancel('contact')}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">Email</Text>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <Text>{lead.email}</Text>
                </div>
              </div>
              
              {lead.firstName && (
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-1">First Name</Text>
                  <Text>{lead.firstName}</Text>
                </div>
              )}
              
              {lead.lastName && (
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-1">Last Name</Text>
                  <Text>{lead.lastName}</Text>
                </div>
              )}
              
              {lead.phone && (
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-1">Phone</Text>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <Text>{lead.phone}</Text>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Lead Management */}
      <Container>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-500" />
              <Heading level="h3">Lead Management</Heading>
            </div>
            <Button 
              variant={editingSection === 'management' ? "secondary" : "primary"} 
              size="small"
              onClick={() => setEditingSection(editingSection === 'management' ? null : 'management')}
            >
              {editingSection === 'management' ? "Cancel" : "Edit"}
            </Button>
          </div>

          {editingSection === 'management' ? (
            <form onSubmit={managementForm.handleSubmit(handleManagementSave)} className="space-y-4">
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-2">Status</Text>
                <Select 
                  value={managementForm.watch("status")} 
                  onValueChange={(value) => managementForm.setValue("status", value as any)}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="new">New</Select.Item>
                    <Select.Item value="contacted">Contacted</Select.Item>
                    <Select.Item value="qualified">Qualified</Select.Item>
                    <Select.Item value="converted">Converted</Select.Item>
                    <Select.Item value="unsubscribed">Unsubscribed</Select.Item>
                    <Select.Item value="spam">Spam</Select.Item>
                  </Select.Content>
                </Select>
                {managementForm.formState.errors.status && (
                  <Text size="small" className="text-red-600 mt-1">
                    {managementForm.formState.errors.status.message}
                  </Text>
                )}
              </div>

              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-2">Assigned To</Text>
                <Input
                  {...managementForm.register("assignedTo")}
                  placeholder="Enter assignee email or name"
                />
                {managementForm.formState.errors.assignedTo && (
                  <Text size="small" className="text-red-600 mt-1">
                    {managementForm.formState.errors.assignedTo.message}
                  </Text>
                )}
              </div>

              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-2">Notes</Text>
                <Textarea
                  {...managementForm.register("notes")}
                  placeholder="Add notes about this lead..."
                  rows={4}
                />
                {managementForm.formState.errors.notes && (
                  <Text size="small" className="text-red-600 mt-1">
                    {managementForm.formState.errors.notes.message}
                  </Text>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={managementForm.formState.isSubmitting}>
                  {managementForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => handleCancel('management')}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">Status</Text>
                <Badge color={getStatusColor(lead.status)}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">Assigned To</Text>
                <Text>{lead.assignedTo || "Unassigned"}</Text>
              </div>
              
              {lead.notes && (
                <div className="md:col-span-2">
                  <Text size="small" weight="plus" className="text-gray-600 mb-1">Notes</Text>
                  <Text>{lead.notes}</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Tracking Information */}
      <Container>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <ExternalLink className="h-5 w-5 text-gray-500" />
            <Heading level="h3">Tracking Information</Heading>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text size="small" weight="plus" className="text-gray-600 mb-1">Source</Text>
              <Badge color="grey" className="capitalize">{lead.source}</Badge>
            </div>
            
            {lead.utmSource && (
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">UTM Source</Text>
                <Text>{lead.utmSource}</Text>
              </div>
            )}
            
            {lead.utmMedium && (
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">UTM Medium</Text>
                <Text>{lead.utmMedium}</Text>
              </div>
            )}
            
            {lead.utmCampaign && (
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">UTM Campaign</Text>
                <Text>{lead.utmCampaign}</Text>
              </div>
            )}
            
            {lead.utmTerm && (
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">UTM Term</Text>
                <Text>{lead.utmTerm}</Text>
              </div>
            )}
            
            {lead.utmContent && (
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">UTM Content</Text>
                <Text>{lead.utmContent}</Text>
              </div>
            )}
            
            {lead.landingPage && (
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">Landing Page</Text>
                <Text>{lead.landingPage}</Text>
              </div>
            )}
            
            {lead.referrer && (
              <div>
                <Text size="small" weight="plus" className="text-gray-600 mb-1">Referrer</Text>
                <Text className="break-all">{lead.referrer}</Text>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Activity Timeline */}
      <Container>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Heading level="h3">Activity Timeline</Heading>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Text size="small" weight="plus">Created</Text>
              <Text size="small">{new Date(lead.created_at).toLocaleString()}</Text>
            </div>
            
            {lead.emailSentAt && (
              <div className="flex justify-between items-center">
                <Text size="small" weight="plus">Welcome Email Sent</Text>
                <Text size="small">{new Date(lead.emailSentAt).toLocaleString()}</Text>
              </div>
            )}
            
            {lead.lastContactedAt && (
              <div className="flex justify-between items-center">
                <Text size="small" weight="plus">Last Contacted</Text>
                <Text size="small">{new Date(lead.lastContactedAt).toLocaleString()}</Text>
              </div>
            )}
            
            {lead.convertedAt && (
              <div className="flex justify-between items-center">
                <Text size="small" weight="plus">Converted</Text>
                <Text size="small">{new Date(lead.convertedAt).toLocaleString()}</Text>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <Text size="small" weight="plus">Follow-up Count</Text>
              <Badge color={lead.followUpCount > 0 ? "blue" : "grey"}>
                {lead.followUpCount}
              </Badge>
            </div>
          </div>
        </div>
      </Container>

      {/* Additional Information */}
      {(lead.interestedIn || lead.message || lead.metadata) && (
        <Container>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-500" />
              <Heading level="h3">Additional Information</Heading>
            </div>
            
            <div className="space-y-4">
              {lead.interestedIn && (
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-1">Interested In</Text>
                  <Text>{JSON.stringify(lead.interestedIn)}</Text>
                </div>
              )}
              
              {lead.message && (
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-1">Message</Text>
                  <Text>{lead.message}</Text>
                </div>
              )}
              
              {lead.metadata && (
                <div>
                  <Text size="small" weight="plus" className="text-gray-600 mb-1">Metadata</Text>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(lead.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Container>
      )}
    </div>
  )
}
