'use client'

import { useAuth } from '@/contexts/auth-context'
import { Sidebar } from './sidebar'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0">
        {children}
      </main>
    </div>
  )
}
