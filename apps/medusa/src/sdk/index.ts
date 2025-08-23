import { Client, Admin } from '@medusajs/js-sdk'
import { AdminMenusResource } from './admin/admin-menus'
import { AdminChefEventsResource } from './admin/admin-chef-events'
import { AdminUploadsResource } from './admin/admin-uploads'
import { ExtendedStoreSDK } from './store'

export class ExtendedAdminSDK extends Admin {
  public menus: AdminMenusResource
  public chefEvents: AdminChefEventsResource
  public uploads: AdminUploadsResource

  constructor(client: Client) {
    super(client)
    this.menus = new AdminMenusResource(client)
    this.chefEvents = new AdminChefEventsResource(client)
    this.uploads = new AdminUploadsResource(client)
  }
}

export class ExtendedSDK {
  public admin: ExtendedAdminSDK
  public store: ExtendedStoreSDK

  constructor(baseUrl: string) {
    const adminClient = new Client({
      baseUrl,
      auth: {
        type: "session",
      },
    })
    
    const storeClient = new Client({
      baseUrl,
      // Store client doesn't need authentication
    })

    this.admin = new ExtendedAdminSDK(adminClient)
    this.store = new ExtendedStoreSDK(storeClient)
  }
}

// Use a hardcoded URL for now since we're in development
console.log('ENV VARIABLES AVAILABLE---->', process.env)
export const sdk = new ExtendedSDK(process.env.MEDUSA_BACKEND_URL!)

export { AdminChefEventsResource } from './admin/admin-chef-events'
export { AdminMenusResource } from './admin/admin-menus'
export { ExtendedStoreSDK } from './store'
export type * from './store'