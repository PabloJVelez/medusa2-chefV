import { Container, Heading, Button, Text, Badge, Input, Select, Textarea, Toaster } from "@medusajs/ui"
import { sdk } from "../../../../sdk/index.js"
import { useState, useEffect, type HTMLAttributes } from "react"
import { useParams } from "react-router-dom"

interface MenuDetailsPageProps extends HTMLAttributes<HTMLDivElement> {}

const MenuDetailPage = ({}: MenuDetailsPageProps) => {
  const { id } = useParams()
  
  const [menu, setMenu] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedMenu, setEditedMenu] = useState<any>({})

  useEffect(() => {
    const fetchMenuDetails = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const { menus } = await sdk.admin.menus.list({
          product_ids: [id]
        })
        if (menus && menus.length > 0) {
          setMenu(menus[0])
          setEditedMenu(menus[0])
        } else {
          setError("Menu not found")
        }
      } catch (err) {
        console.error("Error fetching menu details:", err)
        setError("Failed to load menu details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuDetails()
  }, [id])

  const handleSave = async () => {
    if (!id || !editedMenu) return

    setIsSaving(true)
    setError(null)

    try {
      const { menu: updatedMenu } = await sdk.admin.menus.update(id, editedMenu)
      setMenu(updatedMenu)
      setEditedMenu(updatedMenu)
      setIsEditing(false)
    } catch (err) {
      console.error("Error updating menu:", err)
      setError("Failed to update menu. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedMenu(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Container>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Heading>Menu Details</Heading>
          <Button
            variant={isEditing ? "secondary" : "primary"}
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            {isEditing ? "Cancel" : "Edit Menu"}
          </Button>
        </div>

        {isLoading ? (
          <Text className="text-gray-400 text-center py-12">
            Loading menu details...
          </Text>
        ) : error ? (
          <Text className="text-red-500 text-center py-12">
            {error}
          </Text>
        ) : menu ? (
          <div className="flex flex-col gap-6">
            {isEditing ? (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Menu Information</Heading>
                  <Input
                    label="Menu Name"
                    value={editedMenu.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Courses</Heading>
                  {editedMenu.courses?.map((course: any, index: number) => (
                    <div key={course.id} className="flex flex-col gap-4 p-4 border rounded">
                      <Input
                        label={`Course ${index + 1} Name`}
                        value={course.name}
                        onChange={(e) => {
                          const updatedCourses = [...editedMenu.courses]
                          updatedCourses[index] = {
                            ...course,
                            name: e.target.value
                          }
                          handleInputChange("courses", updatedCourses)
                        }}
                      />
                      {/* Add dish management here */}
                    </div>
                  ))}
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
                  <Heading className="text-lg">Menu Information</Heading>
                  <Text className="text-gray-900">Name: {menu.name}</Text>
                  <Text className="text-gray-900">Created: {formatDate(menu.createdAt)}</Text>
                  <Text className="text-gray-900">Last Updated: {formatDate(menu.updatedAt)}</Text>
                </div>

                <div className="flex flex-col gap-4">
                  <Heading className="text-lg">Courses</Heading>
                  {menu.courses?.map((course: any) => (
                    <div key={course.id} className="p-4 border rounded">
                      <Text className="font-medium">{course.name}</Text>
                      {/* Add dish display here */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Text className="text-gray-400 text-center py-12">
            Menu not found
          </Text>
        )}
        <Toaster />
      </div>
    </Container>
  )
}

export default MenuDetailPage 