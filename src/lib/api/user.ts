import { apiClient } from './client'
import type { User } from '@/types'

// Le backend GET /me retourne { userId, email, username }
// Le rôle vient de GET /admin/users ou d'un endpoint dédié
// On enrichit avec le rôle depuis le token JWT si disponible
function getRoleFromToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const token = localStorage.getItem('idToken')
  if (!token) return undefined
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Le rôle peut être dans les custom claims Cognito
    return payload['custom:role'] || payload['cognito:groups']?.[0]
  } catch {
    return undefined
  }
}

export const userApi = {
  getMe: async (): Promise<User> => {
    const data = await apiClient.get<{ userId: string; email: string; username?: string; role?: string }>('/me')
    return {
      userId: data.userId,
      email: data.email,
      username: data.username,
      role: data.role as User['role'],
    }
  },

  // Récupère le rôle de l'utilisateur depuis RDS
  getMyRole: async (): Promise<string | null> => {
    try {
      const data = await apiClient.get<{ role: string }>('/me/role')
      return data.role
    } catch {
      return null
    }
  },
}
