'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { Clock, RefreshCcw, Coffee, PackageCheck, UtensilsCrossed, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderItem {
  id: string
  quantity: number
  menuItem: {
    name: string
    isVeg: boolean
  }
}

interface Order {
  id: string
  tokenNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'CANCELLED'
  total: number
  createdAt: string
  orderItems: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [waitTime, setWaitTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    setError('')
    try {
      const [ordersRes, waitTimeRes] = await Promise.all([
        api.get('/api/orders/my'),
        api.get('/api/orders/wait-time')
      ])
      setOrders(ordersRes.data.orders)
      setWaitTime(waitTimeRes.data.estimatedWaitMinutes)
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Failed to load orders. Please try again.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load & setup polling (every 30 seconds)
  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status))
  const pastOrders = orders.filter(o => ['PICKED_UP', 'CANCELLED'].includes(o.status))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-stone-100 text-stone-600 border-stone-200'
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'PREPARING': return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'READY': return 'bg-green-500 text-white border-green-600 shadow-green-500/20 shadow-lg'
      case 'PICKED_UP': return 'bg-stone-100 text-stone-500 border-stone-200'
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-200'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED': return <Clock className="w-5 h-5" />
      case 'PREPARING': return <UtensilsCrossed className="w-5 h-5 animate-pulse" />
      case 'READY': return <PackageCheck className="w-5 h-5" />
      case 'PICKED_UP': return <CheckCircle className="w-5 h-5" />
      default: return <Coffee className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Payment Pending'
      case 'CONFIRMED': return 'In Queue'
      case 'PREPARING': return 'Preparing Now'
      case 'READY': return 'Ready for Pickup!'
      case 'PICKED_UP': return 'Picked Up'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Header & Wait Time Widget */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Live Token Queue</h1>
            <p className="text-stone-500">Track your active orders in real-time</p>
          </div>
          
          <div className="flex items-center gap-4">
            {waitTime !== null && (
              <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-stone-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Est. Wait</p>
                  <p className="font-bold text-stone-900 leading-none mt-1">{waitTime} mins</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => fetchOrders(true)}
              className="bg-white p-3.5 rounded-2xl shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors text-stone-600"
              disabled={refreshing}
            >
              <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Active Orders Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            Active Tokens
          </h2>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-stone-100 border-dashed">
              <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <p className="text-stone-500 font-medium mb-4">You have no active orders in the kitchen.</p>
              <button 
                onClick={() => router.push('/menu')}
                className="text-amber-600 font-bold hover:text-amber-700"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {activeOrders.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => router.push(`/orders/track?id=${order.id}`)}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-amber-200 transition-all active:scale-[0.98]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Token No.</p>
                        <p className="text-4xl font-black text-stone-900">#{order.tokenNumber}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full font-bold text-sm border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {order.orderItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="font-medium text-stone-700">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                    <span className="text-xs text-stone-400 font-medium">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-bold text-stone-900">₹{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History Section */}
        {pastOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-6">Order History</h2>
            <div className="space-y-4">
              {pastOrders.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => router.push(`/orders/track?id=${order.id}`)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-center justify-between opacity-75 hover:opacity-100 hover:shadow-md hover:border-stone-200 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-stone-50 px-4 py-2 rounded-xl text-center border border-stone-200">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Token</p>
                      <p className="text-xl font-black text-stone-700">#{order.tokenNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 mb-1">
                        {order.orderItems.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <span className="text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-300" />
                        <span className={order.status === 'CANCELLED' ? 'text-red-500' : 'text-stone-500'}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900">₹{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
