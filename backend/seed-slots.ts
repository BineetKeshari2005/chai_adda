import prisma from './src/lib/prisma'

async function seedSlots() {
  const existing = await prisma.timeSlot.count()
  if (existing === 0) {
    await prisma.timeSlot.createMany({
      data: [
        { label: 'Morning Break (10:00 - 10:30)', startTime: '10:00', endTime: '10:30', maxOrders: 20 },
        { label: 'Lunch Rush (13:00 - 14:00)', startTime: '13:00', endTime: '14:00', maxOrders: 50 },
        { label: 'Evening Snacks (16:30 - 17:30)', startTime: '16:30', endTime: '17:30', maxOrders: 30 },
      ]
    })
    console.log('Slots created!')
  } else {
    console.log('Slots already exist.')
  }
}
seedSlots().catch(console.error).finally(() => prisma.$disconnect())
