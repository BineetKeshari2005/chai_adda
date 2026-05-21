import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// GET /api/categories - anyone can see categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    })

    return res.status(200).json({ categories })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// POST /api/admin/categories - admin only
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, displayOrder } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    const category = await prisma.menuCategory.create({
      data: {
        name,
        displayOrder: displayOrder || 0
      }
    })

    return res.status(201).json({ category })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// PUT /api/admin/categories/:id - admin only
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { name, displayOrder, isActive } = req.body

    const category = await prisma.menuCategory.update({
      where: { id },
      data: { name, displayOrder, isActive }
    })

    return res.status(200).json({ category })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// DELETE /api/admin/categories/:id - admin only
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    await prisma.menuCategory.delete({ where: { id } })

    return res.status(200).json({ message: 'Category deleted' })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}