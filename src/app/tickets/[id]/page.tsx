'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CommentList } from '@/components/tickets/comment-list'
import { CommentForm } from '@/components/tickets/comment-form'
import { FileUpload } from '@/components/tickets/file-upload'
import { ticketsApi } from '@/lib/api/tickets'
import type { Ticket } from '@/types'
import { AlertCircle, Paperclip, Upload } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = decodeURIComponent(params.id as string)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTicket()
  }, [ticketId])

  const loadTicket = async () => {
    setIsLoading(true)
    try {
      const data = await ticketsApi.getTicket(ticketId)
      setTicket(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du ticket')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (text: string) => {
    await ticketsApi.addComment(ticketId, { text })
    await loadTicket()
  }

  const handleUploadComplete = async () => {
    await loadTicket()
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du ticket...</p>
        </div>
      </ProtectedLayout>
    )
  }

  if (error || !ticket) {
    return (
      <ProtectedLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Ticket introuvable'}</AlertDescription>
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
                #{ticket.ticketId.slice(0, 8)}
              </p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Créé le {formatDate(ticket.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Mis à jour le {formatDate(ticket.updatedAt)}
              </span>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Description</h3>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                {ticket.description}
              </p>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-900">
                  <Paperclip className="h-5 w-5 mr-2 text-cyan-600" />
                  Pièces jointes ({ticket.attachments.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ticket.attachments.map((attachment) => (
                    <a
                      key={attachment.attachmentId}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border-2 rounded-xl hover:border-cyan-300 hover:bg-cyan-50 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center mr-3 group-hover:bg-cyan-200 transition-colors">
                        <Paperclip className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-cyan-600">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(attachment.uploadedAt)}
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
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
            {ticket.comments && ticket.comments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({ticket.comments.length})
              </span>
            )}
          </h2>
          <div className="space-y-4">
            <CommentForm onSubmit={handleAddComment} />
            <CommentList comments={ticket.comments || []} />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
