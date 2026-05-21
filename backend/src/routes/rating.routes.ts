import { Router } from 'express'
import {
  createRating,
  getItemRatings
} from '../controllers/rating.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// student must be logged in to rate
router.post('/', protect, createRating)

// anyone can see item ratings
router.get('/item/:menuItemId', getItemRatings)

export default router