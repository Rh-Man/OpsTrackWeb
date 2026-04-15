export interface SignUpParams {
  email: string
  password: string
  givenName: string
  familyName?: string
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
  signUp: async ({ email, password, givenName, familyName }: SignUpParams) => {
    try {
      // Nouveau backend utilise "username" au lieu de "givenName/familyName"
      const username = familyName ? `${givenName} ${familyName}` : givenName
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })
      const data = await response.json()
      if (!response.ok) return { success: false, error: data.error || data.message || 'Inscription échouée' }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur réseau' }
    }
  },

  confirmSignUp: async ({ email, code }: ConfirmSignUpParams) => {
    try {
      const response = await fetch(`${API_URL}/auth/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await response.json()
      if (!response.ok) return { success: false, error: data.error || data.message || 'Confirmation échouée' }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur réseau' }
    }
  },

  signIn: async ({ email, password }: SignInParams) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) return { success: false, error: data.error || data.message || 'Connexion échouée' }
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
      if (data.idToken) localStorage.setItem('idToken', data.idToken)
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur réseau' }
    }
  },

  signOut: async () => {
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('idToken')
      localStorage.removeItem('refreshToken')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('idToken')
      if (!token) return { success: false, user: null }
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        success: true,
        user: { userId: payload.sub, email: payload.email },
      }
    } catch {
      return { success: false, user: null }
    }
  },

  // IMPORTANT: API Gateway Cognito Authorizer accepte uniquement l'idToken
  getAccessToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('idToken')
  },

  refreshTokens: async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return false
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!response.ok) return false
      const data = await response.json()
      if (data.idToken) localStorage.setItem('idToken', data.idToken)
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
      return true
    } catch {
      return false
    }
  },
}
