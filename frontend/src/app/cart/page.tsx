'use client'

import { useCart } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MinusIcon, PlusIcon, Trash2, ArrowLeft, Utensils } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart()
  const router = useRouter()
  const [instructions, setInstructions] = useState('')

  const gst = total * 0.05 // 5% GST
  const grandTotal = total + gst

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pb-32">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-stone-200/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-3">Your cart is empty</h2>
          <p className="text-stone-500 mb-8 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Discover delicious meals in our menu!
          </p>
          <button
            onClick={() => router.push('/menu')}
            className="bg-amber-900 hover:bg-amber-950 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg shadow-amber-900/20"
          >
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/menu')}
            className="p-2 bg-white hover:bg-stone-100 rounded-full transition-colors text-stone-600 shadow-sm border border-stone-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Your Cart</h1>
        </div>

        <div className="grid md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="space-y-4">
            {items.map(item => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                    <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                  </div>
                  <p className="text-stone-500 font-medium mb-4">₹{item.price}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-stone-700 transition-colors shadow-sm"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-stone-700 transition-colors shadow-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-red-500 p-2 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-right flex flex-col justify-between">
                  <p className="font-bold text-xl text-stone-900">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}

            {/* Special Instructions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mt-6">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                Cooking Instructions
                <span className="text-xs font-normal text-stone-400 px-2 py-0.5 bg-stone-100 rounded-full">Optional</span>
              </h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Less sugar, make it extra spicy, extra tissue paper..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none h-28"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 sticky top-28">
            <h3 className="font-bold text-2xl text-stone-900 mb-8">Order Summary</h3>
            
            <div className="space-y-5 text-stone-600 mb-8">
              <div className="flex justify-between items-center text-lg">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">₹{total}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span>GST (5%)</span>
                <span className="font-semibold text-stone-900">₹{gst.toFixed(2)}</span>
              </div>
              
              <div className="pt-6 border-t border-dashed border-stone-200 mt-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="font-bold text-stone-900 text-xl block">Total Amount</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-4xl text-amber-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-amber-900 hover:bg-amber-950 text-white py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-amber-900/20"
            >
              Proceed to Checkout
            </button>
            
            <p className="text-xs text-stone-400 text-center mt-6 flex items-center justify-center gap-1 font-medium">
              Secure checkout powered by Razorpay
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
