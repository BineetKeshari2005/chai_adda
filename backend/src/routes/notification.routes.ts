import { Router } from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// all notification routes require login
router.get('/', protect, getNotifications)
router.patch('/read-all', protect, markAllAsRead)
router.patch('/:id', protect, markAsRead)

export default router