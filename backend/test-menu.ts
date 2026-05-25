import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const item = await prisma.menuItem.create({
    data: {
      name: 'Test Item',
      price: 10,
      categoryId: "dummy",
      isFeatured: true
    }
  }).catch(e => console.log('Prisma Error:', e.message))
  console.log('SUCCESS')
}
main().catch(console.error)
