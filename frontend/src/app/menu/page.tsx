'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  isVeg: boolean
  isAvailable: boolean
  avgRating: number
  imageUrl: string | null
  category: { id: string; name: string }
}

interface Category {
  id: string
  name: string
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all')
  const [loading, setLoading] = useState(true)
  const { items, addItem, updateQuantity, total, itemCount } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get('/api/menu'),
        api.get('/api/categories')
      ])
      setMenuItems(menuRes.data.items)
      setCategories(catRes.data.categories)
    } catch (error) {
      console.log('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.id === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesDietary = dietaryFilter === 'all' || 
      (dietaryFilter === 'veg' && item.isVeg) || 
      (dietaryFilter === 'non-veg' && !item.isVeg)
    
    // We display all items even if unavailable, so they show as Sold Out
    return matchesCategory && matchesSearch && matchesDietary
  })

  const getItemQuantity = (id: string) => {
    return items.find(i => i.id === id)?.quantity || 0
  }

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-stone-50 pb-32">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 pt-4">

          {/* Search Bar */}
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for Masala Chai, Samosa..."
              className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 shadow-sm transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters: Dietary & Categories */}
          <div className="flex flex-col gap-3 mb-6">
            
            {/* Dietary Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  dietaryFilter === 'all'
                    ? 'bg-stone-800 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  dietaryFilter === 'veg'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-green-50'
                }`}
              >
                <span>🟢</span> Veg
              </button>
              <button
                onClick={() => setDietaryFilter('non-veg')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-red-50'
                }`}
              >
                <span>🔴</span> Non-Veg
              </button>
            </div>

            {/* Category Filter Pills (Glassmorphic Slider) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-amber-800/90 text-white shadow-lg border border-amber-800/20'
                    : 'bg-white/80 text-stone-600 border border-white hover:bg-white shadow-sm'
                }`}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'bg-amber-800/90 text-white shadow-lg border border-amber-800/20'
                      : 'bg-white/80 text-stone-600 border border-white hover:bg-white shadow-sm'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Hero banner */}
          <div className="relative rounded-3xl overflow-hidden h-48 mb-8 shadow-sm group">
            <img
              src="/chai-adda-bg.png"
              alt="Featured"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"/>
            <div className="absolute bottom-5 left-5">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold shadow-md">
                STUDENT FAVORITE
              </span>
              <h2 className="text-white text-2xl font-bold mt-2">Signature Masala Chai</h2>
              <p className="text-white/80 text-sm mt-0.5">Hand-pounded spices & farm fresh milk</p>
            </div>
          </div>

          {/* Main Content Area */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
                  <div className="h-32 bg-stone-200"></div>
                  <div className="p-3">
                    <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-stone-100 rounded w-full mb-1"></div>
                    <div className="h-3 bg-stone-100 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                      <div className="h-8 bg-stone-200 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-stone-800">No items found</h3>
              <p className="text-stone-500 text-sm mt-1">Try adjusting your filters or search term.</p>
              <button 
                onClick={() => { setSearch(''); setDietaryFilter('all'); setSelectedCategory('all') }}
                className="mt-4 text-amber-600 font-medium text-sm hover:text-amber-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredItems.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={() => addItem({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    isVeg: item.isVeg
                  })}
                  onIncrement={() => updateQuantity(
                    item.id, getItemQuantity(item.id) + 1
                  )}
                  onDecrement={() => updateQuantity(
                    item.id, getItemQuantity(item.id) - 1
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating cart bar */}
        {itemCount > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 z-50 animate-in slide-in-from-bottom-8 duration-300">
            <div className="max-w-7xl mx-auto">
              <button
                onClick={() => router.push('/cart')}
                className="w-full bg-amber-900 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-2xl hover:bg-amber-950 transition-colors border border-amber-800"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-800 rounded-xl px-2.5 py-1 text-sm font-bold shadow-inner">
                    {itemCount}
                  </div>
                  <span className="font-medium text-amber-50">Items added</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
                  <span className="text-amber-500">|</span>
                  <span className="font-bold text-sm tracking-wide text-amber-200">VIEW CART →</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

function MenuItemCard({ item, quantity, onAdd, onIncrement, onDecrement }: {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
}) {
  const foodEmoji: Record<string, string> = {
    'Masala Chai': '☕',
    'Adrak Chai': '🍵',
    'Elaichi Chai': '🫖',
    'Cold Coffee': '🧋',
    'Lemon Honey Tea': '🍋',
    'Samosa': '🥟',
    'Bread Omelette': '🍳',
    'Maggi': '🍜',
    'Veg Puff': '🥐',
    'Paneer Sandwich': '🥪',
    'Veg Thali': '🍱',
    'Rajma Chawal': '🍚',
    'Chole Bhature': '🫓',
    'Egg Rice': '🍳',
    'Lassi': '🥛',
    'Nimbu Pani': '🍋',
    'Mango Shake': '🥭',
  }

  return (
    <div className={`relative bg-white rounded-2xl overflow-hidden border border-stone-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-200 group ${
      !item.isAvailable ? 'opacity-70 grayscale-[0.8]' : ''
    }`}>
      
      {/* Image / Fallback Container */}
      <div className={`relative h-32 flex items-center justify-center text-5xl overflow-hidden ${
        item.imageUrl ? '' : (item.isVeg ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-orange-50 to-orange-100')
      }`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span className="transition-transform duration-300 group-hover:scale-110">
            {foodEmoji[item.name] || (item.isVeg ? '🥗' : '🍳')}
          </span>
        )}

        {/* Veg/Non-veg Indicator */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm p-1 rounded shadow-sm">
          <div className={`w-3.5 h-3.5 border-[1.5px] rounded-sm flex items-center justify-center ${
            item.isVeg ? 'border-green-600' : 'border-red-600'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              item.isVeg ? 'bg-green-600' : 'bg-red-600'
            }`}/>
          </div>
        </div>
        
        {/* Sold Out Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-lg transform -rotate-12">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h4 className="font-bold text-stone-800 text-sm leading-tight group-hover:text-amber-700 transition-colors">
          {item.name}
        </h4>
        <p className="text-[11px] text-stone-500 mt-1 leading-relaxed line-clamp-2 min-h-[32px]">
          {item.description}
        </p>
        
        {item.avgRating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[10px] text-amber-500">★</span>
            <span className="text-[10px] font-medium text-stone-600">{item.avgRating.toFixed(1)}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-50">
          <span className="font-extrabold text-stone-900 text-sm">₹{item.price}</span>
          
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              disabled={!item.isAvailable}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
                !item.isAvailable 
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-800 hover:text-white active:scale-95'
              }`}
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-stone-50 rounded-xl p-0.5 border border-stone-200">
              <button
                onClick={onDecrement}
                className="w-7 h-7 bg-white text-stone-600 hover:text-red-600 rounded-lg flex items-center justify-center font-bold shadow-sm transition-colors"
              >
                -
              </button>
              <span className="text-xs font-bold w-5 text-center text-stone-800">{quantity}</span>
              <button
                onClick={onIncrement}
                className="w-7 h-7 bg-amber-800 text-white hover:bg-amber-900 rounded-lg flex items-center justify-center font-bold shadow-sm transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}