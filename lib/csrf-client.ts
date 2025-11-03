// Client-side CSRF token management utilities

export class CSRFClient {
  private static readonly TOKEN_KEY = 'csrf-token'
  private static readonly HEADER_NAME = 'X-CSRF-Token'

  // Generate and store CSRF token
  static generateToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const token = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('')

    // Store in cookie for automatic inclusion in requests
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; secure; samesite=strict; max-age=3600`

    return token
  }

  // Get current CSRF token
  static getToken(): string | null {
    // Try cookie first
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === this.TOKEN_KEY) {
        return value
      }
    }

    // Fallback to localStorage
    return localStorage.getItem(this.TOKEN_KEY)
  }

  // Add CSRF token to fetch options
  static addTokenToRequest(options: RequestInit): RequestInit {
    const token = this.getToken()

    if (!token) {
      return options
    }

    const headers = new Headers(options.headers)

    // Add to headers
    headers.set(this.HEADER_NAME, token)

    // Add to body if it's JSON
    if (options.body && typeof options.body === 'string') {
      try {
        const body = JSON.parse(options.body)
        body.csrfToken = token
        options.body = JSON.stringify(body)
      } catch {
        // If body isn't JSON, just add the header
      }
    }

    return {
      ...options,
      headers,
    }
  }

  // Wrapper for fetch with CSRF protection
  static async fetchWithCSRF(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const optionsWithToken = this.addTokenToRequest(options)
    return fetch(url, optionsWithToken)
  }

  // Initialize CSRF token for the session
  static initialize(): string {
    const existingToken = this.getToken()
    if (existingToken) {
      return existingToken
    }

    return this.generateToken()
  }
}

// React hook for CSRF token management
export function useCSRF() {
  const token = CSRFClient.initialize()

  const postWithCSRF = async (url: string, data: any) => {
    return CSRFClient.fetchWithCSRF(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  const putWithCSRF = async (url: string, data: any) => {
    return CSRFClient.fetchWithCSRF(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  const deleteWithCSRF = async (url: string) => {
    return CSRFClient.fetchWithCSRF(url, {
      method: 'DELETE',
    })
  }

  return {
    token,
    postWithCSRF,
    putWithCSRF,
    deleteWithCSRF,
  }
}
