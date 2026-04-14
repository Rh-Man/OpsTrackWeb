export interface User {
  id: string
  email: string
  name?: string
}

export enum TicketStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

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
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  attachments?: Attachment[]
  comments?: Comment[]
}

export interface Comment {
  commentId: string
  ticketId: string
  userId: string
  content: string
  createdAt: string
  userName?: string
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
  priority: TicketPriority
}

export interface CreateCommentInput {
  content: string
}

export interface PresignedUrlResponse {
  uploadUrl: string
  fileKey: string
}
