import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import { updateProfile, getProfile } from '../controllers/user.controller'

const router = Router()

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)

export default router
