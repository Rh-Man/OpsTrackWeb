'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CommentList } from '@/components/tickets/comment-list'
import { CommentForm } from '@/components/tickets/comment-form'
import { FileUpload } from '@/components/tickets/file-upload'
import { ticketsApi } from '@/lib/api/tickets'
import { AlertCircle, Paperclip, Upload } from 'lucide-react'
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

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => ticketsApi.addComment(ticketId, { content: text }),
    onSuccess: () => {
      // Invalide le cache des commentaires → refetch automatique
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] })
    },
  })

  const handleUploadComplete = () => {
    // Invalide le cache des attachments → refetch automatique
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
            <CommentForm onSubmit={(text) => addCommentMutation.mutateAsync(text)} />
            <CommentList comments={comments} />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
