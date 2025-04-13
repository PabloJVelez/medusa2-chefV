import { useParams } from "react-router-dom"
import { Container, Heading } from "@medusajs/ui"

const CustomDetailPage = () => {
  const { id } = useParams()

  return (
    <Container className="divide-y p-0">
      
        <Heading level="h1">Custom Detail Page: {id}</Heading>
      
    </Container>
  )
}

export default CustomDetailPage