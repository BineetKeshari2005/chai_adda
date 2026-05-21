import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// POST /api/admin/slots — admin creates a slot
export const createSlot = async (req: Request, res: Response) => {
  try {
    const { label, startTime, endTime, maxOrders, date } = req.body

    if (!label || !startTime || !endTime || !maxOrders) {
      return res.status(400).json({ 
        error: 'Label, startTime, endTime and maxOrders are required' 
      })
    }

    const slot = await prisma.timeSlot.create({
      data: {
        label,
        startTime,
        endTime,
        maxOrders: parseInt(maxOrders),
        date: date ? new Date(date) : null,
        isActive: true
      }
    })

    return res.status(201).json({ slot })
  } catch (error) {
    console.log('CREATE SLOT ERROR:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/admin/slots — admin sees all slots
export const getAllSlots = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.timeSlot.findMany({
      orderBy: { startTime: 'asc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    const slotsWithCapacity = slots.map(slot => ({
      ...slot,
      currentOrders: slot._count.orders,
      remainingCapacity: slot.maxOrders - slot._count.orders
    }))

    return res.status(200).json({ slots: slotsWithCapacity })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/slots/available — student sees only available slots
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { startTime: 'asc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    // only return slots that still have capacity
    const availableSlots = slots
      .filter(slot => slot._count.orders < slot.maxOrders)
      .map(slot => ({
        id: slot.id,
        label: slot.label,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxOrders: slot.maxOrders,
        remainingCapacity: slot.maxOrders - slot._count.orders
      }))

    return res.status(200).json({ slots: availableSlots })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// PATCH /api/admin/slots/:id — admin edits a slot
export const updateSlot = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { label, startTime, endTime, maxOrders, isActive } = req.body

    const slot = await prisma.timeSlot.update({
      where: { id },
      data: {
        label,
        startTime,
        endTime,
        maxOrders: maxOrders ? parseInt(maxOrders) : undefined,
        isActive
      }
    })

    return res.status(200).json({ slot })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// DELETE /api/admin/slots/:id — admin removes a slot
export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    await prisma.timeSlot.delete({ where: { id } })

    return res.status(200).json({ message: 'Slot deleted' })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}