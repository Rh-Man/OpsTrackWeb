'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { adminApi } from '@/lib/api/admin'
import { Plus, AlertCircle, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  supervisor: 'bg-purple-100 text-purple-800',
  agent: 'bg-blue-100 text-blue-800',
  user: 'bg-gray-100 text-gray-800',
}

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  supervisor: 'Superviseur',
  agent: 'Agent',
  user: 'Utilisateur',
}

export default function AdminUsersPage() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  })

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground mt-1">Gérez les superviseurs et agents de votre équipe</p>
          </div>
          <Link href="/admin/users/new">
            <Button className="gradient-primary shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Créer un utilisateur
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : users.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-20 text-center">
              <div className="inline-block p-4 gradient-primary rounded-full mb-4">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun utilisateur</h3>
              <p className="text-muted-foreground mb-6">Créez votre premier superviseur ou agent</p>
              <Link href="/admin/users/new">
                <Button className="gradient-primary">
                  <Plus className="mr-2 h-5 w-5" />
                  Créer un utilisateur
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
              <CardTitle>Équipe ({users.length} membres)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {(user.username || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.username || 'Sans nom'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${roleColors[user.role]} font-medium`}>
                        {roleLabels[user.role]}
                      </Badge>
                      {user.createdAt && (
                        <span className="text-xs text-muted-foreground hidden md:block">
                          Créé le {formatDate(user.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  )
}
