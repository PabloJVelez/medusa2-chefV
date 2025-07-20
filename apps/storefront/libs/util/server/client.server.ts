import { MedusaPluginsSDK } from '@lambdacurry/medusa-plugins-sdk';
import { buildNewLRUCache } from './cache-builder.server';
import { config } from './config.server';

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = 'http://localhost:9000';

if (process.env.INTERNAL_MEDUSA_API_URL) {
  MEDUSA_BACKEND_URL = process.env.INTERNAL_MEDUSA_API_URL;
}

if (process.env.PUBLIC_MEDUSA_API_URL) {
  MEDUSA_BACKEND_URL = process.env.PUBLIC_MEDUSA_API_URL;
}

export const baseMedusaConfig = {
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: config.MEDUSA_PUBLISHABLE_KEY,
};

// Log configuration for debugging
console.log('⚙️ CLIENT CONFIG: Medusa configuration loaded:', {
  baseUrl: baseMedusaConfig.baseUrl,
  debug: baseMedusaConfig.debug,
  hasPublishableKey: !!baseMedusaConfig.publishableKey,
  publishableKeyPrefix: baseMedusaConfig.publishableKey?.slice(0, 10) + '...',
});

export const sdk = new MedusaPluginsSDK({
  ...baseMedusaConfig,
});

export const sdkCache = buildNewLRUCache({ max: 1000 });
