'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import api from '@/lib/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  // Fetch unread notification counts dynamically
  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      const fetchUnreadCount = async () => {
        try {
          const res = await api.get('/api/notifications')
          setUnreadNotifications(res.data.unreadCount || 0)
        } catch (error) {
          console.log('Error fetching notification count:', error)
        }
      }
      fetchUnreadCount()

      // Poll every 30 seconds for live order state notifications
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const navLinks = [
    { label: 'Menu', path: '/menu', icon: '🍵' },
    { label: 'Orders', path: '/orders', icon: '📋' },
    { label: 'Notifications', path: '/notifications', icon: '🔔', badge: unreadNotifications },
    { label: 'Cart', path: '/cart', icon: '🛒', badge: itemCount }
  ]

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'

  return (
    <header className="bg-white border-b border-stone-100 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => router.push(isAdmin ? '/admin/orders' : '/menu')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-9 h-9 bg-amber-800 rounded-xl flex items-center justify-center text-xl shadow-md shadow-amber-900/10">
            <span>🍵</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-amber-950 bg-gradient-to-r from-amber-900 to-amber-800 bg-clip-text text-transparent">
            Chai Adda
          </span>
        </div>

        {/* Desktop Navigation Links */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => router.push(link.path)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                  {(link.badge ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        )}

        {/* Profile Avatar / Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile navigation toggle */}
          {!isAdmin && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative p-2 hover:bg-stone-50 rounded-xl text-stone-600 transition"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
              {(unreadNotifications > 0 || itemCount > 0) && !isMobileMenuOpen && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
              )}
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-9 h-9 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md transition transform hover:scale-105"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </button>

            {isProfileDropdownOpen && (
              <>
                <div 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-stone-50">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-stone-800 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false)
                      logout()
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Links */}
      {isMobileMenuOpen && !isAdmin && (
        <div className="md:hidden border-t border-stone-100 bg-white py-2 px-4 shadow-inner animate-in slide-in-from-top duration-150">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    router.push(link.path)
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                  {(link.badge ?? 0) > 0 && (
                    <span className="min-w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {link.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
