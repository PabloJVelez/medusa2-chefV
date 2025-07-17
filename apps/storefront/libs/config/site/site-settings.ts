import { SiteSettings } from '@libs/types';
import { config } from '@libs/util/server/config.server';

export const siteSettings: SiteSettings = {
  storefront_url: config.STOREFRONT_URL,
  description: 'Chef Elena Rodriguez offers premium culinary experiences including cooking classes, plated dinners, and buffet-style events. Professional chef services bringing restaurant-quality cuisine to your home.',
  favicon: '/favicon.svg',
  social_facebook: 'https://www.facebook.com/ChefElenaRodriguez',
  social_instagram: 'https://www.instagram.com/chef_elena_culinary',
  social_twitter: 'https://www.twitter.com/ChefElenaR',
};
