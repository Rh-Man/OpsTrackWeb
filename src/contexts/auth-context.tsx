'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authHelpers } from '@/lib/auth/auth-helpers'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, givenName: string, familyName?: string) => Promise<{ success: boolean; error?: string }>
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
          userId: cognitoUser.userId,
          email: cognitoUser.email || '',
        })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUser()

    // Synchroniser la déconnexion entre les onglets
    const handleStorageChange = (e: StorageEvent) => {
      // Si les tokens sont supprimés dans un autre onglet, déconnecter cet onglet aussi
      if (e.key === 'idToken' && e.newValue === null) {
        setUser(null)
      }
      // Si un token est ajouté (connexion dans un autre onglet), recharger l'utilisateur
      if (e.key === 'idToken' && e.newValue !== null) {
        loadUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await authHelpers.signIn({ email, password })
    if (result.success) await loadUser()
    return result
  }

  const signUp = async (email: string, password: string, givenName: string, familyName?: string) => {
    return authHelpers.signUp({ email, password, givenName, familyName })
  }

  const signOut = async () => {
    await authHelpers.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    await loadUser()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
