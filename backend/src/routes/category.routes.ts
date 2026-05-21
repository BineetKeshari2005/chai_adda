import { Router } from 'express'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller'
import { protect } from '../middleware/auth.middleware'
import { adminOnly } from '../middleware/admin.middleware'

const router = Router()

// public - any student can see categories
router.get('/', getCategories)

// admin only - must be logged in AND be an admin
router.post('/', protect, adminOnly, createCategory)
router.put('/:id', protect, adminOnly, updateCategory)
router.delete('/:id', protect, adminOnly, deleteCategory)

export default router