'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { Bell, CheckCircle2, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    try {
      await api.patch('/api/notifications/read-all')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return
    try {
      await api.patch(`/api/notifications/${id}`)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
              <p className="text-stone-500">Updates about your orders</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="bg-white border border-stone-200 text-stone-600 hover:text-stone-900 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-600" /> Mark all read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-100">
              <div className="w-16 h-16 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8" />
              </div>
              <p className="text-stone-500 font-medium">No new notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                onClick={() => markAsRead(notification.id, notification.read)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                  notification.read 
                    ? 'border-stone-100 opacity-70 hover:opacity-100' 
                    : 'border-amber-200 shadow-sm shadow-amber-900/5 hover:border-amber-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold ${notification.read ? 'text-stone-700' : 'text-stone-900'}`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-1.5 shrink-0 animate-pulse" />
                  )}
                </div>
                <p className="text-stone-500 text-sm">{notification.body}</p>
                <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider mt-3">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
