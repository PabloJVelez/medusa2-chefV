import Medusa, { type Config } from '@medusajs/js-sdk';
import { ExtendedAdminSDK } from './admin/index';

export class MedusaPluginsSDK extends Medusa {
  public admin: ExtendedAdminSDK
  

  constructor(config: Config) {
    super(config)
    
    this.admin = new ExtendedAdminSDK(this.client)
  }
}

export const sdk = new MedusaPluginsSDK({
  baseUrl: 'http://localhost:9000',
  // apiKey: process.env.SDK_API_KEY,
  apiKey: 'sk_6813a3c7eb8af6d971738f443e4885098464a6317f5050912811835b3ef323ac',
})

export { AdminChefEventsResource } from './admin/admin-chef-events'
export { AdminMenusResource } from './admin/admin-menus'