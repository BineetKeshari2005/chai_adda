'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { Coffee, ClipboardList, Bell, ShoppingCart, LogOut, Menu, X, User as UserIcon, Search, Utensils, CupSoda, Croissant, Egg, Soup, Pizza, Droplets, UtensilsCrossed } from 'lucide-react'

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
  const [pureVeg, setPureVeg] = useState(false)
  const [nonVeg, setNonVeg] = useState(false)
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
      const uniqueCats = Array.from(new Map(catRes.data.categories.map((c: any) => [c.name, c])).values()) as Category[]
      setCategories(uniqueCats)
    } catch (error) {
      console.log('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const getItemQuantity = (id: string) => {
    return items.find(i => i.id === id)?.quantity || 0
  }

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.name === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    
    let matchesDietary = true
    if (pureVeg && nonVeg) {
      matchesDietary = true // both selected means show both
    } else if (pureVeg) {
      matchesDietary = item.isVeg
    } else if (nonVeg) {
      matchesDietary = !item.isVeg
    }

    return matchesCategory && matchesSearch && matchesDietary
  })

  const allFeatured = menuItems.filter(i => (i as any).isFeatured)
  const heroItem = allFeatured.length > 0 ? allFeatured[0] : (menuItems.find(i => i.name.toLowerCase().includes('masala chai')) || menuItems[0])
  const flashDealItem = allFeatured.length > 1 ? allFeatured[1] : (allFeatured.length === 1 ? allFeatured[0] : (menuItems.find(i => i.name.toLowerCase().includes('samosa')) || menuItems[1]))

  // Group items by category if 'all' is selected
  const groupedItems = useMemo(() => {
    if (selectedCategory !== 'all') {
      return { [selectedCategory]: filteredItems }
    }

    const groups: Record<string, MenuItem[]> = {}
    categories.forEach(cat => {
      groups[cat.name] = []
    })
    
    filteredItems.forEach(item => {
      if (groups[item.category.name]) {
        groups[item.category.name].push(item)
      } else {
        groups[item.category.name] = [item]
      }
    })

    return groups
  }, [filteredItems, selectedCategory, categories])

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-[#fcfbf9] pb-32">
        <Navbar />

        <div className="w-full px-4 lg:px-8 pt-6">

          {/* Search Bar */}
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for Masala Chai, Samosa..."
              className="w-full bg-[#f4f2ee] border-none rounded-xl pl-12 pr-12 py-3.5 text-[15px] font-medium text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#853426]/30 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 w-6 h-6 flex items-center justify-center transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-[#853426] text-white shadow-md'
                  : 'bg-[#e9e4de] text-stone-700 hover:bg-[#dfd9d2]'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-300 ${
                  selectedCategory === cat.name
                    ? 'bg-[#853426] text-white shadow-md'
                    : 'bg-[#e9e4de] text-stone-700 hover:bg-[#dfd9d2]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dietary Checkboxes */}
          <div className="flex gap-4 mb-8">
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${pureVeg ? 'border-green-600 bg-green-50' : 'border-[#e0dcd6] bg-white'}`}>
              <input 
                type="checkbox" 
                checked={pureVeg}
                onChange={() => setPureVeg(!pureVeg)}
                className="hidden"
              />
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${pureVeg ? 'bg-green-600 border-green-600' : 'border-stone-300'}`}>
                {pureVeg && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div className="w-3.5 h-3.5 border-[1.5px] border-green-600 flex items-center justify-center rounded-sm">
                 <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              </div>
              <span className="text-[13px] font-bold text-stone-700">Pure Veg</span>
            </label>

            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${nonVeg ? 'border-red-600 bg-red-50' : 'border-[#e0dcd6] bg-white'}`}>
              <input 
                type="checkbox" 
                checked={nonVeg}
                onChange={() => setNonVeg(!nonVeg)}
                className="hidden"
              />
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${nonVeg ? 'bg-red-600 border-red-600' : 'border-stone-300'}`}>
                {nonVeg && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div className="w-3.5 h-3.5 border-[1.5px] border-red-600 flex items-center justify-center rounded-sm">
                 <div className="w-1.5 h-1.5 bg-red-600 rounded-sm" />
              </div>
              <span className="text-[13px] font-bold text-stone-700">Non-Veg</span>
            </label>
          </div>

          {/* Hero & Deal Banners */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-10">
            {/* Signature Chai Banner */}
            {heroItem && (
              <div className="relative rounded-2xl overflow-hidden h-[240px] md:h-[280px] shadow-sm group">
                <img
                  src={heroItem.imageUrl || "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?q=80&w=2070&auto=format&fit=crop"}
                  alt={heroItem.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"/>
                <div className="absolute inset-y-0 left-0 p-8 flex flex-col justify-center">
                  <span className="bg-[#f0a649] text-stone-900 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold shadow-sm w-fit mb-3">
                    STUDENT FAVORITE
                  </span>
                  <h2 className="text-white text-3xl font-extrabold mb-2 max-w-[200px] leading-tight">{heroItem.name}</h2>
                  <p className="text-white/90 text-sm font-medium">{heroItem.description || "Hand-pounded spices & farm fresh milk."}</p>
                </div>
              </div>
            )}

            {/* Flash Deal Banner */}
            {flashDealItem && (
              <div className="relative rounded-2xl overflow-hidden h-[240px] md:h-[280px] bg-[#3a8b41] shadow-sm flex flex-col justify-between p-6">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 12.5c0 3.3-2.7 6-6 6s-6-2.7-6-6c0-4 4-7.5 6-11 2 3.5 6 7 6 11z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-[#a8e5b0] font-medium text-sm mb-1">Flash Deal!</p>
                  <h3 className="text-white font-semibold text-lg leading-snug">{flashDealItem.name}</h3>
                </div>
                <div className="relative z-10">
                  <div className="text-white text-5xl font-black mb-3 tracking-tighter">₹{flashDealItem.price}</div>
                  <button 
                    onClick={() => {
                      addItem({
                        id: flashDealItem.id,
                        name: flashDealItem.name,
                        price: flashDealItem.price,
                        quantity: 1,
                        isVeg: flashDealItem.isVeg
                      })
                      router.push('/cart')
                    }}
                    className="bg-[#a8e5b0] text-[#1c4b22] font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-white transition-colors"
                  >
                    Claim Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="h-40 bg-stone-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-stone-100 rounded w-full mb-1"></div>
                    <div className="h-4 bg-stone-200 rounded w-1/4 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4 text-stone-300">
                <Search className="w-16 h-16" />
              </div>
              <h3 className="text-lg font-bold text-stone-800">No items found</h3>
              <p className="text-stone-500 text-sm mt-1">Try adjusting your filters or search term.</p>
              <button 
                onClick={() => { setSearch(''); setPureVeg(false); setNonVeg(false); setSelectedCategory('all') }}
                className="mt-4 text-[#853426] font-medium text-sm hover:underline transition-all"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-10 pb-10">
              {Object.entries(groupedItems).map(([categoryName, items]) => {
                if (items.length === 0) return null

                // Small mapping for descriptive category titles like screenshot
                const titleMap: Record<string, string> = {
                  'Chai & Coffee': 'Classic Chai',
                  'Snacks': 'Crunchy Snacks',
                  'Meals': 'Hearty Meals',
                  'Drinks': 'Refreshing Drinks'
                }
                const displayTitle = titleMap[categoryName] || categoryName

                return (
                  <div key={categoryName} className="animate-in fade-in duration-500">
                    <div className="flex items-end justify-between border-b border-[#e9e4de] pb-3 mb-6">
                      <div>
                        <h3 className="text-[#853426] text-[17px] font-semibold">{displayTitle}</h3>
                        <p className="text-stone-600 text-sm font-medium mt-1">The soul of Chai Adda</p>
                      </div>
                      <button className="text-[#853426] font-semibold text-sm hover:underline">View All</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {items.map(item => (
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
              })}
            </div>
          )}
        </div>

        {/* Floating cart bar */}
        {itemCount > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 z-50 animate-in slide-in-from-bottom-8 duration-300">
            <div className="max-w-xl mx-auto">
              <div className="bg-[#853426] text-white rounded-[20px] p-2 flex items-center justify-between shadow-2xl border border-white/10">
                <div className="flex items-center gap-4 pl-3">
                  <div className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    <div className="absolute -top-1.5 -right-2 bg-[#f0a649] text-stone-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {itemCount}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/80 font-medium">{itemCount} Items added</p>
                    <p className="font-semibold text-[15px]">₹{total.toFixed(2)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push('/cart')}
                  className="bg-white text-[#853426] px-5 py-2.5 rounded-[14px] font-bold text-[13px] flex items-center gap-1.5 hover:bg-stone-50 transition-colors"
                >
                  VIEW CART <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
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
  const getFoodIcon = (name: string, isVeg: boolean) => {
    const n = name.toLowerCase()
    if (n.includes('chai') || n.includes('tea') || n.includes('coffee')) return <Coffee className="w-12 h-12 text-[#853426]/40" />
    if (n.includes('shake') || n.includes('lassi') || n.includes('pani') || n.includes('drink')) return <CupSoda className="w-12 h-12 text-[#853426]/40" />
    if (n.includes('samosa') || n.includes('puff') || n.includes('croissant')) return <Croissant className="w-12 h-12 text-[#853426]/40" />
    if (n.includes('egg') || n.includes('omelette')) return <Egg className="w-12 h-12 text-[#853426]/40" />
    if (n.includes('maggi') || n.includes('noodles') || n.includes('soup')) return <Soup className="w-12 h-12 text-[#853426]/40" />
    if (n.includes('sandwich') || n.includes('pizza') || n.includes('burger')) return <Pizza className="w-12 h-12 text-[#853426]/40" />
    if (n.includes('thali') || n.includes('chawal') || n.includes('rice') || n.includes('bhature')) return <UtensilsCrossed className="w-12 h-12 text-[#853426]/40" />
    
    return isVeg ? <Utensils className="w-12 h-12 text-[#853426]/40" /> : <Egg className="w-12 h-12 text-[#853426]/40" />
  }

  return (
    <div className={`flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg group ${
      !item.isAvailable ? 'opacity-70 grayscale-[0.8]' : ''
    }`}>
      
      {/* Image Container */}
      <div className={`relative h-44 w-full overflow-hidden ${
        item.imageUrl ? '' : (item.isVeg ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-orange-50 to-orange-100')
      } flex items-center justify-center text-5xl`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
            {getFoodIcon(item.name, item.isVeg)}
          </span>
        )}

        {/* Veg/Non-veg Indicator */}
        <div className="absolute top-2.5 left-2.5 bg-white p-1 rounded-sm shadow-sm">
          <div className={`w-3.5 h-3.5 border-[1.5px] rounded-sm flex items-center justify-center ${
            item.isVeg ? 'border-green-600' : 'border-red-600'
          }`}>
            <div className={`w-1.5 h-1.5 ${
              item.isVeg ? 'bg-green-600 rounded-full' : 'bg-red-600 rounded-sm'
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

      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-semibold text-stone-800 text-[15px] leading-tight">
          {item.name}
        </h4>
        <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
          {item.description}
        </p>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-stone-900 text-[15px]">₹{item.price}</span>
          
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              disabled={!item.isAvailable}
              className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-[18px] font-light transition-all ${
                !item.isAvailable 
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#853426] text-white hover:bg-[#6c291d] active:scale-95'
              }`}
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#853426] rounded-[8px] p-0.5">
              <button
                onClick={onDecrement}
                className="w-6 h-6 bg-[#853426] text-white rounded flex items-center justify-center font-bold transition-colors hover:bg-[#6c291d]"
              >
                -
              </button>
              <span className="text-xs font-bold w-4 text-center text-white">{quantity}</span>
              <button
                onClick={onIncrement}
                className="w-6 h-6 bg-[#853426] text-white rounded flex items-center justify-center font-bold transition-colors hover:bg-[#6c291d]"
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