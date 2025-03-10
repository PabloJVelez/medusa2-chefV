"use client"
import { 
  Button, 
  Heading, 
  Text,
  Input,
  Textarea,
  FocusModal,
} from "@medusajs/ui"
import { useForm } from "react-hook-form"

type EventFormValues = {
  name: string
  date: string
  type: string
  description: string
}

type EventCreateModalProps = {
  onClose: () => void
}

const EventCreateModal = ({ onClose }: EventCreateModalProps) => {
  const form = useForm<EventFormValues>({
    defaultValues: {
      name: "",
      date: "",
      type: "",
      description: ""
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = (data: EventFormValues) => {
    console.log("Event data:", data)
    // Here you would typically save the event data to your backend
    onClose()
  }

  return (
    <FocusModal open onOpenChange={onClose}>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>
            <Heading level="h1">Create New Event</Heading>
          </FocusModal.Title>
        </FocusModal.Header>
        
        <FocusModal.Body>
          <Text className="text-gray-500 mb-6">
            Create a new chef event by filling out the form below.
          </Text>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Text className="font-medium mb-2">Event Name</Text>
                <Input 
                  placeholder="Enter event name" 
                  {...register("name", { required: "Event name is required" })}
                />
                {errors.name && (
                  <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
                )}
              </div>
              
              <div>
                <Text className="font-medium mb-2">Event Date</Text>
                <Input 
                  type="date" 
                  {...register("date", { required: "Event date is required" })}
                />
                {errors.date && (
                  <Text className="text-red-500 text-sm mt-1">{errors.date.message}</Text>
                )}
              </div>
              
              <div>
                <Text className="font-medium mb-2">Event Type</Text>
                <Input 
                  placeholder="Select event type" 
                  {...register("type", { required: "Event type is required" })}
                />
                {errors.type && (
                  <Text className="text-red-500 text-sm mt-1">{errors.type.message}</Text>
                )}
              </div>
              
              <div>
                <Text className="font-medium mb-2">Description</Text>
                <Textarea 
                  placeholder="Enter event description" 
                  {...register("description")}
                />
              </div>
            </div>
          </form>
        </FocusModal.Body>
        
        <FocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
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
              onClick={handleSubmit(onSubmit)}
              type="button"
            >
              Create Event
            </Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}

export default EventCreateModal