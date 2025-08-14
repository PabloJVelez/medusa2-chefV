import { SiteSettings } from '@libs/types';
import { config } from '@libs/util/server/config.server';

export const siteSettings: SiteSettings = {
  storefront_url: config.STOREFRONT_URL,
  description: 'Chef Silvia offers premium private chef experiences including cooking classes, plated dinners, and buffet-style events. Restaurant-quality cuisine crafted in your home.',
  favicon: '/favicon.svg',
  social_facebook: '',
  social_instagram: 'https://www.instagram.com/silcooksforyou/',
  social_twitter: '',
};
