import { apiClient } from './client'
import type { User } from '@/types'

export const userApi = {
  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/me')
  },
}
