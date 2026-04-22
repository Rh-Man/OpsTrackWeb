import { apiClient } from './client'
import type { OpsUser, CreateUserInput, Report } from '@/types'

export const adminApi = {
  getUsers: async (): Promise<OpsUser[]> => {
    const data = await apiClient.get<{ users: OpsUser[] }>('/admin/users')
    return data.users || []
  },

  createUser: async (data: CreateUserInput): Promise<OpsUser> => {
    const res = await apiClient.post<{ user: OpsUser }>('/admin/users', data)
    return res.user
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

  assignTicket: async (ticketId: string, assigneeId: string): Promise<void> => {
    await apiClient.post(`/tickets/${ticketId}/assign`, { assigneeId })
  },
}
