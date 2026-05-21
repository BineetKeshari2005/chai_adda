import { Router } from 'express'
import {
  createPayment,
  verifyPayment,
  getPaymentStatus
} from '../controllers/payment.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// all payment routes require login
router.post('/create', protect, createPayment)
router.post('/verify', protect, verifyPayment)
router.get('/:orderId', protect, getPaymentStatus)

export default router