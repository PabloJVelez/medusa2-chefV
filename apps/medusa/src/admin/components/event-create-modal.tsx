import { 
  Button, 
  Heading, 
  Text,
  Input,
  Textarea,
  FocusModal,
  Select,
  DatePicker,
  TimePicker,
  Switch,
  Label,
  Container,
  Tabs
} from "@medusajs/ui"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"

type EventFormValues = {
  // Basic event details
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  requestedDate: Date | string
  requestedTime: string
  partySize: number
  eventType: 'cooking_class' | 'plated_dinner' | 'buffet_style' | 'custom'
  
  // Template product (menu) selection
  templateProductId: string
  
  // Location details
  locationType: 'customer_location' | 'chef_location'
  locationAddress: string
  
  // Contact information
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  
  // Additional details
  totalPrice: number
  depositPaid: boolean
  specialRequirements: string
  estimatedDuration: number // in minutes
  assignedChefId?: string
}

type EventCreateModalProps = {
  onClose: () => void
  // We'll need to fetch available menu products
  availableMenuProducts?: Array<{ id: string, title: string }>
  onSubmit: (data: EventFormValues) => Promise<void>
}

const EventCreateModal = ({ onClose, availableMenuProducts = [], onSubmit }: EventCreateModalProps) => {
  const [activeTab, setActiveTab] = useState("event-details")
  
  const form = useForm<EventFormValues>({
    defaultValues: {
      status: 'pending',
      requestedDate: '',
      requestedTime: '',
      partySize: 2,
      eventType: 'plated_dinner',
      templateProductId: '',
      locationType: 'customer_location',
      locationAddress: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
      totalPrice: 0,
      depositPaid: false,
      specialRequirements: '',
      estimatedDuration: 180, // 3 hours default
    }
  })

  const { register, handleSubmit, control, formState: { errors, isValid } } = form

  const handleFormSubmit = async (data: EventFormValues) => {
    try {
      // Convert totalPrice to cents for storage
      const formData = {
        ...data,
        totalPrice: Math.round(data.totalPrice * 100)
      }
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Error creating event:", error)
    }
  }

  // Count errors in each section to show indicators
  const errorCounts = {
    eventDetails: Object.keys(errors).filter(key => 
      ['eventType', 'templateProductId', 'requestedDate', 'requestedTime', 'partySize', 'estimatedDuration'].includes(key)
    ).length,
    location: Object.keys(errors).filter(key => 
      ['locationType', 'locationAddress'].includes(key)
    ).length,
    contact: Object.keys(errors).filter(key => 
      ['firstName', 'lastName', 'email', 'phone'].includes(key)
    ).length,
    additional: Object.keys(errors).filter(key => 
      ['specialRequirements', 'notes', 'totalPrice', 'depositPaid'].includes(key)
    ).length
  }

  return (
    <FocusModal open onOpenChange={onClose}>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>
            <Heading level="h1">Create New Event</Heading>
          </FocusModal.Title>
        </FocusModal.Header>
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FocusModal.Body className="flex flex-col h-full max-h-[80vh]">
            <Text className="text-gray-500 mb-4">
              Create a new event by filling out the form below.
            </Text>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow">
              <Tabs.List className="mb-4">
                <Tabs.Trigger value="event-details" className="relative">
                  Event Details
                  {errorCounts.eventDetails > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {errorCounts.eventDetails}
                    </span>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="location" className="relative">
                  Location
                  {errorCounts.location > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {errorCounts.location}
                    </span>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="contact" className="relative">
                  Contact
                  {errorCounts.contact > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {errorCounts.contact}
                    </span>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="additional" className="relative">
                  Additional
                  {errorCounts.additional > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {errorCounts.additional}
                    </span>
                  )}
                </Tabs.Trigger>
              </Tabs.List>
              
              <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                <Tabs.Content value="event-details">
                  <Container className="p-4 border border-gray-200 rounded-lg">
                    <Heading level="h2" className="mb-4">Event Details</Heading>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Text className="font-medium mb-2">Event Type</Text>
                        <Controller
                          name="eventType"
                          control={control}
                          rules={{ required: "Event type is required" }}
                          render={({ field }) => (
                            <Select {...field} onValueChange={field.onChange}>
                              <Select.Trigger>
                                <Select.Value placeholder="Select event type" />
                              </Select.Trigger>
                              <Select.Content>
                                <Select.Item value="plated_dinner">Plated Dinner</Select.Item>
                                <Select.Item value="buffet_style">Buffet</Select.Item>
                                <Select.Item value="cooking_class">Cooking Class</Select.Item>
                                <Select.Item value="custom">Custom Event</Select.Item>
                              </Select.Content>
                            </Select>
                          )}
                        />
                        {errors.eventType && (
                          <Text className="text-red-500 text-sm mt-1">{errors.eventType.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Menu Template</Text>
                        <Controller
                          name="templateProductId"
                          control={control}
                          rules={{ required: "Menu template is required" }}
                          render={({ field }) => (
                            <Select {...field} onValueChange={field.onChange}>
                              <Select.Trigger>
                                <Select.Value placeholder="Select menu template" />
                              </Select.Trigger>
                              <Select.Content>
                                {availableMenuProducts.map(product => (
                                  <Select.Item key={product.id} value={product.id}>
                                    {product.title}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          )}
                        />
                        {errors.templateProductId && (
                          <Text className="text-red-500 text-sm mt-1">{errors.templateProductId.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Date</Text>
                        <Controller
                          name="requestedDate"
                          control={control}
                          rules={{ required: "Date is required" }}
                          render={({ field }) => (
                            <Input 
                              type="date" 
                              {...field}
                            />
                          )}
                        />
                        {errors.requestedDate && (
                          <Text className="text-red-500 text-sm mt-1">{errors.requestedDate.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Time</Text>
                        <Controller
                          name="requestedTime"
                          control={control}
                          rules={{ required: "Time is required" }}
                          render={({ field }) => (
                            <Input 
                              type="time" 
                              {...field}
                            />
                          )}
                        />
                        {errors.requestedTime && (
                          <Text className="text-red-500 text-sm mt-1">{errors.requestedTime.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Party Size</Text>
                        <Input 
                          type="number" 
                          min="1"
                          max="50"
                          {...register("partySize", { 
                            required: "Party size is required",
                            min: { value: 1, message: "Minimum party size is 1" },
                            max: { value: 50, message: "Maximum party size is 50" }
                          })}
                        />
                        {errors.partySize && (
                          <Text className="text-red-500 text-sm mt-1">{errors.partySize.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Estimated Duration (minutes)</Text>
                        <Input 
                          type="number" 
                          min="30"
                          step="30"
                          {...register("estimatedDuration", { 
                            required: "Duration is required",
                            min: { value: 30, message: "Minimum duration is 30 minutes" }
                          })}
                        />
                        {errors.estimatedDuration && (
                          <Text className="text-red-500 text-sm mt-1">{errors.estimatedDuration.message}</Text>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("location")}
                      >
                        Next: Location
                      </Button>
                    </div>
                  </Container>
                </Tabs.Content>
                
                <Tabs.Content value="location">
                  <Container className="p-4 border border-gray-200 rounded-lg">
                    <Heading level="h2" className="mb-4">Location</Heading>
                    
                    <div className="space-y-4">
                      <div>
                        <Text className="font-medium mb-2">Location Type</Text>
                        <Controller
                          name="locationType"
                          control={control}
                          rules={{ required: "Location type is required" }}
                          render={({ field }) => (
                            <Select {...field} onValueChange={field.onChange}>
                              <Select.Trigger>
                                <Select.Value placeholder="Select location type" />
                              </Select.Trigger>
                              <Select.Content>
                                <Select.Item value="customer_location">Customer's Location</Select.Item>
                                <Select.Item value="chef_location">Chef's Location</Select.Item>
                              </Select.Content>
                            </Select>
                          )}
                        />
                        {errors.locationType && (
                          <Text className="text-red-500 text-sm mt-1">{errors.locationType.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Address</Text>
                        <Textarea 
                          placeholder="Enter full address" 
                          {...register("locationAddress", { required: "Address is required" })}
                        />
                        {errors.locationAddress && (
                          <Text className="text-red-500 text-sm mt-1">{errors.locationAddress.message}</Text>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("event-details")}
                      >
                        Previous: Event Details
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("contact")}
                      >
                        Next: Contact
                      </Button>
                    </div>
                  </Container>
                </Tabs.Content>
                
                <Tabs.Content value="contact">
                  <Container className="p-4 border border-gray-200 rounded-lg">
                    <Heading level="h2" className="mb-4">Contact Information</Heading>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Text className="font-medium mb-2">First Name</Text>
                        <Input 
                          placeholder="Enter first name" 
                          {...register("firstName", { required: "First name is required" })}
                        />
                        {errors.firstName && (
                          <Text className="text-red-500 text-sm mt-1">{errors.firstName.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Last Name</Text>
                        <Input 
                          placeholder="Enter last name" 
                          {...register("lastName", { required: "Last name is required" })}
                        />
                        {errors.lastName && (
                          <Text className="text-red-500 text-sm mt-1">{errors.lastName.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Email</Text>
                        <Input 
                          type="email"
                          placeholder="Enter email" 
                          {...register("email", { 
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {errors.email && (
                          <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
                        )}
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Phone</Text>
                        <Input 
                          placeholder="Enter phone number" 
                          {...register("phone", { required: "Phone number is required" })}
                        />
                        {errors.phone && (
                          <Text className="text-red-500 text-sm mt-1">{errors.phone.message}</Text>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("location")}
                      >
                        Previous: Location
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("additional")}
                      >
                        Next: Additional Details
                      </Button>
                    </div>
                  </Container>
                </Tabs.Content>
                
                <Tabs.Content value="additional">
                  <Container className="p-4 border border-gray-200 rounded-lg">
                    <Heading level="h2" className="mb-4">Additional Details</Heading>
                    
                    <div className="space-y-4">
                      <div>
                        <Text className="font-medium mb-2">Special Requirements</Text>
                        <Textarea 
                          placeholder="Enter any special requirements or dietary restrictions" 
                          {...register("specialRequirements")}
                        />
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Notes</Text>
                        <Textarea 
                          placeholder="Enter any additional notes" 
                          {...register("notes")}
                        />
                      </div>
                      
                      <div>
                        <Text className="font-medium mb-2">Total Price ($)</Text>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          {...register("totalPrice", { 
                            required: "Total price is required",
                            min: { value: 0, message: "Price must be greater than 0" },
                            valueAsNumber: true
                          })}
                        />
                        {errors.totalPrice && (
                          <Text className="text-red-500 text-sm mt-1">{errors.totalPrice.message}</Text>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="depositPaid"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <Switch checked={value} onCheckedChange={onChange} />
                          )}
                        />
                        <Label>Deposit Paid</Label>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-start">
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("contact")}
                      >
                        Previous: Contact
                      </Button>
                    </div>
                  </Container>
                </Tabs.Content>
              </div>
            </Tabs>
          </FocusModal.Body>
          
          <FocusModal.Footer className="sticky bottom-0 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div>
                {Object.values(errorCounts).reduce((a, b) => a + b, 0) > 0 && (
                  <Text className="text-red-500">
                    Please fix the errors before submitting
                  </Text>
                )}
              </div>
              <div className="flex items-center gap-x-2">
                <Button
                  variant="secondary"
                  size="base"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="base"
                  type="submit"
                  disabled={Object.values(errorCounts).reduce((a, b) => a + b, 0) > 0}
                >
                  Create Event
                </Button>
              </div>
            </div>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}

export default EventCreateModal 