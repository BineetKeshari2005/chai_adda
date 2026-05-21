import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// GET /api/notifications — student fetches their notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    })

    return res.status(200).json({ notifications, unreadCount })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// PATCH /api/notifications/:id — mark single notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = (req as any).userId

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    })

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    return res.status(200).json({ notification })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// PATCH /api/notifications/read-all — mark all as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })

    return res.status(200).json({ message: 'All notifications marked as read' })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}