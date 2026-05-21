import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// helper function — generates next token number for today
const generateTokenNumber = async (): Promise<number> => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const lastOrder = await prisma.order.findFirst({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    orderBy: { tokenNumber: 'desc' }
  })

  return lastOrder ? lastOrder.tokenNumber + 1 : 1
}

// POST /api/orders — student places an order
// POST /api/orders — student places an order
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { items, scheduledFor, slotId, orderType } = req.body

    // validate orderType
    if (!orderType || !['INSTANT', 'SCHEDULED'].includes(orderType)) {
      return res.status(400).json({ error: 'orderType must be INSTANT or SCHEDULED' })
    }

    // if scheduled, slotId is required
    if (orderType === 'SCHEDULED' && !slotId) {
      return res.status(400).json({ error: 'slotId is required for scheduled orders' })
    }

    // if instant, no slotId allowed
    if (orderType === 'INSTANT' && slotId) {
      return res.status(400).json({ error: 'Instant orders cannot have a slot' })
    }

    // validate slot exists and has capacity
    if (orderType === 'SCHEDULED' && slotId) {
      const slot = await prisma.timeSlot.findUnique({
        where: { id: slotId },
        include: { _count: { select: { orders: true } } }
      })

      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' })
      }

      if (!slot.isActive) {
        return res.status(400).json({ error: 'This slot is no longer available' })
      }

      if (slot._count.orders >= slot.maxOrders) {
        return res.status(400).json({ error: 'This slot is full. Please pick another slot' })
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' })
    }

    // fetch all menu items to calculate total
    const menuItemIds = items.map((i: any) => i.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } }
    })

    if (menuItems.length !== items.length) {
      return res.status(400).json({ error: 'One or more items not found' })
    }

    // check all items are available
    const unavailable = menuItems.filter(m => !m.isAvailable)
    if (unavailable.length > 0) {
      return res.status(400).json({
        error: `These items are not available: ${unavailable.map(m => m.name).join(', ')}`
      })
    }

    // calculate total
    let total = 0
    const orderItemsData = items.map((i: any) => {
      const menuItem = menuItems.find(m => m.id === i.menuItemId)!
      const itemTotal = menuItem.price * i.quantity
      total += itemTotal
      return {
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        customization: i.customization || null,
        price: menuItem.price
      }
    })

    const tokenNumber = await generateTokenNumber()

    const order = await prisma.order.create({
      data: {
        userId,
        tokenNumber,
        total,
        orderType,
        status: 'PENDING',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        slotId: slotId || null,
        orderItems: {
          create: orderItemsData
        }
      },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        slot: true
      }
    })

    // calculate wait time for instant orders
    let waitTime = null
    if (orderType === 'INSTANT') {
      const activeOrders = await prisma.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
          orderType: 'INSTANT'
        }
      })
      // assume 3 mins per order average
      waitTime = activeOrders * 3
    }

    return res.status(201).json({
      order,
      message: orderType === 'INSTANT'
        ? `Order placed! Your token number is #${tokenNumber}. Estimated wait: ${waitTime} mins`
        : `Order scheduled! Your token number is #${tokenNumber}. Ready at ${order.slot?.label}`,
      tokenNumber,
      waitTime
    })
  } catch (error) {
    console.log('PLACE ORDER ERROR:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/orders/my — student sees their order history
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ orders })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/orders/:id — single order detail
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = (req as any).userId

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        payment: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // students can only see their own orders
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    return res.status(200).json({ order })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/admin/orders — admin sees full live queue
export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query

    const orders = await prisma.order.findMany({
      where: status ? { status: status as any } : {},
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        orderItems: {
          include: { menuItem: true }
        },
        payment: true
      },
      orderBy: { createdAt: 'asc' }
    })

    return res.status(200).json({ orders })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// PATCH /api/admin/orders/:id/status — admin updates order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { status } = req.body

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        orderItems: {
          include: { menuItem: true }
        }
      }
    })

    // create notification when order is READY or CANCELLED
    if (status === 'READY') {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          title: 'Your order is ready! ☕',
          body: `Order #${order.tokenNumber} is ready for pickup. Please collect it from the counter.`,
          read: false
        }
      })
    }

    if (status === 'CANCELLED') {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          title: 'Order cancelled',
          body: `Sorry, your order #${order.tokenNumber} has been cancelled.`,
          read: false
        }
      })
    }

    return res.status(200).json({
      order,
      message: `Order #${order.tokenNumber} is now ${status}`
    })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/orders/wait-time — estimated wait for instant orders
export const getWaitTime = async (req: Request, res: Response) => {
  try {
    const activeOrders = await prisma.order.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] as any},
        orderType: 'INSTANT' as any
      }
    })

    const estimatedWait = activeOrders * 3 // 3 mins per order

    return res.status(200).json({
      activeInstantOrders: activeOrders,
      estimatedWaitMinutes: estimatedWait,
      message: estimatedWait === 0
        ? 'No queue! Order now for instant service'
        : `Approx ${estimatedWait} min wait`
    })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}