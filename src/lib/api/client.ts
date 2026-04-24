import { authHelpers } from '@/lib/auth/auth-helpers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (requiresAuth) {
      const token = authHelpers.getAccessToken()
      if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...fetchOptions, headers })

    if (response.status === 401 && requiresAuth) {
      const refreshed = await authHelpers.refreshTokens()
      if (refreshed) {
        const newToken = authHelpers.getAccessToken()
        if (newToken) headers['Authorization'] = `Bearer ${newToken}`
        const retryResponse = await fetch(`${API_URL}${endpoint}`, { ...fetchOptions, headers })
        if (retryResponse.ok) return retryResponse.json()
      }
      authHelpers.signOut()
      window.location.href = '/login'
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(err.error || err.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) })
  }
}

export const apiClient = new ApiClient()
