import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button } from "@medusajs/ui"
import { useNavigate } from "react-router-dom"

const CustomPage = () => {
  const navigate = useNavigate()

  return (
    <Container className="divide-y p-0">
      
        {/* <Heading level="h2">This is my custom route</Heading> */}
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate("/custom/cust_123_id")}
        >
          View Custom Item cust_123_id
        </Button>
      
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Custom Route",
})

export default CustomPage