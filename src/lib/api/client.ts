import { authHelpers } from '@/lib/auth/auth-helpers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    }

    if (requiresAuth) {
      const token = authHelpers.getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
