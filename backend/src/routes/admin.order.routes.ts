import { Router } from 'express'
import {
  getAdminOrders,
  updateOrderStatus
} from '../controllers/order.controller'
import { protect } from '../middleware/auth.middleware'
import { adminOnly } from '../middleware/admin.middleware'

const router = Router()

// all admin order routes require login + admin role
router.get('/', protect, adminOnly, getAdminOrders)
router.patch('/:id/status', protect, adminOnly, updateOrderStatus)

export default router