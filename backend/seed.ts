import prisma from './src/lib/prisma'

async function main() {
  console.log('Seeding categories and items...')

  // Check if we already have items to avoid duplicating too much, 
  // but let's just add new categories and items.
  const chaiCoffee = await prisma.menuCategory.create({ data: { name: 'Chai & Coffee', displayOrder: 1 } })
  const snacks = await prisma.menuCategory.create({ data: { name: 'Snacks', displayOrder: 2 } })
  const meals = await prisma.menuCategory.create({ data: { name: 'Meals', displayOrder: 3 } })
  const drinks = await prisma.menuCategory.create({ data: { name: 'Drinks', displayOrder: 4 } })

  const items = [
    // Chai & Coffee
    { name: 'Adrak Chai', description: 'Strong tea brewed with fresh ginger.', price: 20, categoryId: chaiCoffee.id, isVeg: true },
    { name: 'Elaichi Chai', description: 'Aromatic cardamom flavored tea.', price: 25, categoryId: chaiCoffee.id, isVeg: true },
    { name: 'Cold Coffee', description: 'Thick and creamy cold coffee with chocolate syrup.', price: 60, categoryId: chaiCoffee.id, isVeg: true },
    { name: 'Lemon Honey Tea', description: 'Refreshing tea with fresh lemon and honey.', price: 30, categoryId: chaiCoffee.id, isVeg: true },
    
    // Snacks
    { name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes.', price: 15, categoryId: snacks.id, isVeg: true },
    { name: 'Bread Omelette', description: 'Classic street style bread omelette.', price: 40, categoryId: snacks.id, isVeg: false },
    { name: 'Maggi', description: 'Spicy masala maggi noodles.', price: 35, categoryId: snacks.id, isVeg: true },
    { name: 'Veg Puff', description: 'Flaky puff pastry with mixed vegetable filling.', price: 20, categoryId: snacks.id, isVeg: true },
    { name: 'Paneer Sandwich', description: 'Grilled sandwich with spiced paneer filling.', price: 50, categoryId: snacks.id, isVeg: true },
    
    // Meals
    { name: 'Veg Thali', description: 'Complete meal with roti, rice, dal, and sabzi.', price: 80, categoryId: meals.id, isVeg: true },
    { name: 'Rajma Chawal', description: 'Comforting red kidney beans curry with rice.', price: 70, categoryId: meals.id, isVeg: true },
    { name: 'Chole Bhature', description: 'Spicy chickpea curry served with fried bread.', price: 75, categoryId: meals.id, isVeg: true },
    { name: 'Egg Rice', description: 'Fried rice tossed with egg and spices.', price: 60, categoryId: meals.id, isVeg: false },
    
    // Drinks
    { name: 'Lassi', description: 'Sweet and thick yogurt-based drink.', price: 40, categoryId: drinks.id, isVeg: true },
    { name: 'Nimbu Pani', description: 'Refreshing sweet and salty lemonade.', price: 20, categoryId: drinks.id, isVeg: true },
    { name: 'Mango Shake', description: 'Thick milkshake made with fresh mangoes.', price: 50, categoryId: drinks.id, isVeg: true, isAvailable: false } // Keeping one out of stock
  ]

  for (const item of items) {
    await prisma.menuItem.create({
      data: item
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
