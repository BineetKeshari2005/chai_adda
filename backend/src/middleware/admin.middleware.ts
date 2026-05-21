import { Request, Response, NextFunction } from 'express'

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).userRole

  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access only' })
  }

  next()
}