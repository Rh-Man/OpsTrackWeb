export interface User {
  userId: string
  email: string
  givenName?: string
  familyName?: string
  emailVerified?: boolean
}

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'closed'

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Ticket {
  ticketId: string
  userId: string
  title: string
  description: string
  status: TicketStatus
  priority?: TicketPriority
  createdAt: string
  updatedAt: string
  attachments?: Attachment[]
  comments?: Comment[]
}

export interface Comment {
  commentId: string
  ticketId?: string
  userId: string
  text: string
  createdAt: string
}

export interface Attachment {
  attachmentId: string
  ticketId: string
  fileName: string
  fileSize: number
  fileType: string
  s3Key: string
  uploadedAt: string
  url?: string
}

export interface CreateTicketInput {
  title: string
  description: string
}

export interface CreateCommentInput {
  text: string
}

export interface PresignedUrlResponse {
  uploadUrl: string
  key: string
  expiresIn: number
}
