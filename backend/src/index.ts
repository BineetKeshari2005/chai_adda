import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import categoryRoutes from './routes/category.routes'
import menuRoutes from './routes/menu.routes'
import orderRoutes from './routes/order.routes'
import adminOrderRoutes from './routes/admin.order.routes'
import paymentRoutes from './routes/payment.routes'
import slotRoutes from './routes/slot.routes'
import adminSlotRoutes from './routes/admin.slot.routes'
import ratingRoutes from './routes/rating.routes'
import notificationRoutes from './routes/notification.routes'
import googleAuthRoutes from './routes/google.auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'Chai Adda API',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/auth', googleAuthRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/slots', slotRoutes)
app.use('/api/admin/slots', adminSlotRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/notifications', notificationRoutes)
app.listen(PORT, () => {
  console.log(`Chai Adda API running on http://localhost:${PORT}`)
})