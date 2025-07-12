import { Client, Admin } from '@medusajs/js-sdk'
import { AdminMenusResource } from './admin/admin-menus'
import { AdminChefEventsResource } from './admin/admin-chef-events'

export class ExtendedAdminSDK extends Admin {
  public menus: AdminMenusResource
  public chefEvents: AdminChefEventsResource

  constructor(client: Client) {
    super(client)
    this.menus = new AdminMenusResource(client)
    this.chefEvents = new AdminChefEventsResource(client)
  }
}

// Use a hardcoded URL for now since we're in development
export const sdk = new ExtendedAdminSDK(
  new Client({
    baseUrl: 'http://localhost:9000',
    auth: {
    type: "session",
  },
  })
)

export { AdminChefEventsResource } from './admin/admin-chef-events'
export { AdminMenusResource } from './admin/admin-menus'