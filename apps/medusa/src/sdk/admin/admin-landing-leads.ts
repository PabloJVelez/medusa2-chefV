import type { Client, ClientHeaders } from "@medusajs/js-sdk"

export interface LandingLead {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  source: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  landingPage?: string
  interestedIn?: any
  message?: string
  metadata?: any
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'unsubscribed' | 'spam'
  convertedAt?: string
  convertedToEventId?: string
  convertedToOrderId?: string
  emailSentAt?: string
  followUpCount: number
  lastContactedAt?: string
  unsubscribedAt?: string
  notes?: string
  assignedTo?: string
  created_at: string
  updated_at: string
}

export interface AdminLandingLeadsResponse {
  leads: LandingLead[]
  count: number
  offset: number
  limit: number
}

export interface AdminLandingLeadResponse {
  lead: LandingLead
}

export interface AdminListLandingLeadsQuery {
  limit?: number
  offset?: number
  status?: string
  source?: string
  q?: string
}

export interface AdminUpdateLandingLeadDTO {
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'unsubscribed' | 'spam'
  notes?: string
  assignedTo?: string
}

export class AdminLandingLeadsResource {
  constructor(private client: Client) {}

  async list(
    query?: AdminListLandingLeadsQuery,
    headers?: ClientHeaders
  ): Promise<AdminLandingLeadsResponse> {
    const params = new URLSearchParams()
    
    if (query?.limit) params.append("limit", query.limit.toString())
    if (query?.offset) params.append("offset", query.offset.toString())
    if (query?.status) params.append("status", query.status)
    if (query?.source) params.append("source", query.source)
    if (query?.q) params.append("q", query.q)

    const queryString = params.toString()
    const path = `/admin/landing-leads${queryString ? `?${queryString}` : ''}`
    
    return await this.client.fetch<AdminLandingLeadsResponse>(path, {
      method: "GET",
      headers,
    })
  }

  async retrieve(
    id: string,
    headers?: ClientHeaders
  ): Promise<AdminLandingLeadResponse> {
    return await this.client.fetch<AdminLandingLeadResponse>(
      `/admin/landing-leads/${id}`,
      {
        method: "GET",
        headers,
      }
    )
  }

  async update(
    id: string,
    body: AdminUpdateLandingLeadDTO,
    headers?: ClientHeaders
  ): Promise<AdminLandingLeadResponse> {
    return await this.client.fetch<AdminLandingLeadResponse>(
      `/admin/landing-leads/${id}`,
      {
        method: "POST",
        headers,
        body,
      }
    )
  }

  async delete(
    id: string,
    headers?: ClientHeaders
  ): Promise<{ success: boolean; id: string }> {
    return await this.client.fetch<{ success: boolean; id: string }>(
      `/admin/landing-leads/${id}`,
      {
        method: "DELETE",
        headers,
      }
    )
  }
}

