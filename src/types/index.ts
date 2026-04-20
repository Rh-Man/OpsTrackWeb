export interface User {
  userId: string
  email: string
  username?: string
  givenName?: string
  familyName?: string
  emailVerified?: boolean
}

// Nouveau backend : statuts en MAJUSCULES
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Ticket {
  id: string        // nouveau backend utilise "id"
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
  content: string   // nouveau backend utilise "content"
  createdAt: string
}

export interface Attachment {
  attachmentId: string
  ticketId?: string
  fileName: string
  fileSize?: number
  fileType?: string
  s3Key?: string
  uploadedAt: string
  url?: string
}

export interface CreateTicketInput {
  title: string
  description: string
  priority?: TicketPriority
}

export interface CreateCommentInput {
  content: string   
}

export interface PresignedUrlResponse {
  uploadUrl: string
  attachmentId: string
  expiresIn: number
}
