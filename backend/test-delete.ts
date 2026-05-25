import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const item = await prisma.menuItem.findFirst({
    where: { name: { contains: 'Rajma' } },
    include: { orderItems: true }
  })
  if (!item) return console.log('No item found');
  console.log('Item:', item.name, 'Orders:', item.orderItems.length)
}
main().catch(console.error)
