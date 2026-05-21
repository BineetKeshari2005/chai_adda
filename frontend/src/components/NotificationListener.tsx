'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/context/SocketContext'
import { Bell, X, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface ToastNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
}

export function NotificationListener() {
  const { socket } = useSocket()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  useEffect(() => {
    if (!socket || !user) return

    // If student, listen for order updates
    if (user.role === 'STUDENT') {
      socket.on('orderStatusUpdated', (order: any) => {
        let type: 'info' | 'success' | 'warning' = 'info'
        let title = 'Order Update'
        let message = `Order #${order.tokenNumber} is now ${order.status}`

        if (order.status === 'READY') {
          type = 'success'
          title = 'Order Ready! ☕'
          message = `Order #${order.tokenNumber} is ready for pickup at the counter.`
        } else if (order.status === 'CANCELLED') {
          type = 'warning'
          title = 'Order Cancelled'
          message = `Sorry, your order #${order.tokenNumber} has been cancelled.`
        } else if (order.status === 'PREPARING') {
          title = 'Preparing Order'
          message = `Your order #${order.tokenNumber} is being prepared.`
        }

        const newNotif = {
          id: Math.random().toString(36).substring(7),
          title,
          message,
          type
        }

        setNotifications(prev => [...prev, newNotif])

        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id))
        }, 5000)
      })
    }

    return () => {
      socket.off('orderStatusUpdated')
    }
  }, [socket, user])

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.map(notif => (
        <div 
          key={notif.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border animate-in slide-in-from-right-8 duration-300 ${
            notif.type === 'success' ? 'bg-green-50 border-green-200' :
            notif.type === 'warning' ? 'bg-red-50 border-red-200' :
            'bg-white border-stone-200'
          }`}
        >
          <div className={`mt-0.5 ${
            notif.type === 'success' ? 'text-green-500' :
            notif.type === 'warning' ? 'text-red-500' :
            'text-blue-500'
          }`}>
            {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
             notif.type === 'warning' ? <Bell className="w-5 h-5" /> :
             <Clock className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-sm ${
              notif.type === 'success' ? 'text-green-900' :
              notif.type === 'warning' ? 'text-red-900' :
              'text-stone-900'
            }`}>{notif.title}</h4>
            <p className={`text-sm mt-1 leading-snug ${
              notif.type === 'success' ? 'text-green-700' :
              notif.type === 'warning' ? 'text-red-700' :
              'text-stone-600'
            }`}>{notif.message}</p>
          </div>
          <button 
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
