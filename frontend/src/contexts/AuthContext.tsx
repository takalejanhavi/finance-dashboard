import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import type { User, Role } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
  isAtLeast: (role: Role) => boolean
}

interface RegisterData {
  email: string
  firstName: string
  lastName: string
  password: string
}

const ROLE_HIERARCHY: Record<Role, number> = { VIEWER: 0, ANALYST: 1, ADMIN: 2 }

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { accessToken, user: userData } = res.data.data
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post('/auth/register', data)
    const { accessToken, user: userData } = res.data.data
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles: Role[]) => {
    return !!user && roles.includes(user.role)
  }, [user])

  const isAtLeast = useCallback((role: Role) => {
    if (!user) return false
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role]
  }, [user])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, hasRole, isAtLeast }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
