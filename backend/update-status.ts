import prisma from './src/lib/prisma'

async function updateStatus() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    // List all active orders to help the user
    console.log('--- Active Orders ---')
    const active = await prisma.order.findMany({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] } },
      include: { user: true }
    })
    if (active.length === 0) {
      console.log('No active orders found.')
    } else {
      active.forEach(o => {
        console.log(`[Token #${o.tokenNumber}] Order ID: ${o.id} | Status: ${o.status} | User: ${o.user.email}`)
      })
      console.log('\nTo update a status, run: npx ts-node update-status.ts <order_id> <NEW_STATUS>')
      console.log('Valid statuses: PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, CANCELLED')
    }
    return
  }

  if (args.length !== 2) {
    console.error('Usage: npx ts-node update-status.ts <order_id> <NEW_STATUS>')
    return
  }

  const orderId = args[0]
  const status = args[1].toUpperCase()

  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    console.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    return
  }

  try {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any }
    })
    console.log(`✅ Successfully updated Token #${updated.tokenNumber} to ${updated.status}`)
  } catch (error) {
    console.error('Failed to update order. Make sure the order ID is correct.')
  }
}

updateStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
