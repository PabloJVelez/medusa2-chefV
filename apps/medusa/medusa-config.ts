import { defineConfig, loadEnv } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

// Add debug logging
console.log('🔧 Loading Medusa configuration...');
console.log('🔧 Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
  REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  COOKIE_SECRET: process.env.COOKIE_SECRET ? 'SET' : 'NOT SET',
});

const REDIS_URL = process.env.REDIS_URL;
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const IS_TEST = process.env.NODE_ENV === 'test';

console.log('🔧 Redis URL:', REDIS_URL ? 'SET' : 'NOT SET');
console.log('🔧 Stripe API Key:', STRIPE_API_KEY ? 'SET' : 'NOT SET');
console.log('🔧 Is Test:', IS_TEST);

const customModules = [
  {
    resolve: './src/modules/menu',
    options: {},
  },
  {
    resolve: './src/modules/chef-event',
    options: {},
  },
]

// Temporarily use in-memory modules to avoid Redis authentication issues
const cacheModule = IS_TEST
  ? { resolve: '@medusajs/medusa/cache-inmemory' }
  : {
      resolve: '@medusajs/medusa/cache-redis',
      options: {
        redisUrl: REDIS_URL,
      },
    };

const eventBusModule = IS_TEST
  ? { resolve: '@medusajs/medusa/event-bus-local' }
  : {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: REDIS_URL,
      },
    };

const workflowEngineModule = IS_TEST
  ? { resolve: '@medusajs/medusa/workflow-engine-inmemory' }
  : {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        },
      },
    };

console.log('🔧 Cache module:', cacheModule.resolve);
console.log('🔧 Event bus module:', eventBusModule.resolve);
console.log('🔧 Workflow engine module:', workflowEngineModule.resolve);

const notificationModule = {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    };

console.log('🔧 Creating project configuration...');

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      ssl: false,
    },
    redisUrl: REDIS_URL,
    redisPrefix: process.env.REDIS_PREFIX,
    // ADD WORKER MODE CONFIGURATION
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
    http: {
      storeCors: process.env.STORE_CORS || '',
      adminCors: process.env.ADMIN_CORS || '',
      authCors: process.env.AUTH_CORS || '',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  // plugins: [
  //   {
  //     resolve: '@lambdacurry/medusa-product-reviews',
  //     options: {

  //     },
  //   },
  // ],
  modules: [
    ...customModules,
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: STRIPE_API_KEY,
            },
          },
        ],
      },
    },
    cacheModule,
    eventBusModule,
    workflowEngineModule,
    notificationModule,
  ],
  admin: {
    // ADD ADMIN DISABLE CONFIGURATION
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.ADMIN_BACKEND_URL,
    vite: () => {
      return {
        optimizeDeps: {
          include: ['@lambdacurry/medusa-plugins-sdk'],
        },
      };
    },
  },
});

console.log('🔧 Medusa configuration loaded successfully!');



