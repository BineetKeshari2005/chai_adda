import { Router } from 'express'
import multer from 'multer'
import cloudinary from '../lib/cloudinary'

const router = Router()

// Use memory storage to process the file and upload to cloudinary
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'chai_adda' },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error)
          return res.status(500).json({ error: 'Upload failed' })
        }
        res.json({ url: result.secure_url })
      }
    )

    uploadStream.end(req.file.buffer)
  } catch (error) {
    console.error('Upload handler error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
