import { API_CONFIG, HTTP_STATUS, ERROR_CODES } from './config'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp: string
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 500,
    public details?: any,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout: number
  private defaultRetries: number
  private defaultRetryDelay: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.defaultTimeout = API_CONFIG.TIMEOUT
    this.defaultRetries = API_CONFIG.RETRY_ATTEMPTS
    this.defaultRetryDelay = API_CONFIG.RETRY_DELAY
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const timeout = config.timeout || this.defaultTimeout
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          ERROR_CODES.TIMEOUT_ERROR,
          `Request timeout after ${timeout}ms`,
          0
        )
      }
      throw error
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const retries = config.retries ?? this.defaultRetries
    const retryDelay = config.retryDelay ?? this.defaultRetryDelay

    const requestConfig: RequestConfig = {
      ...config,
      headers: {
        ...this.getDefaultHeaders(),
        ...config.headers,
      },
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, requestConfig)
        const data = await response.json()

        if (!response.ok) {
          const errorCode = this.getErrorCode(response.status)
          throw new ApiError(
            data.error?.code || errorCode,
            data.error?.message || response.statusText,
            response.status,
            data.error?.details
          )
        }

        return data
      } catch (error) {
        lastError = error as Error
        
        // 不重试的错误类型
        if (
          error instanceof ApiError &&
          (error.status === HTTP_STATUS.UNAUTHORIZED ||
           error.status === HTTP_STATUS.FORBIDDEN ||
           error.status === HTTP_STATUS.NOT_FOUND ||
           error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY)
        ) {
          throw error
        }

        // 最后一次尝试，抛出错误
        if (attempt === retries) {
          break
        }

        // 等待后重试
        await this.sleep(retryDelay * Math.pow(2, attempt))
      }
    }

    // 处理网络错误
    if (lastError instanceof ApiError) {
      throw lastError
    }

    throw new ApiError(
      ERROR_CODES.NETWORK_ERROR,
      'Network request failed',
      0,
      lastError
    )
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_ERROR
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_CODES.AUTHENTICATION_ERROR
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_CODES.AUTHORIZATION_ERROR
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_CODES.NOT_FOUND_ERROR
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_CODES.SERVER_ERROR
      default:
        return ERROR_CODES.UNKNOWN_ERROR
    }
  }

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return this.makeRequest<T>(url, {
      ...config,
      method: 'GET',
    })
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'DELETE',
    })
  }

  async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const headers = { ...this.getDefaultHeaders() }
    delete headers['Content-Type'] // Let browser set it for FormData

    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      headers,
      body: formData,
    })
  }
}

// 创建单例实例
export const apiClient = new ApiClient()

// 导出便捷方法
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  upload: apiClient.upload.bind(apiClient),
}