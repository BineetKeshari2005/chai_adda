'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Notification {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

export default function Notifications() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/notifications')
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unreadCount)
      } catch (err) {
        console.error('Failed to load notifications')
      }
    }

    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
            <h3 className="font-bold text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id, notification.read)}
                    className={`w-full text-left p-4 transition-colors ${notification.read ? 'bg-white hover:bg-stone-50' : 'bg-amber-50 hover:bg-amber-100/50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${notification.read ? 'font-medium text-stone-700' : 'font-bold text-stone-900'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0" />}
                    </div>
                    <p className={`text-xs ${notification.read ? 'text-stone-500' : 'text-stone-600'} leading-relaxed`}>
                      {notification.body}
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium mt-2">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
