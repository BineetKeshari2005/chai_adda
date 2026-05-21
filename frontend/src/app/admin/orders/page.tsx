'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import { 
  LogOut, LayoutDashboard, Clock, 
  CheckCircle2, UtensilsCrossed, Settings, 
  RefreshCcw, AlertCircle, Loader2, Search
} from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  menuItem: { name: string }
}

interface Order {
  id: string
  tokenNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'CANCELLED'
  orderType: 'INSTANT' | 'SCHEDULED'
  total: number
  createdAt: string
  user: { name: string, email: string }
  orderItems: OrderItem[]
}

export default function AdminOrdersPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'HISTORY'>('ACTIVE')
  
  const { socket } = useSocket()

  useEffect(() => {
    if (socket) {
      socket.on('newOrder', (order: Order) => {
        setOrders(prev => {
          if (!prev.find(o => o.id === order.id)) {
            return [...prev, order].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          }
          return prev
        })
      })

      socket.on('orderStatusUpdated', (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o))
      })

      return () => {
        socket.off('newOrder')
        socket.off('orderStatusUpdated')
      }
    }
  }, [socket])

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        router.push('/menu')
      } else {
        fetchOrders()
      }
    }
  }, [user, isLoading, router])

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    setError('')
    try {
      const res = await api.get('/api/admin/orders')
      setOrders(res.data.orders)
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login')
      } else {
        setError('Failed to fetch orders')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus })
      // Update local state to reflect change immediately
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: res.data.order.status } : o))
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status))
  const historyOrders = orders.filter(o => ['PICKED_UP', 'CANCELLED'].includes(o.status))

  const displayedOrders = filter === 'ACTIVE' ? activeOrders : filter === 'HISTORY' ? historyOrders : orders

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col min-h-screen sticky top-0">
        <div className="p-6 border-b border-stone-800">
          <h2 className="text-white text-xl font-black tracking-tight mb-1 flex items-center gap-2">
            <span className="text-amber-500">☕</span> Chai Adda
          </h2>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-500">Staff Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-600 text-white font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Live Orders
          </button>
          <button 
            onClick={() => router.push('/admin/menu')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800 font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            Menu Settings
          </button>
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-stone-500 text-xs">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Kitchen Display</h1>
              <p className="text-stone-500 mt-1">Manage live tokens and update statuses</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-stone-200">
              <button 
                onClick={() => setFilter('ACTIVE')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'ACTIVE' ? 'bg-amber-100 text-amber-800' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                Active Queue ({activeOrders.length})
              </button>
              <button 
                onClick={() => setFilter('HISTORY')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'HISTORY' ? 'bg-stone-100 text-stone-800' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                History
              </button>
              <button 
                onClick={() => fetchOrders(true)}
                className="p-2 ml-2 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedOrders.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-stone-500 font-medium">No orders found in this view.</p>
              </div>
            ) : (
              displayedOrders.map(order => (
                <div key={order.id} className={`bg-white rounded-3xl p-6 shadow-sm border ${order.status === 'READY' ? 'border-green-400 ring-4 ring-green-50' : 'border-stone-200'} flex flex-col`}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Token</span>
                        {order.orderType === 'SCHEDULED' && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">SCH</span>
                        )}
                      </div>
                      <p className="text-4xl font-black text-stone-900">#{order.tokenNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        order.status === 'PENDING' ? 'bg-stone-100 text-stone-600' :
                        order.status === 'CONFIRMED' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'READY' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                        'bg-stone-100 text-stone-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 bg-stone-50 rounded-2xl p-4 mb-6">
                    <ul className="space-y-3">
                      {order.orderItems.map(item => (
                        <li key={item.id} className="flex justify-between items-start text-sm">
                          <span className="font-bold text-stone-800">
                            <span className="text-amber-600 mr-2">{item.quantity}x</span>
                            {item.menuItem.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    {order.status === 'CONFIRMED' || order.status === 'PENDING' ? (
                      <button 
                        onClick={() => updateStatus(order.id, 'PREPARING')}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <UtensilsCrossed className="w-5 h-5" /> Start Preparing
                      </button>
                    ) : order.status === 'PREPARING' ? (
                      <button 
                        onClick={() => updateStatus(order.id, 'READY')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-green-500/20"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Mark as Ready
                      </button>
                    ) : order.status === 'READY' ? (
                      <button 
                        onClick={() => updateStatus(order.id, 'PICKED_UP')}
                        className="w-full bg-stone-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        Handed Over to Student
                      </button>
                    ) : (
                      <button disabled className="w-full bg-stone-100 text-stone-400 py-3 rounded-xl font-bold cursor-not-allowed">
                        Completed
                      </button>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-dashed border-stone-200 flex justify-between items-center text-xs text-stone-400 font-medium">
                    <span className="truncate w-32">{order.user.name}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
