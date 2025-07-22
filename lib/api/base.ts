// API基础配置和工具函数
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

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
    this.name = "ApiError"
  }
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
  }

  // 添加认证头
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error?.code || "API_ERROR",
        data.error?.message || "An error occurred",
        response.status,
        data.error?.details,
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError("NETWORK_ERROR", "Network request failed", 0, error)
  }
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return apiRequest<T>(url.pathname + url.search)
  },

  post: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: "DELETE",
    }),
}
