import { Router } from 'express'
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem
} from '../controllers/menu.controller'
import { protect } from '../middleware/auth.middleware'
import { adminOnly } from '../middleware/admin.middleware'

const router = Router()

// public routes - anyone can view menu
router.get('/', getMenuItems)
router.get('/:id', getMenuItem)

// admin only routes
router.post('/', protect, adminOnly, createMenuItem)
router.put('/:id', protect, adminOnly, updateMenuItem)
router.patch('/:id/toggle', protect, adminOnly, toggleAvailability)
router.delete('/:id', protect, adminOnly, deleteMenuItem)

export default router