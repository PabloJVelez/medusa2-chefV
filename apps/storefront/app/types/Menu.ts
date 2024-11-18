export type Ingredient = {
  name: string;
  optional?: boolean;
};

export type Dish = {
  name: string;
  description?: string;
  ingredients: Ingredient[];
};

export type Course = {
  name: string;
  dishes: Dish[];
};

export type Menu = {
  id: string;
  name: string;
  courses: Course[];
};

export const menus: Menu[] = [
  {
    id: "rehearsal",
    name: "Rehearsal Menu",
    courses: [
      {
        name: "Appetizer",
        dishes: [
          {
            name: "Ale and Rainbow Carrot Salad",
            description: "With pickled red onions and Champagne vinaigrette",
            ingredients: [
              { name: "rainbow carrots" },
              { name: "pickled red onions" },
              { name: "champagne vinaigrette" }
            ]
          }
        ]
      },
      {
        name: "Main Course",
        dishes: [
          {
            name: "New York Strip Steak and Lobster Tail",
            description: "With spices, olive oil, lemon, garlic and butter",
            ingredients: [
              { name: "new york strip steak" },
              { name: "lobster tail" },
              { name: "olive oil" },
              { name: "lemon" },
              { name: "garlic" },
              { name: "butter" }
            ]
          }
        ]
      },
      {
        name: "Sides",
        dishes: [
          {
            name: "Creamy Mashed Potatoes",
            description: "With butter, garlic and Truffle oil",
            ingredients: [
              { name: "potatoes" },
              { name: "butter" },
              { name: "garlic" },
              { name: "truffle oil" }
            ]
          },
          {
            name: "Roasted Brussels Sprouts",
            description: "With a Balsamic Glaze",
            ingredients: [
              { name: "brussels sprouts" },
              { name: "balsamic glaze" }
            ]
          }
        ]
      },
      {
        name: "Dessert",
        dishes: [
          {
            name: "Mini Pecan Pie",
            ingredients: [
              { name: "pecans" },
              { name: "pie crust" },
              { name: "filling" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "french-tour",
    name: "French Tour",
    courses: [
      {
        name: "Appetizer",
        dishes: [
          {
            name: "Endive and Poached Pear Salad",
            description: "With shallots, toasted hazelnuts and citrus vinaigrette",
            ingredients: [
              { name: "endive" },
              { name: "poached pear" },
              { name: "shallots" },
              { name: "toasted hazelnuts" },
              { name: "citrus vinaigrette" }
            ]
          }
        ]
      },
      {
        name: "Side",
        dishes: [
          {
            name: "Pan-Roasted Bacon Brussels Sprouts",
            description: "With shallots, Normandy vinegar and honey glaze",
            ingredients: [
              { name: "brussels sprouts" },
              { name: "bacon" },
              { name: "shallots" },
              { name: "Normandy vinegar" },
              { name: "honey" }
            ]
          }
        ]
      },
      {
        name: "Main Course",
        dishes: [
          {
            name: "Steak au Poivre",
            description: "With peppercorns",
            ingredients: [
              { name: "steak" },
              { name: "peppercorns" }
            ]
          },
          {
            name: "Muffin Tin Potatoes Dauphinoise",
            description: "With heavy cream, Gruyère cheese and garlic",
            ingredients: [
              { name: "potatoes" },
              { name: "heavy cream" },
              { name: "Gruyère cheese" },
              { name: "garlic" }
            ]
          }
        ]
      },
      {
        name: "Dessert",
        dishes: [
          {
            name: "Pots de Crème",
            description: "With bittersweet chocolate, sugar, heavy cream and eggs",
            ingredients: [
              { name: "bittersweet chocolate" },
              { name: "sugar" },
              { name: "heavy cream" },
              { name: "eggs" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "new-orleans",
    name: "New Orleans Delight",
    courses: [
      {
        name: "Appetizer",
        dishes: [
          {
            name: "Shrimp Boil Skewers",
            description: "With beef sausage, onions pepper",
            ingredients: [
              { name: "shrimp" },
              { name: "beef sausage" },
              { name: "onions" },
              { name: "pepper" }
            ]
          }
        ]
      },
      {
        name: "Main Courses",
        dishes: [
          {
            name: "Buttermilk Honey Fried Chicken",
            description: "With spices",
            ingredients: [
              { name: "chicken" },
              { name: "buttermilk" },
              { name: "honey" },
              { name: "spices" }
            ]
          },
          {
            name: "Lobster Jambalaya",
            description: "With rice, onions, peppers and spices",
            ingredients: [
              { name: "lobster" },
              { name: "rice" },
              { name: "onions" },
              { name: "peppers" },
              { name: "spices" }
            ]
          }
        ]
      },
      {
        name: "Side",
        dishes: [
          {
            name: "Spicy Green Beans",
            description: "With red onions, bell peppers, cayenne pepper and spices",
            ingredients: [
              { name: "green beans" },
              { name: "red onions" },
              { name: "bell peppers" },
              { name: "cayenne pepper" },
              { name: "spices" }
            ]
          }
        ]
      },
      {
        name: "Dessert",
        dishes: [
          {
            name: "Sweet Potato Tartlets",
            description: "With yams, flour, sugar, brown sugar, butter and cream",
            ingredients: [
              { name: "yams" },
              { name: "flour" },
              { name: "sugar" },
              { name: "brown sugar" },
              { name: "butter" },
              { name: "cream" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "italian",
    name: "Flavors of Italy",
    courses: [
      {
        name: "Appetizer",
        dishes: [
          {
            name: "Tomato and Pesto Bruschetta With Brown Butter Crostini",
            description: "With basil, garlic, pine nuts, Parmesan cheese and balsamic glaze",
            ingredients: [
              { name: "tomatoes" },
              { name: "basil" },
              { name: "garlic" },
              { name: "pine nuts" },
              { name: "Parmesan cheese" },
              { name: "balsamic glaze" },
              { name: "crostini" }
            ]
          },
          {
            name: "Classic Caesar Salad",
            description: "With romaine lettuce, lemon, Parmesan cheese, Dijon and croutons",
            ingredients: [
              { name: "romaine lettuce" },
              { name: "lemon" },
              { name: "Parmesan cheese" },
              { name: "Dijon" },
              { name: "croutons" }
            ]
          }
        ]
      },
      {
        name: "Main Course",
        dishes: [
          {
            name: "Chicken Piccata and Angel Hair Pasta",
            description: "With white wine and caper beurre blanc",
            ingredients: [
              { name: "chicken" },
              { name: "angel hair pasta" },
              { name: "white wine" },
              { name: "capers" },
              { name: "butter" },
              { name: "lemon" }
            ]
          }
        ]
      },
      {
        name: "Dessert",
        dishes: [
          {
            name: "Mini Tiramisu",
            description: "With chocolate, coffee, lady fingers and heavy cream",
            ingredients: [
              { name: "chocolate" },
              { name: "coffee" },
              { name: "lady fingers" },
              { name: "heavy cream" },
              { name: "mascarpone" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "tapas",
    name: "Tapas",
    courses: [
      {
        name: "Appetizer",
        dishes: [
          {
            name: "Grilled Peach Salad With a Lemony Vinaigrette",
            description: "With romaine lettuce, arugula, goat cheese or feta cheese and bacon",
            ingredients: [
              { name: "peaches" },
              { name: "romaine lettuce" },
              { name: "arugula" },
              { name: "goat cheese", optional: true },
              { name: "feta cheese", optional: true },
              { name: "bacon" },
              { name: "lemon vinaigrette" }
            ]
          },
          {
            name: "Wine-Glazed Wings",
            description: "With hot sauce, lemon juice, honey, garlic and thyme",
            ingredients: [
              { name: "chicken wings" },
              { name: "hot sauce" },
              { name: "lemon juice" },
              { name: "honey" },
              { name: "garlic" },
              { name: "thyme" }
            ]
          },
          {
            name: "Bruschetta",
            description: "With tomatoes, olive oil, balsamic vinaigrette, parsley and crostini",
            ingredients: [
              { name: "tomatoes" },
              { name: "olive oil" },
              { name: "balsamic vinaigrette" },
              { name: "parsley" },
              { name: "crostini" }
            ]
          }
        ]
      },
      {
        name: "Main Course",
        dishes: [
          {
            name: "Braised Short ribs",
            description: "Braised in red wine and herbs",
            ingredients: [
              { name: "short ribs" },
              { name: "red wine" },
              { name: "herbs" }
            ]
          }
        ]
      },
      {
        name: "Dessert",
        dishes: [
          {
            name: "Wine-Infused Vanilla Ice Cream",
            description: "With pinot noir, sugar, lemon juice, thyme, strawberries and chocolate",
            ingredients: [
              { name: "vanilla ice cream" },
              { name: "pinot noir" },
              { name: "sugar" },
              { name: "lemon juice" },
              { name: "thyme" },
              { name: "strawberries" },
              { name: "chocolate" }
            ]
          }
        ]
      }
    ]
  }
]; 