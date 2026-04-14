export interface SignUpParams {
  email: string
  password: string
  name?: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface ConfirmSignUpParams {
  email: string
  code: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const authHelpers = {
  signUp: async ({ email, password, name }: SignUpParams) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' }
      }

      return { success: true, userId: data.userId }
    } catch (error: any) {
      console.error('SignUp error:', error)
      return { success: false, error: error.message || 'Network error' }
    }
  },

  confirmSignUp: async ({ email, code }: ConfirmSignUpParams) => {
    try {
      const response = await fetch(`${API_URL}/auth/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Confirmation failed' }
      }

      return { success: true }
    } catch (error: any) {
      console.error('ConfirmSignUp error:', error)
      return { success: false, error: error.message || 'Network error' }
    }
  },

  signIn: async ({ email, password }: SignInParams) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' }
      }

      // Store tokens in localStorage
      if (data.token) {
        localStorage.setItem('accessToken', data.token)
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      if (data.idToken) {
        localStorage.setItem('idToken', data.idToken)
      }

      return { success: true }
    } catch (error: any) {
      console.error('SignIn error:', error)
      return { success: false, error: error.message || 'Network error' }
    }
  },

  signOut: async () => {
    try {
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('idToken')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  getCurrentUser: async () => {
    try {
      const token = authHelpers.getAccessToken()
      if (!token) {
        return { success: false, user: null }
      }

      // Decode JWT to get user info (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      return {
        success: true,
        user: {
          userId: payload.sub,
          signInDetails: {
            loginId: payload.email || payload.username,
          },
        },
      }
    } catch (error) {
      return { success: false, user: null }
    }
  },

  getAccessToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  },
}
