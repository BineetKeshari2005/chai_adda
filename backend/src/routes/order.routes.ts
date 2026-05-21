import { Router } from 'express'
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getWaitTime
} from '../controllers/order.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// all order routes require login
router.get('/wait-time', protect, getWaitTime)
router.post('/', protect, placeOrder)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)

export default router