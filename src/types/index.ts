export interface User {
  userId: string
  email: string
  username?: string
  givenName?: string
  familyName?: string
  emailVerified?: boolean
  role?: 'admin' | 'supervisor' | 'agent' | 'user'
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Ticket {
  id: string
  userId: string
  title: string
  description: string
  status: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  createdAt: string
  updatedAt: string
  attachments?: Attachment[]
  comments?: Comment[]
}

export interface Comment {
  commentId: string
  ticketId?: string
  userId: string
  content: string
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

export interface OpsUser {
  userId: string
  email: string
  username?: string
  role: 'admin' | 'supervisor' | 'agent' | 'user'
  organizationId?: string
  createdAt?: string
}

export interface CreateUserInput {
  email: string
  name: string
  role: 'supervisor' | 'agent'
}

export interface AssignTicketInput {
  assigneeId: string
}

export interface Report {
  summary: {
    total: number
    open: number
    in_progress: number
    resolved: number
    closed: number
  }
  byStatus: { status: string; count: number }[]
  topAssignees: {
    assignee_id: string
    ticket_count: number
    email: string | null
    given_name: string | null
    family_name: string | null
  }[]
}
