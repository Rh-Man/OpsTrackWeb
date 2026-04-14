import { apiClient } from './client'
import type { Ticket, CreateTicketInput, Comment, CreateCommentInput, PresignedUrlResponse } from '@/types'

export const ticketsApi = {
  // Get all tickets for current user
  getTickets: async (): Promise<Ticket[]> => {
    return apiClient.get<Ticket[]>('/tickets')
  },

  // Get single ticket by ID
  getTicket: async (ticketId: string): Promise<Ticket> => {
    return apiClient.get<Ticket>(`/tickets/${ticketId}`)
  },

  // Create new ticket
  createTicket: async (data: CreateTicketInput): Promise<Ticket> => {
    return apiClient.post<Ticket>('/tickets', data)
  },

  // Add comment to ticket
  addComment: async (ticketId: string, data: CreateCommentInput): Promise<Comment> => {
    return apiClient.post<Comment>(`/tickets/${ticketId}/comments`, data)
  },

  // Get presigned URL for file upload
  getPresignedUrl: async (ticketId: string, fileName: string, fileType: string): Promise<PresignedUrlResponse> => {
    return apiClient.post<PresignedUrlResponse>(`/tickets/${ticketId}/attachments/presign`, {
      fileName,
      fileType,
    })
  },

  // Upload file to S3 using presigned URL
  uploadFile: async (presignedUrl: string, file: File): Promise<void> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error('File upload failed')
    }
  },
}
