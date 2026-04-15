'use client'

import { useEffect, useState } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import { userApi } from '@/lib/api/user'
import { ticketsApi } from '@/lib/api/tickets'
import type { User, Ticket } from '@/types'
import { User as UserIcon, Mail, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [userData, ticketsData] = await Promise.all([
        userApi.getMe(),
        ticketsApi.getTickets(),
      ])
      setUser(userData)
      setTickets(ticketsData)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du profil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="max-w-4xl space-y-6">
        <div className="text-center mb-8">
          <div className="inline-block gradient-primary p-4 rounded-2xl mb-4 shadow-glow">
            <UserIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
            Mon profil
          </h1>
          <p className="text-muted-foreground mt-2">Gérez vos informations personnelles</p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Card className="border-2 shadow-xl">
            <CardContent className="py-20 text-center">
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600"></div>
                <div className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-20 animate-pulse"></div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-700">Chargement...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2 border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
                <CardTitle className="text-xl">Informations personnelles</CardTitle>
                <CardDescription>Vos informations de compte OpsTrack</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 pb-6 border-b">
                    <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                      <UserIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {user?.username || user?.givenName ? `${user.givenName || ''} ${user.familyName || ''}`.trim() : 'Utilisateur'}
                      </p>
                      <p className="text-sm text-muted-foreground">Membre actif</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 rounded-lg bg-cyan-50 border border-cyan-100">
                      <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">Adresse email</p>
                        <p className="text-base text-gray-900 mt-1">
                          {user?.email || authUser?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-lg bg-sky-50 border border-sky-100">
                      <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-5 w-5 text-sky-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">Identifiant unique</p>
                        <p className="text-sm text-gray-900 font-mono mt-1 break-all">
                          {user?.userId || authUser?.userId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-br from-cyan-50 to-sky-50 border-b">
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 border border-cyan-200">
                    <p className="text-3xl font-bold text-cyan-600">{tickets.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Tickets créés</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200">
                    <p className="text-3xl font-bold text-blue-600">
                      {tickets.filter(t => t.status === 'IN_PROGRESS').length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">En cours</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-50 border border-green-200">
                    <p className="text-3xl font-bold text-green-600">
                      {tickets.filter(t => t.status === 'RESOLVED').length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Résolus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
