import { Router } from 'express'
import {
  createSlot,
  getAllSlots,
  updateSlot,
  deleteSlot
} from '../controllers/slot.controller'
import { protect } from '../middleware/auth.middleware'
import { adminOnly } from '../middleware/admin.middleware'

const router = Router()

router.get('/', protect, adminOnly, getAllSlots)
router.post('/', protect, adminOnly, createSlot)
router.patch('/:id', protect, adminOnly, updateSlot)
router.delete('/:id', protect, adminOnly, deleteSlot)

export default router