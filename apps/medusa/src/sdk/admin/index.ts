import type { Client } from '@medusajs/js-sdk';
import { Admin } from '@medusajs/js-sdk';
import { AdminChefEventsResource } from './admin-chef-events';
import { AdminMenusResource } from './admin-menus';
import { AdminExperienceTypesResource } from './admin-experience-types';
import { AdminGoogleCalendarResource } from './admin-google-calendar';

export class ExtendedAdminSDK extends Admin {
  public chefEvents: AdminChefEventsResource;
  public menus: AdminMenusResource;
  public experienceTypes: AdminExperienceTypesResource;
  public googleCalendar: AdminGoogleCalendarResource;

  constructor(client: Client) {
    super(client);
    this.chefEvents = new AdminChefEventsResource(client);
    this.menus = new AdminMenusResource(client);
    this.experienceTypes = new AdminExperienceTypesResource(client);
    this.googleCalendar = new AdminGoogleCalendarResource(client);
  }
}
