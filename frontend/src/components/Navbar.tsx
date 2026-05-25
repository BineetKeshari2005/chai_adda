'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import api from '@/lib/api'
import { Coffee, ClipboardList, Bell, ShoppingCart, LogOut, Menu, X, User as UserIcon } from 'lucide-react'

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
    { label: 'Menu', path: '/menu', icon: <Coffee className="w-4 h-4" /> },
    { label: 'Orders', path: '/orders', icon: <ClipboardList className="w-4 h-4" /> },
    { label: 'Notifications', path: '/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifications },
    { label: 'Cart', path: '/cart', icon: <ShoppingCart className="w-4 h-4" />, badge: itemCount }
  ]

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'

  return (
    <header className="bg-white/90 border-b border-stone-100 sticky top-0 z-40 shadow-sm backdrop-blur-md">
      <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => router.push(isAdmin ? '/admin/orders' : '/menu')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-700 to-amber-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-900/20 transition-transform group-hover:scale-105">
            <Coffee className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-950 to-amber-700">
            Chai Adda
          </span>
        </div>

        {/* Desktop Navigation Links */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-50/50 p-1 rounded-2xl border border-stone-100/50">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => router.push(link.path)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'bg-white text-amber-900 shadow-sm shadow-stone-200/50 ring-1 ring-stone-200'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  <span className={`${isActive ? 'text-amber-600' : 'text-stone-400'}`}>{link.icon}</span>
                  <span>{link.label}</span>
                  {(link.badge ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 border-2 border-white shadow-sm shadow-rose-500/30 animate-pulse">
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
              className="md:hidden relative p-2.5 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {(unreadNotifications > 0 || itemCount > 0) && !isMobileMenuOpen && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-10 h-10 bg-gradient-to-br from-stone-800 to-stone-950 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-stone-900/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-stone-900/20 border-2 border-white ring-2 ring-transparent hover:ring-stone-100"
            >
              {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </button>

            {isProfileDropdownOpen && (
              <>
                <div 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute right-0 mt-3 w-64 bg-white/80 backdrop-blur-xl border border-stone-100/50 rounded-2xl shadow-2xl shadow-stone-900/10 z-20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-5 py-4 bg-gradient-to-br from-stone-50 to-white border-b border-stone-100/50">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-base font-black tracking-tight text-stone-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs font-medium text-stone-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="p-2 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false)
                        router.push('/profile')
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl flex items-center gap-3 font-semibold transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> 
                      My Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false)
                        logout()
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-3 font-semibold transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> 
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Links */}
      {isMobileMenuOpen && !isAdmin && (
        <div className="md:hidden border-t border-stone-100 bg-white/95 backdrop-blur-md py-3 px-4 shadow-inner animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    router.push(link.path)
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-amber-500' : 'text-stone-400'}`}>{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                  {(link.badge ?? 0) > 0 && (
                    <span className="min-w-[24px] h-6 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-2 shadow-sm shadow-rose-500/20">
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
