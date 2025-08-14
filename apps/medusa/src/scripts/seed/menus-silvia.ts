import type { ExecArgs } from '@medusajs/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

// Minimal types for menu seeding
export interface MenuSeedData {
  name: string
  courses: {
    name: string
    dishes: {
      name: string
      description?: string
      ingredients: { name: string; optional?: boolean }[]
    }[]
  }[]
}

// Chef Silvia themed menus (5)
export const menuDefinitions: MenuSeedData[] = [
  {
    name: 'Miami Coastal Tasting',
    courses: [
      {
        name: 'Starters',
        dishes: [
          {
            name: 'Citrus-Cured Snapper',
            description: 'Local snapper cured with grapefruit and lime, jalapeño, and cilantro.',
            ingredients: [
              { name: 'Snapper' },
              { name: 'Grapefruit' },
              { name: 'Lime' },
              { name: 'Jalapeño' },
              { name: 'Cilantro' },
              { name: 'Sea salt' },
            ],
          },
          {
            name: 'Plantain Tostones + Avocado Mousse',
            description: 'Crispy tostones topped with silky avocado, pickled onion, and micro herbs.',
            ingredients: [
              { name: 'Plantains' },
              { name: 'Avocado' },
              { name: 'Lime' },
              { name: 'Pickled red onion' },
              { name: 'Micro herbs' },
            ],
          },
        ],
      },
      {
        name: 'Mains',
        dishes: [
          {
            name: 'Mojo-Seared Grouper',
            description: 'Charred citrus-garlic mojo, grilled pineapple, herbed coconut rice.',
            ingredients: [
              { name: 'Grouper' },
              { name: 'Garlic' },
              { name: 'Orange' },
              { name: 'Lime' },
              { name: 'Cilantro' },
              { name: 'Pineapple' },
              { name: 'Coconut rice' },
            ],
          },
          {
            name: 'Cuban-French Roast Chicken',
            description: 'Adobo + herbes de Provence, charred lemon, pan jus.',
            ingredients: [
              { name: 'Chicken' },
              { name: 'Herbes de Provence' },
              { name: 'Adobo' },
              { name: 'Lemon' },
              { name: 'Butter' },
            ],
          },
        ],
      },
      {
        name: 'Dessert',
        dishes: [
          {
            name: 'Key Lime Crémeux',
            description: 'Key lime custard, coconut sable, torched meringue.',
            ingredients: [
              { name: 'Key lime' },
              { name: 'Eggs' },
              { name: 'Sugar' },
              { name: 'Butter' },
              { name: 'Coconut' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Cuban–French Fusion',
    courses: [
      {
        name: 'Amuse-Bouche',
        dishes: [
          {
            name: 'Croqueta Lyonnaise',
            description: 'Ham croquette with Dijon aioli and herbs.',
            ingredients: [
              { name: 'Ham' },
              { name: 'Breadcrumbs' },
              { name: 'Dijon' },
              { name: 'Parsley' },
            ],
          },
        ],
      },
      {
        name: 'Entrées',
        dishes: [
          {
            name: 'Sofrito Coq au Vin',
            description: 'Red wine braised chicken with sofrito aromatics and mushrooms.',
            ingredients: [
              { name: 'Chicken' },
              { name: 'Red wine' },
              { name: 'Sofrito' },
              { name: 'Mushrooms' },
              { name: 'Thyme' },
            ],
          },
          {
            name: 'Yuca Dauphinoise',
            description: 'Yuca layered with cream and Gruyère, baked golden.',
            ingredients: [
              { name: 'Yuca' },
              { name: 'Cream' },
              { name: 'Gruyère' },
              { name: 'Nutmeg' },
            ],
          },
        ],
      },
      {
        name: 'Sweet Finish',
        dishes: [
          {
            name: 'Pastelito Mille-Feuille',
            description: 'Guava cream mille-feuille with powdered sugar.',
            ingredients: [
              { name: 'Puff pastry' },
              { name: 'Guava paste' },
              { name: 'Cream cheese' },
              { name: 'Sugar' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Garden-to-Table Chef’s Dinner',
    courses: [
      {
        name: 'First Course',
        dishes: [
          {
            name: 'Heirloom Tomato Carpaccio',
            description: 'Basil oil, flaky salt, aged balsamic.',
            ingredients: [
              { name: 'Heirloom tomato' },
              { name: 'Basil' },
              { name: 'Olive oil' },
              { name: 'Balsamic' },
            ],
          },
        ],
      },
      {
        name: 'Second Course',
        dishes: [
          {
            name: 'Roasted Beet + Citrus Salad',
            description: 'Goat cheese, pistachio, orange blossom honey.',
            ingredients: [
              { name: 'Beets' },
              { name: 'Orange' },
              { name: 'Goat cheese' },
              { name: 'Pistachio' },
            ],
          },
        ],
      },
      {
        name: 'Main',
        dishes: [
          {
            name: 'Herb-Crusted Cauliflower Steak',
            description: 'Romescu sauce, toasted almonds, lemon.',
            ingredients: [
              { name: 'Cauliflower' },
              { name: 'Almonds' },
              { name: 'Peppers' },
              { name: 'Lemon' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Mediterranean Breeze',
    courses: [
      {
        name: 'Tapas',
        dishes: [
          {
            name: 'Marinated Olives + Citrus Zest',
            ingredients: [
              { name: 'Olives' },
              { name: 'Orange zest' },
              { name: 'Lemon zest' },
              { name: 'Chili' },
            ],
          },
          {
            name: 'Whipped Feta + Herb Pita',
            ingredients: [
              { name: 'Feta' },
              { name: 'Yogurt' },
              { name: 'Dill' },
              { name: 'Pita' },
            ],
          },
        ],
      },
      {
        name: 'Plates',
        dishes: [
          {
            name: 'Lemon-Oregano Chicken Skewers',
            ingredients: [
              { name: 'Chicken' },
              { name: 'Lemon' },
              { name: 'Oregano' },
              { name: 'Garlic' },
            ],
          },
          {
            name: 'Herbed Couscous',
            ingredients: [
              { name: 'Couscous' },
              { name: 'Parsley' },
              { name: 'Mint' },
              { name: 'Olive oil' },
            ],
          },
        ],
      },
      {
        name: 'Finish',
        dishes: [
          {
            name: 'Orange Blossom Semolina Cake',
            ingredients: [
              { name: 'Semolina' },
              { name: 'Orange blossom' },
              { name: 'Sugar' },
              { name: 'Yogurt' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Plant-Based Elegance',
    courses: [
      {
        name: 'Small Plates',
        dishes: [
          {
            name: 'Charred Broccolini + Romesco',
            ingredients: [
              { name: 'Broccolini' },
              { name: 'Almonds' },
              { name: 'Tomato' },
              { name: 'Smoked paprika' },
            ],
          },
          {
            name: 'Chilled Melon Soup',
            ingredients: [
              { name: 'Cantaloupe' },
              { name: 'Mint' },
              { name: 'Lime' },
              { name: 'Coconut milk', optional: true },
            ],
          },
        ],
      },
      {
        name: 'Main Course',
        dishes: [
          {
            name: 'Mushroom Farro Risotto',
            description: 'Creamy farro with wild mushrooms, thyme, and lemon zest.',
            ingredients: [
              { name: 'Farro' },
              { name: 'Mushrooms' },
              { name: 'Thyme' },
              { name: 'Vegetable stock' },
            ],
          },
        ],
      },
      {
        name: 'Dessert',
        dishes: [
          {
            name: 'Chocolate–Avocado Mousse',
            ingredients: [
              { name: 'Dark chocolate' },
              { name: 'Avocado' },
              { name: 'Coconut cream' },
              { name: 'Vanilla' },
            ],
          },
        ],
      },
    ],
  },
]

// Seeding logic (same pattern as existing menus.ts, but local to this file)
export const seedMenuEntities = async (menuModuleService: any): Promise<{ id: string; name: string }[]> => {
  const createdMenus: { id: string; name: string }[] = []

  for (const menuDefinition of menuDefinitions) {
    try {
      const [createdMenu] = await menuModuleService.createMenus([
        {
          name: menuDefinition.name,
        },
      ])

      // Create courses
      for (const courseDefinition of menuDefinition.courses) {
        const [createdCourse] = await menuModuleService.createCourses([
          {
            name: courseDefinition.name,
            menu_id: createdMenu.id,
          },
        ])

        // Create dishes
        for (const dishDefinition of courseDefinition.dishes) {
          const [createdDish] = await menuModuleService.createDishes([
            {
              name: dishDefinition.name,
              description: dishDefinition.description || null,
              course_id: createdCourse.id,
            },
          ])

          const ingredientData = dishDefinition.ingredients.map((i) => ({
            name: i.name,
            optional: i.optional || false,
            dish_id: createdDish.id,
          }))

          if (ingredientData.length > 0) {
            await menuModuleService.createIngredients(ingredientData)
          }
        }
      }

      createdMenus.push({ id: createdMenu.id, name: createdMenu.name })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error creating menu ${menuDefinition.name}:`, error)
    }
  }

  return createdMenus
}

// Default export for Medusa CLI execution
export default async function seedMenuData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    logger.info('Starting Chef Silvia menus seeding...')
    const menuModuleService = container.resolve('menuModuleService')
    const createdMenus = await seedMenuEntities(menuModuleService)

    logger.info(`Successfully created ${createdMenus.length} menus:`)
    createdMenus.forEach((m) => logger.info(`- ${m.name} (ID: ${m.id})`))
    logger.info('Chef Silvia menus seeding completed successfully!')
  } catch (error) {
    logger.error(`Error seeding Chef Silvia menu data: ${error}`)
    throw error
  }
}

