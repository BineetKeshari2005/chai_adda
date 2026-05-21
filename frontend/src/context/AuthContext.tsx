'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'ADMIN' | 'STAFF'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.log('Auth restore error:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (userData: User, userToken: string) => {
    try {
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(userToken)
      setUser(userData)

      if (userData.role === 'ADMIN' || userData.role === 'STAFF') {
        window.location.href = '/admin/orders'
      } else {
        window.location.href = '/menu'
      }
    } catch (e) {
      console.log('Login error:', e)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)