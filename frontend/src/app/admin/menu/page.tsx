'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { 
  LogOut, LayoutDashboard, Settings, 
  RefreshCcw, AlertCircle, Loader2, Utensils, 
  Plus, Edit, Trash2, X
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isAvailable: boolean
  isVeg: boolean
  categoryId: string
  category: Category
}

export default function AdminMenuPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isVeg: true
  })
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        router.push('/menu')
      } else {
        fetchData()
      }
    }
  }, [user, isLoading, router])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    setError('')
    try {
      // Fetch both menu and categories
      const [menuRes, catRes] = await Promise.all([
        api.get('/api/menu/admin/all'),
        api.get('/api/categories')
      ])
      
      // /api/menu returns all items in backend (if we modify it or we might need a dedicated admin fetch if it only returns available items)
      // Actually /api/menu only returns `isAvailable: true` by default based on the backend code!
      // Wait, if it only returns available, how do we toggle them back?
      // I should call an endpoint that fetches ALL items.
      setItems(menuRes.data.items)
      setCategories(catRes.data.categories)
    } catch (err: any) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle Modal Open
  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        categoryId: item.categoryId,
        imageUrl: item.imageUrl || '',
        isVeg: item.isVeg
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        imageUrl: '',
        isVeg: true
      })
    }
    setIsModalOpen(true)
  }

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      }
      
      if (editingItem) {
        await api.put(`/api/menu/${editingItem.id}`, payload)
      } else {
        await api.post('/api/menu', payload)
      }
      
      setIsModalOpen(false)
      fetchData(true) // Refresh list
    } catch (err) {
      alert('Failed to save menu item')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/menu/${id}`)
        fetchData(true)
      } catch (err) {
        alert('Failed to delete item')
      }
    }
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/api/menu/${id}/toggle`)
      setItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !currentStatus } : item))
    } catch (err) {
      alert('Failed to toggle availability')
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))

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
          <button 
            onClick={() => router.push('/admin/orders')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800 font-medium transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Live Orders
          </button>
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-600 text-white font-medium transition-colors"
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
      <div className="flex-1 p-8 relative">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Menu Settings</h1>
              <p className="text-stone-500 mt-1">Manage what's available today</p>
            </div>
            
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                placeholder="Search items..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white border border-stone-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-64 shadow-sm"
              />
              <button 
                onClick={() => fetchData(true)}
                className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-stone-400 hover:text-stone-700 transition-colors"
              >
                <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => openModal()}
                className="bg-stone-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-stone-900 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-stone-500">{item.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-stone-900 font-medium">₹{item.price}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailability(item.id, item.isAvailable)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                          item.isAvailable ? 'bg-amber-600' : 'bg-stone-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.isAvailable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                      <Utensils className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>No items found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[2rem] w-full max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-stone-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-2 -mr-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Item Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    placeholder="e.g. Masala Dosa"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Price (₹)</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Category</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium appearance-none"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Image URL (Optional)</label>
                  <input 
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-sm text-stone-600"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Description (Optional)</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium resize-none text-sm"
                    placeholder="Brief description of the item..."
                  />
                </div>

                <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 cursor-pointer" onClick={() => setFormData({...formData, isVeg: !formData.isVeg})}>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isVeg ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-stone-300'}`}>
                    {formData.isVeg && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-bold text-stone-700 select-none">This is a Vegetarian Item</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {formSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}
