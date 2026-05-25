'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { CheckCircle, Clock, ShoppingBag } from 'lucide-react'
import { Suspense } from 'react'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const token = searchParams.get('token')
  const orderId = searchParams.get('orderId')

  if (!token) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">No order found.</p>
        <button onClick={() => router.push('/menu')} className="text-amber-600 font-bold">
          Go back to Menu
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-amber-900/5 border border-stone-100 overflow-hidden relative">
        
        {/* Success Header */}
        <div className="bg-amber-600 p-8 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            {/* Some ambient pattern/gradient could go here */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-white/10">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-1">Order Confirmed!</h1>
            <p className="text-amber-100 font-medium text-lg">Your payment was successful</p>
          </div>
        </div>

        {/* Token Details */}
        <div className="p-8 text-center bg-stone-50 border-b border-dashed border-stone-200">
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mb-2">Your Token Number</p>
          <div className="text-6xl font-black text-stone-900 tracking-tighter mb-4">
            #{token}
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold">
            <Clock className="w-4 h-4" />
            Estimated wait: 5-10 mins
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-8">
          <h3 className="font-bold text-stone-900 mb-4">What happens next?</h3>
          <ul className="space-y-4">
            <li className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-bold text-stone-600 text-sm">1</span>
              </div>
              <div>
                <p className="font-bold text-stone-900">Wait for your token</p>
                <p className="text-sm text-stone-500">Keep an eye on the live queue display at the cafeteria counter.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-bold text-stone-600 text-sm">2</span>
              </div>
              <div>
                <p className="font-bold text-stone-900">Pickup your order</p>
                <p className="text-sm text-stone-500">Show this token number at the pickup counter when called.</p>
              </div>
            </li>
          </ul>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push('/orders')}
              className="w-full bg-stone-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-colors"
            >
              Track Order Status
            </button>
            <button
              onClick={() => router.push('/menu')}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 py-4 rounded-xl font-bold transition-colors"
            >
              Order Something Else
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center text-stone-400 font-medium">Loading your receipt...</div>}>
        <OrderConfirmationContent />
      </Suspense>
    </div>
  )
}
