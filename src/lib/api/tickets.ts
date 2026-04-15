import { apiClient } from './client'
import type { Ticket, Comment, CreateTicketInput, CreateCommentInput, PresignedUrlResponse, Attachment } from '@/types'

export const ticketsApi = {
  getTickets: async (): Promise<Ticket[]> => {
    const data = await apiClient.get<{ tickets: Ticket[]; count: number }>('/tickets')
    return data.tickets
  },

  getTicket: async (ticketId: string): Promise<Ticket> => {
    const encodedId = encodeURIComponent(ticketId)
    const data = await apiClient.get<{ ticket: Ticket; comments: Comment[]; attachments: Attachment[] }>(`/tickets/${encodedId}`)
    return { ...data.ticket, comments: data.comments, attachments: data.attachments || [] }
  },

  createTicket: async (data: CreateTicketInput): Promise<Ticket> => {
    const res = await apiClient.post<{ message: string; ticket: Ticket }>('/tickets', data)
    return res.ticket
  },

  addComment: async (ticketId: string, data: CreateCommentInput): Promise<Comment> => {
    const encodedId = encodeURIComponent(ticketId)
    const res = await apiClient.post<{ message: string; comment: Comment }>(`/tickets/${encodedId}/comments`, data)
    return res.comment
  },

  getPresignedUrl: async (ticketId: string, fileName: string, contentType: string): Promise<PresignedUrlResponse> => {
    const encodedId = encodeURIComponent(ticketId)
    return apiClient.post<PresignedUrlResponse>(`/tickets/${encodedId}/attachments/presign`, { fileName, contentType })
  },

  uploadFile: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    if (!response.ok) throw new Error("Échec de l'upload")
  },
}
