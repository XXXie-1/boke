// Global type definitions
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface HealthCheckResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  environment: string
}
