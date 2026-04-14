import { apiClient } from './client'
import type { User } from '@/types'

export const userApi = {
  // Get current user info
  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/me')
  },
}
