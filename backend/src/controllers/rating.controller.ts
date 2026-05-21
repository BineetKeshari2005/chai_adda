import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// POST /api/ratings — student rates an item
export const createRating = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { orderItemId, stars, comment } = req.body

    if (!orderItemId || !stars) {
      return res.status(400).json({ error: 'orderItemId and stars are required' })
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Stars must be between 1 and 5' })
    }

    // fetch the order item
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true }
    })

    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' })
    }

    // make sure this order belongs to the student
    if (orderItem.order.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // make sure order is picked up before rating
    if (orderItem.order.status !== 'PICKED_UP') {
      return res.status(400).json({ 
        error: 'You can only rate items after your order is picked up' 
      })
    }

    // check if already rated
    const existingRating = await prisma.rating.findFirst({
      where: { orderItemId, userId }
    })

    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this item' })
    }

    // create the rating
    const rating = await prisma.rating.create({
      data: {
        userId,
        orderItemId,
        menuItemId: orderItem.menuItemId,
        stars,
        comment: comment || null
      }
    })

    // update avgRating on the menu item
    const allRatings = await prisma.rating.aggregate({
      where: { menuItemId: orderItem.menuItemId },
      _avg: { stars: true },
      _count: { stars: true }
    })

    await prisma.menuItem.update({
      where: { id: orderItem.menuItemId },
      data: { avgRating: allRatings._avg.stars || 0 }
    })

    return res.status(201).json({
      rating,
      message: 'Thanks for your rating!',
      newAvgRating: allRatings._avg.stars
    })
  } catch (error) {
    console.log('RATING ERROR:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/ratings/item/:menuItemId — get all ratings for a menu item
export const getItemRatings = async (req: Request, res: Response) => {
  try {
    const menuItemId = req.params.menuItemId as string

    const ratings = await prisma.rating.findMany({
      where: { menuItemId },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const aggregate = await prisma.rating.aggregate({
      where: { menuItemId },
      _avg: { stars: true },
      _count: { stars: true }
    })

    return res.status(200).json({
      ratings,
      totalRatings: aggregate._count.stars,
      avgRating: aggregate._avg.stars || 0
    })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}