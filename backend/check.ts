import prisma from './src/lib/prisma'

async function check() {
  const categories = await prisma.menuCategory.findMany({ include: { items: true } })
  for (const cat of categories) {
    console.log(cat.name, cat.items.map(i => i.name))
  }
}

check().finally(() => prisma.$disconnect())
