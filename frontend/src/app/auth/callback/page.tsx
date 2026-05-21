'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Suspense } from 'react'

function CallbackHandler() {
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        login(user, token)
      } catch (e) {
        window.location.href = '/login?error=google_failed'
      }
    } else {
      window.location.href = '/login?error=google_failed'
    }
  }, [])

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">☕</div>
        <p className="text-amber-800 font-medium">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-5xl animate-bounce">☕</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
