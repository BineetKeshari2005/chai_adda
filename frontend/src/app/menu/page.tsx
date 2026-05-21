'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  isVeg: boolean
  isAvailable: boolean
  avgRating: number
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
  const [loading, setLoading] = useState(true)
  const { items, addItem, updateQuantity, total, itemCount } = useCart()
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

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
    const matchesCategory = selectedCategory === 'all' ||
      item.category.id === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch && item.isAvailable
  })

  const getItemQuantity = (id: string) => {
    return items.find(i => i.id === id)?.quantity || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">☕</div>
          <p className="text-amber-800 font-medium">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-900">Chai Adda</h1>
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-sm font-medium text-amber-800 border-b-2 border-amber-800 pb-0.5">
              Menu
            </button>
            <button
              onClick={() => router.push('/orders')}
              className="text-sm text-gray-500 hover:text-amber-800"
            >
              Orders
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2 hover:bg-amber-50 rounded-full"
            >
              <span className="text-xl">🔔</span>
            </button>
            <button
              onClick={logout}
              className="w-9 h-9 bg-amber-800 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4">

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Masala Chai, Samosa..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
          />
        </div>

        {/* Category filters — only categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-amber-800 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden h-48 mb-6">
          <img
            src="/chai-adda-bg.png"
            alt="Featured"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
          <div className="absolute bottom-4 left-4">
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              STUDENT FAVORITE
            </span>
            <h2 className="text-white text-xl font-bold mt-1">Signature Masala Chai</h2>
            <p className="text-white/80 text-sm">Hand-pounded spices & farm fresh milk</p>
          </div>
        </div>

        {/* Menu items */}
        {selectedCategory === 'all' ? (
          categories.map(category => {
            const categoryItems = filteredItems.filter(
              item => item.category.id === category.id
            )
            if (categoryItems.length === 0) return null
            return (
              <div key={category.id} className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-amber-900">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {category.name === 'Chai & Coffee' ? 'The soul of Chai Adda' :
                       category.name === 'Snacks' ? 'Crunchy & delicious' :
                       category.name === 'Meals' ? 'Full and satisfying' :
                       'Refreshing drinks'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categoryItems.map(item => (
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
              </div>
            )
          })
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => router.push('/cart')}
              className="w-full bg-amber-800 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-700 rounded-xl px-2 py-1 text-sm font-bold">
                  {itemCount}
                </div>
                <span className="font-medium">Items added</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">₹{total.toFixed(2)}</span>
                <span className="font-semibold">VIEW CART →</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className={`relative h-32 flex items-center justify-center text-5xl ${
        item.isVeg ? 'bg-green-50' : 'bg-orange-50'
      }`}>
        <span>{foodEmoji[item.name] || (item.isVeg ? '🥗' : '🍳')}</span>
        <div className="absolute top-2 left-2">
          <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
            item.isVeg ? 'border-green-600' : 'border-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              item.isVeg ? 'bg-green-600' : 'bg-red-600'
            }`}/>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
          {item.name}
        </h4>
        <p className="text-xs text-gray-400 mt-0.5 leading-tight line-clamp-1">
          {item.description}
        </p>
        {item.avgRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-amber-500">★</span>
            <span className="text-xs text-gray-500">{item.avgRating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-gray-900 text-sm">₹{item.price}</span>
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              disabled={!item.isAvailable}
              className="w-8 h-8 bg-amber-800 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm disabled:opacity-40"
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={onDecrement}
                className="w-7 h-7 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
              <button
                onClick={onIncrement}
                className="w-7 h-7 bg-amber-800 text-white rounded-lg flex items-center justify-center font-bold"
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