import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: 'http://localhost:3000' }))
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

app.listen(PORT, () => {
  console.log(`Chai Adda API running on http://localhost:${PORT}`)
})