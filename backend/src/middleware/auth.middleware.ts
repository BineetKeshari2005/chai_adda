import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET!
  
  console.log('=== PROTECT MIDDLEWARE ===')
  console.log('JWT_SECRET used to VERIFY:', JWT_SECRET?.substring(0, 10))
  console.log('Auth header:', req.headers.authorization?.substring(0, 20))
  
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  
  console.log('Token first 20 chars:', token.substring(0, 20))

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string }
    console.log('Decoded role:', decoded.role)
    ;(req as any).userId = decoded.userId
    ;(req as any).userRole = decoded.role
    next()
  } catch (err) {
    console.log('JWT verify error:', err)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}