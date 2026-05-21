'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('STUDENT' | 'ADMIN' | 'STAFF')[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login and save the redirect route
        router.push(`/login?redirect=${pathname}`)
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User logged in but does not have the required role
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          router.push('/admin/orders')
        } else {
          router.push('/menu')
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname])

  // Show a premium loading screen while verifying the active session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">☕</div>
          <p className="text-amber-800 font-semibold tracking-wide">Securing session...</p>
        </div>
      </div>
    )
  }

  // Prevent flash of guarded content before the redirect finishes
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}
