import prisma from './src/lib/prisma';

async function fix() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  for (let i = 0; i < orders.length; i++) {
    await prisma.order.update({
      where: { id: orders[i].id },
      data: { tokenNumber: i + 1 }
    });
  }
  console.log('Fixed tokens for today! Set them to 1 through ' + orders.length);
}

fix()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
