'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authHelpers } from '@/lib/auth/auth-helpers'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = async () => {
    try {
      const { success, user: cognitoUser } = await authHelpers.getCurrentUser()
      if (success && cognitoUser) {
        setUser({
          id: cognitoUser.userId,
          email: cognitoUser.signInDetails?.loginId || '',
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await authHelpers.signIn({ email, password })
    if (result.success) {
      await loadUser()
    }
    return result
  }

  const signUp = async (email: string, password: string, name?: string) => {
    return authHelpers.signUp({ email, password, name })
  }

  const signOut = async () => {
    await authHelpers.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    await loadUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
