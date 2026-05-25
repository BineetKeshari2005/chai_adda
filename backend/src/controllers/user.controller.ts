import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { phone, address } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: { phone, address }
    })

    return res.json({ user })
  } catch (err: any) {
    console.error('Update Profile Error:', err)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
      }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ user })
  } catch (err: any) {
    console.error('Get Profile Error:', err)
    return res.status(500).json({ error: 'Failed to fetch profile' })
  }
}
