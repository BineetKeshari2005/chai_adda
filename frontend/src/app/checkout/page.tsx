'use client'

import { useCart } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { CheckCircle2, Loader2, Utensils, Clock, Zap } from 'lucide-react'

// Load razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface TimeSlot {
  id: string
  label: string
  startTime: string
  endTime: string
  maxOrders: number
  remainingCapacity: number
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOrderComplete, setIsOrderComplete] = useState(false)
  
  const [orderType, setOrderType] = useState<'INSTANT' | 'SCHEDULED'>('INSTANT')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [fetchingSlots, setFetchingSlots] = useState(false)

  const gst = total * 0.05
  const grandTotal = total + gst

  useEffect(() => {
    if (!isOrderComplete && items.length === 0) {
      router.push('/cart')
    }
  }, [items, router, isOrderComplete])

  // Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      setFetchingSlots(true)
      try {
        const res = await api.get('/api/slots/available')
        setSlots(res.data.slots)
      } catch (err) {
        console.error('Failed to fetch slots', err)
      } finally {
        setFetchingSlots(false)
      }
    }
    fetchSlots()
  }, [])

  const handlePayment = async () => {
    if (orderType === 'SCHEDULED' && !selectedSlotId) {
      setError('Please select a pickup time slot.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Create order in backend
      const orderPayload = {
        orderType,
        slotId: orderType === 'SCHEDULED' ? selectedSlotId : undefined,
        items: items.map(i => ({
          menuItemId: i.id,
          quantity: i.quantity,
          customization: i.customization || ''
        }))
      }

      const { data: orderData } = await api.post('/api/orders', orderPayload)
      const orderId = orderData.order.id

      // 2. Create Razorpay order
      const { data: rpData } = await api.post('/api/payments/create', { orderId })

      // 3. Load Razorpay script
      const res = await loadRazorpayScript()
      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?')
        setLoading(false)
        return
      }

      // 4. Open Razorpay modal
      const options = {
        key: rpData.keyId,
        amount: rpData.amount,
        currency: rpData.currency,
        name: 'Chai Adda',
        description: 'Campus Cafeteria Order',
        order_id: rpData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 5. Verify payment
            const { data: verifyData } = await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            })

            if (verifyData.success) {
              setIsOrderComplete(true)
              clearCart()
              router.push(`/order-confirmation?token=${verifyData.tokenNumber}&orderId=${verifyData.orderId}`)
            }
          } catch (err: any) {
            setError(err.response?.data?.error || 'Payment verification failed')
          }
        },
        prefill: {
          name: 'Student Name',
          email: 'student@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#d97706' // amber-600
        }
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
      
      setLoading(false)
      
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Checkout</h1>
            <p className="text-stone-500">Review your final order and select pickup type</p>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_350px] gap-8 items-start">
          
          <div className="space-y-6">
            {/* Pickup Preferences */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
              <h2 className="text-lg font-bold text-stone-900 mb-6">Pickup Preferences</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => {
                    setOrderType('INSTANT')
                    setSelectedSlotId(null)
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    orderType === 'INSTANT' 
                      ? 'border-amber-600 bg-amber-50 text-amber-900' 
                      : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200'
                  }`}
                >
                  <Zap className={`w-6 h-6 ${orderType === 'INSTANT' ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span className="font-bold">Instant Service</span>
                </button>
                
                <button
                  onClick={() => setOrderType('SCHEDULED')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    orderType === 'SCHEDULED' 
                      ? 'border-amber-600 bg-amber-50 text-amber-900' 
                      : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200'
                  }`}
                >
                  <Clock className={`w-6 h-6 ${orderType === 'SCHEDULED' ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span className="font-bold">Schedule for Later</span>
                </button>
              </div>

              {/* Time Slots Grid */}
              {orderType === 'SCHEDULED' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wider">Select Available Slot</h3>
                  {fetchingSlots ? (
                    <div className="flex justify-center p-8 text-amber-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-4 bg-stone-50 text-stone-500 text-center rounded-xl border border-stone-200">
                      No scheduled slots available right now. Please use Instant Service.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedSlotId === slot.id
                              ? 'border-amber-600 bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                              : 'border-stone-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <p className={`font-bold ${selectedSlotId === slot.id ? 'text-white' : 'text-stone-900'}`}>
                            {slot.label}
                          </p>
                          <p className={`text-xs mt-1 font-medium ${selectedSlotId === slot.id ? 'text-amber-100' : 'text-amber-600'}`}>
                            {slot.remainingCapacity} spots left
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Items Review */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
              <h2 className="text-lg font-bold text-stone-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="font-bold text-stone-900">{item.name}</h4>
                      <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-stone-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky top-28 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
              <h3 className="font-bold text-xl text-stone-900 mb-6">Summary</h3>
              
              <div className="space-y-4 pt-4 border-t border-dashed border-stone-200">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">₹{total}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (5%)</span>
                  <span className="font-medium text-stone-900">₹{gst.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-end pt-4">
                  <span className="font-bold text-stone-900 text-lg">Total</span>
                  <span className="font-black text-3xl text-amber-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading || (orderType === 'SCHEDULED' && !selectedSlotId)}
              className="w-full bg-stone-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Pay ₹{grandTotal.toFixed(2)}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
