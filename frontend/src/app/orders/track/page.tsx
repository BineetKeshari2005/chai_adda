'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { useSocket } from '@/context/SocketContext'
import { 
  CheckCircle2, Clock, ChevronLeft, QrCode, MessageSquare, 
  PackageCheck, UtensilsCrossed, AlertCircle, Loader2, Info, Coffee
} from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem: {
    name: string
  }
}

interface Order {
  id: string
  tokenNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'CANCELLED'
  orderType: 'INSTANT' | 'SCHEDULED'
  total: number
  createdAt: string
  orderItems: OrderItem[]
  slot: { label: string } | null
}

function OrderTrackingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('id')
  const { socket } = useSocket()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [waitTime, setWaitTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    if (socket && order) {
      socket.on('orderStatusUpdated', (updatedOrder: Order) => {
        if (updatedOrder.id === order.id) {
          setOrder(prev => prev ? { ...prev, status: updatedOrder.status } : null)
        }
      })

      return () => {
        socket.off('orderStatusUpdated')
      }
    }
  }, [socket, order?.id])

  const fetchOrder = async () => {
    try {
      const [orderRes, waitTimeRes] = await Promise.all([
        api.get(`/api/orders/${orderId}`),
        api.get('/api/orders/wait-time')
      ])
      setOrder(orderRes.data.order)
      setWaitTime(waitTimeRes.data.estimatedWaitMinutes)
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login')
      } else {
        setError('Failed to load order details.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Order Not Found</h1>
          <p className="text-stone-500 mb-8">{error || 'Could not find this order.'}</p>
          <button 
            onClick={() => router.push('/orders')}
            className="text-amber-600 font-bold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  // Determine progress state
  const isOrdered = ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'].includes(order.status)
  const isPreparing = ['PREPARING', 'READY', 'PICKED_UP'].includes(order.status)
  const isReady = ['READY', 'PICKED_UP'].includes(order.status)
  const isPickedUp = order.status === 'PICKED_UP'
  const isCancelled = order.status === 'CANCELLED'
  const isPending = order.status === 'PENDING'

  const getHeaderConfig = () => {
    if (isPickedUp) return { bg: 'bg-stone-800', icon: <CheckCircle2 className="w-6 h-6 text-white" />, title: 'Order Completed', subtitle: 'Hope you enjoyed your chai!' }
    if (isCancelled) return { bg: 'bg-red-600', icon: <AlertCircle className="w-6 h-6 text-white" />, title: 'Order Cancelled', subtitle: 'Please contact support if you need help' }
    if (isReady) return { bg: 'bg-[#156E2B]', icon: <CheckCircle2 className="w-6 h-6 text-white" />, title: 'Ready for Pickup!', subtitle: 'Please head to the counter' }
    if (isPreparing) return { bg: 'bg-amber-600', icon: <UtensilsCrossed className="w-6 h-6 text-white" />, title: 'Preparing your order', subtitle: 'The chef is brewing your chai' }
    if (isPending) return { bg: 'bg-stone-500', icon: <Clock className="w-6 h-6 text-white" />, title: 'Payment Pending', subtitle: 'Waiting for payment confirmation' }
    return { bg: 'bg-blue-600', icon: <Clock className="w-6 h-6 text-white" />, title: 'Order Received', subtitle: 'We will start preparing shortly' }
  }

  const header = getHeaderConfig()

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32">
      <Navbar />
      
      <div className="max-w-[440px] mx-auto px-4 pt-6">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push('/orders')}
          className="flex items-center gap-1 text-stone-500 hover:text-stone-800 font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Orders
        </button>

        {/* Dynamic Header */}
        <div className={`${header.bg} rounded-xl p-5 text-white shadow-md flex items-center gap-4 mb-6 transition-colors duration-500`}>
          <div className="bg-white/20 p-2 rounded-full">
            {header.icon}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{header.title}</h2>
            <p className="text-white/80 text-sm font-medium">{header.subtitle}</p>
          </div>
        </div>

        {/* Ticket Box */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E8DCCB] p-8 text-center shadow-sm relative mb-8">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-8 bg-[#FDFBF7] rounded-r-full border-r-2 border-y-2 border-dashed border-[#E8DCCB]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-8 bg-[#FDFBF7] rounded-l-full border-l-2 border-y-2 border-dashed border-[#E8DCCB]" />
          
          <p className="text-[11px] font-black text-[#8B6E52] tracking-[0.2em] uppercase mb-2">Your Order Token</p>
          <p className="text-6xl font-black text-[#963c2c] tracking-tighter mb-4">#{order.tokenNumber}</p>
          
          {order.orderType === 'INSTANT' && !isReady && !isPickedUp && !isCancelled && waitTime !== null && (
            <div className="inline-flex items-center gap-2 bg-[#F6EFE5] text-[#8B6E52] px-4 py-1.5 rounded-full text-sm font-bold border border-[#E8DCCB]">
              <Clock className="w-4 h-4" />
              Est. {waitTime} mins left
            </div>
          )}
          {order.orderType === 'SCHEDULED' && !isReady && !isPickedUp && !isCancelled && (
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-200">
              <Clock className="w-4 h-4" />
              Scheduled: {order.slot?.label}
            </div>
          )}
        </div>

        {/* Order Progress Timeline */}
        <div className="mb-10 pl-2">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Order Progress</h3>
          
          <div className="relative border-l-2 border-[#E8DCCB] ml-4 space-y-8 py-2">
            
            {/* Step 1: Ordered */}
            <div className="relative pl-8">
              <div className={`absolute -left-[11px] top-0 w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-white ${isOrdered ? 'bg-[#156E2B]' : 'bg-stone-300'}`}>
                {isOrdered && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <h4 className={`text-sm font-bold ${isOrdered ? 'text-[#156E2B]' : 'text-stone-400'}`}>Ordered</h4>
              <p className="text-sm text-stone-600 font-medium">Confirmed at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>

            {/* Step 2: Preparing */}
            <div className="relative pl-8">
              <div className={`absolute -left-[11px] top-0 w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-white ${isPreparing ? 'bg-[#156E2B]' : 'bg-stone-300'}`}>
                {isPreparing && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <h4 className={`text-sm font-bold ${isPreparing ? 'text-[#156E2B]' : 'text-stone-400'}`}>Preparing</h4>
              <p className="text-sm text-stone-600 font-medium">The chef is brewing your chai</p>
            </div>

            {/* Step 3: Ready for Pickup */}
            <div className="relative pl-8">
              <div className={`absolute -left-[15px] -top-2 w-[28px] h-[28px] rounded-full flex items-center justify-center border-4 border-[#FDFBF7] shadow-sm ${isReady ? 'bg-[#963c2c]' : 'bg-stone-300'}`}>
                {isReady ? <PackageCheck className="w-4 h-4 text-white" /> : <PackageCheck className="w-4 h-4 text-white" />}
              </div>
              <h4 className={`text-sm font-bold ${isReady ? 'text-[#963c2c]' : 'text-stone-400'}`}>Ready for Pickup</h4>
              <p className="text-sm text-stone-600 font-medium">Collect at Counter #1</p>
            </div>

          </div>
        </div>

        {/* Order Details Receipt */}
        <div className="bg-[#F6F4F0] rounded-xl p-5 mb-8">
          <h3 className="text-sm font-bold text-stone-700 mb-4 px-1">Order Details</h3>
          <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-4">
            {order.orderItems.map(item => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-5 h-5 text-[#8B6E52]" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm leading-tight mb-1">{item.menuItem.name}</p>
                    <p className="text-[11px] font-medium text-stone-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold text-[#963c2c] text-sm">₹{item.price}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center px-4 py-3 border-t border-stone-200">
            <span className="font-medium text-stone-600 text-sm">Total</span>
            <span className="font-black text-xl text-[#963c2c]">₹{order.total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            disabled={!isReady || isPickedUp || isCancelled}
            className="w-full bg-[#963c2c] hover:bg-[#803123] disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Show Pickup QR
          </button>
          
          <button className="w-full bg-transparent hover:bg-stone-100 text-[#8B6E52] border-2 border-[#8B6E52] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Need Help?
          </button>
        </div>

      </div>
    </div>
  )
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  )
}
