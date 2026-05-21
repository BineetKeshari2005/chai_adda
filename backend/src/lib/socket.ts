import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'

let io: Server

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error: Token missing'))
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any
      ;(socket as any).user = decoded
      next()
    } catch (err) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const user = (socket as any).user
    
    // Join room based on user role/ID
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      socket.join('admin')
      console.log(`Admin ${user.userId} connected to socket`)
    } else {
      socket.join(`user_${user.userId}`)
      console.log(`User ${user.userId} connected to socket`)
    }

    socket.on('disconnect', () => {
      console.log(`User ${user.userId} disconnected from socket`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized')
  }
  return io
}
