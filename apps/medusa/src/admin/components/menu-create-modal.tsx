import { 
  Button, 
  Heading, 
  Text,
  Input,
  Textarea,
  FocusModal,
  Select,
  Switch,
  Label,
  Container,
  Tabs
} from "@medusajs/ui"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import Medusa from "@medusajs/js-sdk"

const sdk = new Medusa({
  baseUrl: 'http://localhost:9000',
  apiKey: 'sk_6813a3c7eb8af6d971738f443e4885098464a6317f5050912811835b3ef323ac',
})

type MenuFormValues = {
  name: string
  courses: CourseFormValues[]
}

type CourseFormValues = {
  name: string
  dishes: DishFormValues[]
}

type DishFormValues = {
  name: string
  description: string
  ingredients: IngredientFormValues[]
}

type IngredientFormValues = {
  name: string
  optional: boolean
}

type MenuCreateModalProps = {
  onClose: () => void
  onSubmit: (data: MenuFormValues) => Promise<void>
}

const MenuCreateModal = ({ onClose, onSubmit }: MenuCreateModalProps) => {
  const [activeTab, setActiveTab] = useState("menu-details")
  
  const form = useForm<MenuFormValues>({
    defaultValues: {
      name: "",
      courses: []
    }
  })

  const { register, handleSubmit, control, formState: { errors, isValid } } = form

  const handleFormSubmit = async (data: MenuFormValues) => {
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error("Error creating menu:", error)
    }
  }

  // Count errors in each section to show indicators
  const errorCounts = {
    menuDetails: Object.keys(errors).filter(key => 
      ['name'].includes(key)
    ).length,
    courses: Object.keys(errors).filter(key => 
      ['courses'].includes(key)
    ).length
  }

  return (
    <FocusModal open onOpenChange={onClose}>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>
            <Heading level="h1">Create New Menu</Heading>
          </FocusModal.Title>
        </FocusModal.Header>
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FocusModal.Body className="flex flex-col h-full max-h-[80vh]">
            <Text className="text-gray-500 mb-4">
              Create a new menu by filling out the form below.
            </Text>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow">
              <Tabs.List className="mb-4">
                <Tabs.Trigger value="menu-details" className="relative">
                  Menu Details
                  {errorCounts.menuDetails > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {errorCounts.menuDetails}
                    </span>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="courses" className="relative">
                  Courses
                  {errorCounts.courses > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {errorCounts.courses}
                    </span>
                  )}
                </Tabs.Trigger>
              </Tabs.List>
              
              <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                <Tabs.Content value="menu-details">
                  <Container className="p-4 border border-gray-200 rounded-lg">
                    <Heading level="h2" className="mb-4">Menu Details</Heading>
                    
                    <div className="space-y-4">
                      <div>
                        <Text className="font-medium mb-2">Menu Name</Text>
                        <Input 
                          placeholder="Enter menu name" 
                          {...register("name", { required: "Menu name is required" })}
                        />
                        {errors.name && (
                          <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("courses")}
                      >
                        Next: Courses
                      </Button>
                    </div>
                  </Container>
                </Tabs.Content>
                
                <Tabs.Content value="courses">
                  <Container className="p-4 border border-gray-200 rounded-lg">
                    <Heading level="h2" className="mb-4">Courses</Heading>
                    
                    <div className="space-y-4">
                      <Controller
                        name="courses"
                        control={control}
                        render={({ field }) => (
                          <div>
                            {field.value.map((course, index) => (
                              <div key={index} className="mb-4 p-4 border rounded">
                                <Text className="font-medium mb-2">Course {index + 1}</Text>
                                <Input 
                                  placeholder="Enter course name"
                                  value={course.name}
                                  onChange={(e) => {
                                    const newCourses = [...field.value]
                                    newCourses[index] = { ...course, name: e.target.value }
                                    field.onChange(newCourses)
                                  }}
                                />
                                <div className="mt-2">
                                  <Text className="font-medium mb-2">Dishes</Text>
                                  {course.dishes.map((dish, dishIndex) => (
                                    <div key={dishIndex} className="mb-2 p-2 border rounded">
                                      <Input 
                                        placeholder="Enter dish name"
                                        value={dish.name}
                                        onChange={(e) => {
                                          const newCourses = [...field.value]
                                          newCourses[index].dishes[dishIndex] = { 
                                            ...dish, 
                                            name: e.target.value 
                                          }
                                          field.onChange(newCourses)
                                        }}
                                      />
                                      <Textarea 
                                        placeholder="Enter dish description"
                                        value={dish.description}
                                        onChange={(e) => {
                                          const newCourses = [...field.value]
                                          newCourses[index].dishes[dishIndex] = { 
                                            ...dish, 
                                            description: e.target.value 
                                          }
                                          field.onChange(newCourses)
                                        }}
                                      />
                                      <div className="mt-2">
                                        <Text className="font-medium mb-2">Ingredients</Text>
                                        {dish.ingredients.map((ingredient, ingredientIndex) => (
                                          <div key={ingredientIndex} className="flex items-center gap-2 mb-2">
                                            <Input 
                                              placeholder="Enter ingredient name"
                                              value={ingredient.name}
                                              onChange={(e) => {
                                                const newCourses = [...field.value]
                                                newCourses[index].dishes[dishIndex].ingredients[ingredientIndex] = { 
                                                  ...ingredient, 
                                                  name: e.target.value 
                                                }
                                                field.onChange(newCourses)
                                              }}
                                            />
                                            <div className="flex items-center gap-2">
                                              <Switch
                                                checked={ingredient.optional}
                                                onCheckedChange={(checked) => {
                                                  const newCourses = [...field.value]
                                                  newCourses[index].dishes[dishIndex].ingredients[ingredientIndex] = { 
                                                    ...ingredient, 
                                                    optional: checked 
                                                  }
                                                  field.onChange(newCourses)
                                                }}
                                              />
                                              <Label>Optional</Label>
                                            </div>
                                          </div>
                                        ))}
                                        <Button
                                          variant="secondary"
                                          size="small"
                                          onClick={() => {
                                            const newCourses = [...field.value]
                                            newCourses[index].dishes[dishIndex].ingredients.push({
                                              name: "",
                                              optional: false
                                            })
                                            field.onChange(newCourses)
                                          }}
                                        >
                                          Add Ingredient
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => {
                                      const newCourses = [...field.value]
                                      newCourses[index].dishes.push({
                                        name: "",
                                        description: "",
                                        ingredients: []
                                      })
                                      field.onChange(newCourses)
                                    }}
                                  >
                                    Add Dish
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="secondary"
                              onClick={() => {
                                field.onChange([
                                  ...field.value,
                                  {
                                    name: "",
                                    dishes: []
                                  }
                                ])
                              }}
                            >
                              Add Course
                            </Button>
                          </div>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <Button 
                        variant="secondary" 
                        size="small"
                        type="button"
                        onClick={() => setActiveTab("menu-details")}
                      >
                        Previous: Menu Details
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
                  Create Menu
                </Button>
              </div>
            </div>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}

export default MenuCreateModal 