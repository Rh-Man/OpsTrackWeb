import { apiClient } from './client'
import type { Ticket, Comment, Attachment, CreateTicketInput, CreateCommentInput, PresignedUrlResponse } from '@/types'

export const ticketsApi = {
  // GET /tickets → { tickets: [], count: N }
  getTickets: async (): Promise<Ticket[]> => {
    const data = await apiClient.get<{ tickets: Ticket[]; count: number }>('/tickets')
    return data.tickets
  },

  // GET /tickets/{ticketId} → { ticket: {} }
  getTicket: async (ticketId: string): Promise<Ticket> => {
    const data = await apiClient.get<{ ticket: Ticket }>(`/tickets/${ticketId}`)
    return data.ticket
  },

  // GET /tickets/{ticketId}/comments → { comments: [] }
  getComments: async (ticketId: string): Promise<Comment[]> => {
    const data = await apiClient.get<{ comments: Comment[] }>(`/tickets/${ticketId}/comments`)
    return data.comments || []
  },

  // GET /tickets/{ticketId}/attachments → { attachments: [] }
  getAttachments: async (ticketId: string): Promise<Attachment[]> => {
    const data = await apiClient.get<{ attachments: Attachment[] }>(`/tickets/${ticketId}/attachments`)
    return data.attachments || []
  },

  // POST /tickets → { ticket: {} }
  createTicket: async (data: CreateTicketInput): Promise<Ticket> => {
    const res = await apiClient.post<{ ticket: Ticket }>('/tickets', data)
    return res.ticket
  },

  // POST /tickets/{ticketId}/comments → { comment: {} }
  addComment: async (ticketId: string, data: CreateCommentInput): Promise<Comment> => {
    const res = await apiClient.post<{ comment: Comment }>(`/tickets/${ticketId}/comments`, data)
    return res.comment
  },

  // POST /tickets/{ticketId}/attachments/presign → { uploadUrl, attachmentId, expiresIn }
  getPresignedUrl: async (ticketId: string, fileName: string, contentType: string): Promise<PresignedUrlResponse> => {
    return apiClient.post<PresignedUrlResponse>(`/tickets/${ticketId}/attachments/presign`, {
      fileName,
      contentType,
    })
  },

  // Upload direct sur S3 via URL signée
  uploadFile: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    if (!response.ok) throw new Error("Échec de l'upload")
  },
}
