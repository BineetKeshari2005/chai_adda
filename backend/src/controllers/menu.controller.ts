import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// GET /api/menu - anyone can see menu
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ items })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/menu/:id - single item detail
export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    return res.status(200).json({ item })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// POST /api/admin/menu - admin adds new item
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, categoryId, imageUrl, isVeg } = req.body

    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Name, price and category are required' })
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        imageUrl,
        isVeg: isVeg ?? true
      },
      include: { category: true }
    })

    return res.status(201).json({ item })
  } catch (error) {
    console.log('CREATE MENU ERROR:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// PUT /api/admin/menu/:id - admin edits item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { name, description, price, categoryId, imageUrl, isVeg } = req.body

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        categoryId,
        imageUrl,
        isVeg
      },
      include: { category: true }
    })

    return res.status(200).json({ item })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// PATCH /api/admin/menu/:id/toggle - mark sold out or available
export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const current = await prisma.menuItem.findUnique({ where: { id } })

    if (!current) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !current.isAvailable }
    })

    return res.status(200).json({
      item,
      message: item.isAvailable ? 'Item is now available' : 'Item marked as sold out'
    })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// DELETE /api/admin/menu/:id - admin removes item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    await prisma.menuItem.delete({ where: { id } })

    return res.status(200).json({ message: 'Item deleted' })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}