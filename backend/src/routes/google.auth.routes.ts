import { Router } from 'express'
import { googleAuth, googleCallback } from '../controllers/google.auth.controller'

const router = Router()

// redirect to Google login page
router.get('/google', googleAuth)

// Google redirects back here after login
router.get('/google/callback', googleCallback)

export default router
