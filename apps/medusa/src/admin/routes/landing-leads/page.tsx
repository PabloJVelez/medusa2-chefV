import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { LandingLeadsList } from "./components/landing-leads-list.js"

const LandingLeadsPage = () => {
  console.log("📊 LandingLeadsPage component mounted")

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Landing Page Leads</Heading>
      </div>
      
      <LandingLeadsList />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Landing Leads",
})

export default LandingLeadsPage
