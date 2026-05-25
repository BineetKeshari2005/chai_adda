'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, ShieldCheck, Coffee, Crown, Phone, Calendar, Loader2, MapPin, Edit3, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalOrders: 0 })
  const [profile, setProfile] = useState({ phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', address: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      const fetchData = async () => {
        try {
          const [ordersRes, profileRes] = await Promise.all([
            api.get('/api/orders/my'),
            api.get('/api/users/profile')
          ])
          
          setStats({ totalOrders: ordersRes.data.orders.length })
          
          const p = profileRes.data.user
          setProfile({ phone: p.phone || '', address: p.address || '' })
          setEditForm({ phone: p.phone || '', address: p.address || '' })
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/api/users/profile', editForm)
      setProfile(editForm)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update profile', err)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
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
      
      {/* Background Header Decoration */}
      <div className="h-48 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 w-full absolute top-0 left-0 z-0 opacity-90" />
      <div className="absolute top-0 left-0 w-full h-48 z-0 bg-[url('https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />

      <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 pt-32 relative z-10">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-stone-200/50 border border-stone-100 mb-8 relative">
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative -mt-20 md:mt-0">
              <div className="w-32 h-32 bg-gradient-to-br from-stone-800 to-stone-900 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-stone-900/20 border-4 border-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black text-stone-900 tracking-tight">{user.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-stone-500 font-medium">
                  <Mail className="w-4 h-4" /> {user.email}
                </span>
              </div>
              
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-200">
                  <Crown className="w-3.5 h-3.5" /> {user.role} Member
                </span>
                <span className="bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-200">
                  <Calendar className="w-3.5 h-3.5" /> Joined Recently
                </span>
              </div>
            </div>
            
            <div className="hidden md:block h-24 w-px bg-stone-100 mx-4" />

            {/* Quick Stats side */}
            <div className="flex gap-8 w-full md:w-auto justify-center pt-6 md:pt-0 border-t md:border-t-0 border-stone-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Coffee className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black text-stone-900">{stats.totalOrders}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Total Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Account Details */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" /> Account Information
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditForm(profile)
                      setIsEditing(false)
                    }}
                    className="text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Full Name</p>
                  <p className="font-semibold text-stone-800 mt-0.5">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-semibold text-stone-800 mt-0.5">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Phone Number</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full mt-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className={`font-semibold mt-0.5 ${profile.phone ? 'text-stone-800' : 'text-stone-400 italic'}`}>
                      {profile.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Hostel / Address</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full mt-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter room / hostel details"
                    />
                  ) : (
                    <p className={`font-semibold mt-0.5 ${profile.address ? 'text-stone-800' : 'text-stone-400 italic'}`}>
                      {profile.address || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
