'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { CommentList } from '@/components/tickets/comment-list'
import { CommentForm } from '@/components/tickets/comment-form'
import { FileUpload } from '@/components/tickets/file-upload'
import { ticketsApi } from '@/lib/api/tickets'
import { adminApi } from '@/lib/api/admin'
import { userApi } from '@/lib/api/user'
import { AlertCircle, Paperclip, Upload, UserCheck } from 'lucide-react'
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

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string
  const queryClient = useQueryClient()
  const [selectedAgent, setSelectedAgent] = useState('')
  const [assignSuccess, setAssignSuccess] = useState(false)
  const [showReassign, setShowReassign] = useState(false)

  const { data: ticket, isLoading: ticketLoading, error: ticketError } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsApi.getTicket(ticketId),
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', ticketId],
    queryFn: () => ticketsApi.getComments(ticketId),
    enabled: !!ticketId,
  })

  const { data: attachments = [] } = useQuery({
    queryKey: ['attachments', ticketId],
    queryFn: () => ticketsApi.getAttachments(ticketId),
    enabled: !!ticketId,
  })

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe,
  })

  const { data: agents = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
    enabled: currentUser?.role === 'admin' || currentUser?.role === 'supervisor',
    // Ignorer les erreurs si l'utilisateur n'a pas les permissions
    retry: false,
  })

  const canAssign = currentUser?.role === 'admin' || currentUser?.role === 'supervisor'

  // Récupérer le nom de l'utilisateur assigné
  const assignedUser = ticket?.assignedTo 
    ? agents.find(agent => agent.userId === ticket.assignedTo)
    : null
  
  // Afficher le nom ou l'email, sinon l'ID tronqué
  const assignedToDisplay = assignedUser 
    ? (ticket.assignedTo === currentUser?.userId 
        ? `moi (${assignedUser.username || assignedUser.email})`
        : (assignedUser.username || assignedUser.email))
    : (ticket?.assignedTo ? `Agent ${ticket.assignedTo.slice(0, 8)}...` : null)

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => ticketsApi.addComment(ticketId, { content: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] })
    },
  })

  const assignMutation = useMutation({
    mutationFn: (assigneeId: string) => adminApi.assignTicket(ticketId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      setAssignSuccess(true)
      setShowReassign(false)
      setTimeout(() => setAssignSuccess(false), 3000)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => ticketsApi.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    },
  })

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['attachments', ticketId] })
  }

  if (ticketLoading) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du ticket...</p>
        </div>
      </ProtectedLayout>
    )
  }

  if (ticketError || !ticket) {
    return (
      <ProtectedLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{(ticketError as Error)?.message || 'Ticket introuvable'}</AlertDescription>
        </Alert>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-5xl space-y-6">
        <Card className="border-2 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b px-6 py-4">
            <div className="flex justify-between items-start mb-3">
              <div className="space-x-2">
                {ticket.priority && (
                  <Badge className={`${priorityColors[ticket.priority]} font-semibold text-sm px-3 py-1`}>
                    {ticket.priority}
                  </Badge>
                )}
                <Badge className={`${statusColors[ticket.status]} font-semibold text-sm px-3 py-1`}>
                  {ticket.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono bg-white px-3 py-1 rounded-full">
                #{ticket.id.slice(0, 8)}
              </p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Créé le {formatDate(ticket.createdAt)}</span>
              <span>Mis à jour le {formatDate(ticket.updatedAt)}</span>
              {assignedToDisplay && (
                <span className="flex items-center gap-1 text-cyan-600 font-medium">
                  <UserCheck className="h-4 w-4" />
                  Assigné à {assignedToDisplay}
                </span>
              )}
            </div>
          </div>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Description</h3>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">
              {ticket.description}
            </p>

            {attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-900">
                  <Paperclip className="h-5 w-5 mr-2 text-cyan-600" />
                  Pièces jointes ({attachments.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.attachmentId}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border-2 rounded-xl hover:border-cyan-300 hover:bg-cyan-50 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center mr-3">
                        <Paperclip className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(attachment.uploadedAt)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boutons de changement de statut - visible uniquement si le ticket est assigné à l'utilisateur connecté */}
        {ticket.assignedTo === currentUser?.userId && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Changer le statut</h2>
              {updateStatusMutation.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{(updateStatusMutation.error as Error).message}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-3 flex-wrap">
                {ticket.status === 'OPEN' && (
                  <Button
                    onClick={() => updateStatusMutation.mutate('IN_PROGRESS')}
                    disabled={updateStatusMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Prendre en charge
                  </Button>
                )}
                {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                  <Button
                    onClick={() => updateStatusMutation.mutate('RESOLVED')}
                    disabled={updateStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updateStatusMutation.isPending ? 'En cours...' : 'Résoudre'}
                  </Button>
                )}
                {ticket.status === 'RESOLVED' && (
                  <Button
                    onClick={() => updateStatusMutation.mutate('CLOSED')}
                    disabled={updateStatusMutation.isPending}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Fermer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {canAssign && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-cyan-600" />
                Assigner le ticket
              </h2>
              {ticket.assignedTo && !showReassign ? (
                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <span className="text-sm text-cyan-800 font-medium">
                    Déjà assigné à {assignedToDisplay}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowReassign(true)} className="text-xs">
                    Réassigner
                  </Button>
                </div>
              ) : (
                <>
                  {assignSuccess && (
                    <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                      <AlertDescription>Ticket assigné avec succès !</AlertDescription>
                    </Alert>
                  )}
                  {assignMutation.error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{(assignMutation.error as Error).message}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-3">
                    <Select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="flex-1 h-11"
                      disabled={assignMutation.isPending}
                    >
                      <option value="">Sélectionner un agent...</option>
                      {currentUser && (
                        <option value={currentUser.userId}>
                          M'assigner à moi-même
                        </option>
                      )}
                      {agents.filter(a => a.userId !== currentUser?.userId).map((agent) => (
                        <option key={agent.userId} value={agent.userId}>
                          {agent.username || agent.email} ({agent.role})
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={() => selectedAgent && assignMutation.mutate(selectedAgent)}
                      disabled={!selectedAgent || assignMutation.isPending}
                      className="gradient-primary h-11 px-6"
                    >
                      {assignMutation.isPending ? 'Assignation...' : 'Assigner'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Upload className="h-6 w-6 mr-2 text-cyan-600" />
            Ajouter une pièce jointe
          </h2>
          <FileUpload ticketId={ticketId} onUploadComplete={handleUploadComplete} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Commentaires
            {comments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">({comments.length})</span>
            )}
          </h2>
          <div className="space-y-4">
            <CommentForm onSubmit={async (text) => { await addCommentMutation.mutateAsync(text) }} />
            <CommentList comments={comments} />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
