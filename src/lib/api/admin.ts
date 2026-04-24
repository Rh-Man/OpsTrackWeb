import { apiClient } from './client'
import type { OpsUser, CreateUserInput, Report } from '@/types'

// Le backend retourne snake_case, on normalise en camelCase
function normalizeUser(raw: any): OpsUser {
  return {
    userId: raw.user_id || raw.userId,
    email: raw.email || '',
    username: raw.username,
    role: raw.role,
    organizationId: raw.organization_id || raw.organizationId,
    createdAt: raw.created_at || raw.createdAt,
  }
}

export const adminApi = {
  getUsers: async (): Promise<OpsUser[]> => {
    const data = await apiClient.get<{ users: any[]; count: number }>('/admin/users')
    return (data.users || []).map(normalizeUser)
  },

  // Récupère uniquement les agents et superviseurs (pour assignation)
  getAssignableUsers: async (): Promise<OpsUser[]> => {
    const data = await apiClient.get<{ users: any[]; count: number }>('/admin/users')
    return (data.users || [])
      .filter((u: any) => u.role === 'agent' || u.role === 'supervisor')
      .map(normalizeUser)
  },

  createUser: async (input: CreateUserInput): Promise<OpsUser> => {
    // Le backend attend { email, role } — pas de champ "name" dans le schéma Zod
    const res = await apiClient.post<{ message: string; userId: string; email: string; role: string }>(
      '/admin/users',
      { email: input.email, role: input.role }
    )
    return {
      userId: res.userId,
      email: res.email,
      role: res.role as OpsUser['role'],
    }
  },

  getReports: async (filters?: {
    from?: string
    to?: string
    assigneeId?: string
    status?: string
  }): Promise<Report> => {
    const params = new URLSearchParams()
    if (filters?.from) params.append('from', filters.from)
    if (filters?.to) params.append('to', filters.to)
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId)
    if (filters?.status) params.append('status', filters.status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<Report>(`/reports${query}`)
  },

  // Le backend utilise POST /tickets/{ticketId}/assign
  assignTicket: async (ticketId: string, assigneeId: string): Promise<void> => {
    await apiClient.post(`/tickets/${ticketId}/assign`, { assigneeId })
  },
}
