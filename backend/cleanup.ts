import prisma from './src/lib/prisma'

async function cleanup() {
  console.log('Cleaning up duplicate categories...')
  
  // Get all categories
  const categories = await prisma.menuCategory.findMany({
    orderBy: { displayOrder: 'asc' }
  })
  
  // Group by name
  const categoryMap = new Map<string, typeof categories[0]>()
  const duplicates: typeof categories[0][] = []
  
  for (const cat of categories) {
    if (categoryMap.has(cat.name.trim())) {
      duplicates.push(cat)
    } else {
      categoryMap.set(cat.name.trim(), cat)
    }
  }

  // Reassign items from duplicates to the main category
  for (const dup of duplicates) {
    const mainCat = categoryMap.get(dup.name.trim())
    if (mainCat) {
      // Update all items that belong to the duplicate category to point to the main one
      await prisma.menuItem.updateMany({
        where: { categoryId: dup.id },
        data: { categoryId: mainCat.id }
      })
      
      // Delete the duplicate category
      await prisma.menuCategory.delete({
        where: { id: dup.id }
      })
      console.log(`Merged and deleted duplicate category: ${dup.name}`)
    }
  }

  console.log('Cleanup completed!')
}

cleanup()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
