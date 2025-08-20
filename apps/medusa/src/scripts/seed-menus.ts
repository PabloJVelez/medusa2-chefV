import type { ExecArgs } from '@medusajs/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { seedMenuEntities } from './seed/menus';

export default async function seedMenuData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    logger.info('Starting menu seeding...');
    
    // Get the menu module service
    const menuModuleService = container.resolve("menuModuleService");
    
    // Seed the menu entities
    const createdMenus = await seedMenuEntities(menuModuleService);
    
    logger.info(`Successfully created ${createdMenus.length} menus:`);
    createdMenus.forEach(menu => {
      logger.info(`- ${menu.name} (ID: ${menu.id})`);
    });
    
  } catch (error) {
    logger.error(`Error seeding menu data: ${error}`);
    throw error;
  }
} 