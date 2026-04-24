'use client'

import { useQuery } from '@tanstack/react-query'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { adminApi } from '@/lib/api/admin'
import { AlertCircle, BarChart3, TrendingUp, Users, Ticket } from 'lucide-react'

const statusColors: Record<string, string> = {
  OPEN: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  RESOLVED: 'bg-green-500',
  CLOSED: 'bg-gray-500',
}

const statusLabels: Record<string, string> = {
  OPEN: 'En attente',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolus',
  CLOSED: 'Fermés',
}

export default function ReportsPage() {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: () => adminApi.getReports(),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de l&apos;activité OpsTrack</p>
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
            <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
          </div>
        ) : report ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="inline-block p-3 bg-cyan-100 rounded-xl mb-3">
                    <Ticket className="h-6 w-6 text-cyan-600" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{report.summary.total}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total tickets</p>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="inline-block p-3 bg-yellow-100 rounded-xl mb-3">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-4xl font-bold text-yellow-600">{report.summary.open}</p>
                  <p className="text-sm text-muted-foreground mt-1">En attente</p>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="inline-block p-3 bg-blue-100 rounded-xl mb-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{report.summary.in_progress}</p>
                  <p className="text-sm text-muted-foreground mt-1">En cours</p>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="inline-block p-3 bg-green-100 rounded-xl mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-4xl font-bold text-green-600">{report.summary.resolved}</p>
                  <p className="text-sm text-muted-foreground mt-1">Résolus</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
                  <CardTitle>Répartition par statut</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {report.byStatus.map((item) => (
                    <div key={item.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{statusLabels[item.status] || item.status}</span>
                        <span className="text-muted-foreground">{item.count} tickets</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusColors[item.status] || 'bg-gray-400'}`}
                          style={{ width: `${report.summary.total > 0 ? (item.count / report.summary.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
                  <CardTitle>Top agents</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {report.topAssignees.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun ticket assigné pour le moment</p>
                  ) : (
                    <div className="space-y-3">
                      {report.topAssignees.map((assignee, index) => {
                        const name = assignee.given_name && assignee.family_name
                          ? `${assignee.given_name} ${assignee.family_name}`
                          : assignee.email || assignee.assignee_id.slice(0, 12) + '...'
                        const initials = name.slice(0, 2).toUpperCase()
                        return (
                          <div key={assignee.assignee_id} className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{initials}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{name}</p>
                            </div>
                            <span className="font-bold text-cyan-600">{assignee.ticket_count}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </ProtectedLayout>
  )
}
