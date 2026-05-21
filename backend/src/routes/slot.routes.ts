import { Router } from 'express'
import { getAvailableSlots } from '../controllers/slot.controller'

const router = Router()

// public — any logged in student can see available slots
router.get('/available', getAvailableSlots)

export default router