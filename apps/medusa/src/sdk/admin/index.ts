import type { Client } from '@medusajs/js-sdk';
import { Admin } from '@medusajs/js-sdk';
import { AdminChefEventsResource } from './admin-chef-events';

export class ExtendedAdminSDK extends Admin {
  public chefEvents: AdminChefEventsResource;

  constructor(client: Client) {
    super(client);
    this.chefEvents = new AdminChefEventsResource(client);
  }
}
