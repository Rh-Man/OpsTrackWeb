'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ticketsApi } from '@/lib/api/tickets'
import { userApi } from '@/lib/api/user'
import { Plus, AlertCircle, Ticket as TicketIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const statusColors: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

export default function DashboardPage() {
  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketsApi.getTickets,
  })

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe,
  })

  const isAgent = currentUser?.role === 'agent'
  const canCreateTicket = currentUser?.role === 'admin' || currentUser?.role === 'supervisor'

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-white shadow-glow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{isAgent ? 'Mes tickets assignés' : 'Mes tickets'}</h1>
                <p className="text-cyan-100 text-sm">{isAgent ? 'Tickets qui vous sont assignés' : 'Gérez vos incidents en temps réel'}</p>
              </div>
              {canCreateTicket && (
                <Link href="/tickets/new">
                  <Button size="lg" className="bg-white text-cyan-600 hover:bg-cyan-50 shadow-lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Nouveau ticket
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 hover-lift">
                <p className="text-cyan-100 text-xs font-medium mb-2 uppercase tracking-wide">Total</p>
                <p className="text-4xl font-bold">{tickets.length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 hover-lift">
                <p className="text-cyan-100 text-xs font-medium mb-2 uppercase tracking-wide">En attente</p>
                <p className="text-4xl font-bold">{tickets.filter(t => t.status === 'OPEN').length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 hover-lift">
                <p className="text-cyan-100 text-xs font-medium mb-2 uppercase tracking-wide">En cours</p>
                <p className="text-4xl font-bold">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 hover-lift">
                <p className="text-cyan-100 text-xs font-medium mb-2 uppercase tracking-wide">Résolus</p>
                <p className="text-4xl font-bold">{tickets.filter(t => t.status === 'RESOLVED').length}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700">Chargement des tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 bg-white/50">
            <CardContent className="py-20 text-center">
              <div className="inline-block p-4 gradient-primary rounded-full mb-4">
                <TicketIcon className="h-12 w-12 text-white" />
              </div>
              {isAgent ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">Aucun ticket assigné</h3>
                  <p className="text-muted-foreground">Vous n'avez pas encore de ticket assigné. Un superviseur ou admin vous en assignera un.</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">Aucun ticket</h3>
                  <p className="text-muted-foreground mb-6">Commencez par créer votre premier ticket</p>
                  <Link href="/tickets/new">
                    <Button size="lg" className="gradient-primary shadow-lg hover-lift">
                      <Plus className="mr-2 h-5 w-5" />
                      Créer un ticket
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <Card className="group hover:shadow-xl transition-all cursor-pointer h-full bg-white border-2 hover:border-cyan-200 hover-lift">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex justify-between items-start gap-2">
                      {ticket.priority && (
                        <Badge className={`${priorityColors[ticket.priority]} text-xs px-2.5 py-1 font-medium`}>
                          {ticket.priority}
                        </Badge>
                      )}
                      <Badge className={`${statusColors[ticket.status]} text-xs px-2.5 py-1 font-medium`}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg group-hover:text-cyan-600 transition-colors">
                      {ticket.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2 text-sm mb-4">
                      {ticket.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <span>Créé le {formatDate(ticket.createdAt)}</span>
                      <span className="text-cyan-600 font-medium group-hover:underline">Voir détails →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
