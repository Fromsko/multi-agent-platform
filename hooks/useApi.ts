import { useState, useEffect, useCallback, useRef } from 'react'
import { useUIStore } from '@/stores/ui.store'
import type { ApiResponse } from '@/services/types'
import toast from 'react-hot-toast'

/**
 * 通用API hooks
 */

// 基础API请求hook
export const useApiRequest = <T = any>(options: {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  loadingKey?: string
} = {}) => {
  const { immediate = false, onSuccess, onError, loadingKey } = options
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { setLoading } = useUIStore()
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    setIsLoading(true)
    setError(null)
    
    if (loadingKey) {
      setLoading(loadingKey, true)
    }
    
    try {
      const response = await apiCall()
      
      if (response.success && response.data) {
        setData(response.data)
        onSuccess?.(response.data)
        return response.data
      } else {
        const errorMessage = response.error?.message || '请求失败'
        setError(errorMessage)
        onError?.(errorMessage)
        return null
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // 请求被取消，不处理
        return null
      }
      
      const errorMessage = err instanceof Error ? err.message : '请求失败'
      setError(errorMessage)
      onError?.(errorMessage)
      return null
    } finally {
      setIsLoading(false)
      if (loadingKey) {
        setLoading(loadingKey, false)
      }
    }
  }, [onSuccess, onError, loadingKey, setLoading])
  
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])
  
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])
  
  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  return {
    data,
    error,
    isLoading,
    execute,
    reset,
    cancel,
  }
}

// 分页数据hook
export const usePaginatedApi = <T = any>(options: {
  apiCall: (params: any) => Promise<ApiResponse<{ items: T[], total: number, page: number, limit: number }>>
  initialParams?: any
  immediate?: boolean
  onSuccess?: (data: { items: T[], total: number, page: number, limit: number }) => void
  onError?: (error: string) => void
} = {} as any) => {
  const { apiCall, initialParams = {}, immediate = true, onSuccess, onError } = options
  
  const [items, setItems] = useState<T[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [params, setParams] = useState(initialParams)
  
  const { execute, isLoading, error } = useApiRequest<{ items: T[], total: number, page: number, limit: number }>({
    onSuccess: (data) => {
      setItems(data.items)
      setPagination({
        page: data.page,
        limit: data.limit || 20,
        total: data.total,
        totalPages: Math.ceil(data.total / (data.limit || 20)),
      })
      onSuccess?.(data)
    },
    onError,
  })
  
  const fetchData = useCallback((newParams = {}) => {
    const mergedParams = { ...params, ...newParams }
    setParams(mergedParams)
    return execute(() => apiCall(mergedParams))
  }, [apiCall, params, execute])
  
  const refresh = useCallback(() => {
    return fetchData()
  }, [fetchData])
  
  const goToPage = useCallback((page: number) => {
    return fetchData({ page })
  }, [fetchData])
  
  const changePageSize = useCallback((limit: number) => {
    return fetchData({ page: 1, limit })
  }, [fetchData])
  
  const search = useCallback((searchParams: any) => {
    return fetchData({ page: 1, ...searchParams })
  }, [fetchData])
  
  // 初始加载
  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [immediate]) // 只在immediate变化时执行
  
  return {
    items,
    pagination,
    params,
    isLoading,
    error,
    fetchData,
    refresh,
    goToPage,
    changePageSize,
    search,
    hasMore: pagination.page < pagination.totalPages,
    isEmpty: items.length === 0 && !isLoading,
  }
}

// 无限滚动hook
export const useInfiniteApi = <T = any>(options: {
  apiCall: (params: any) => Promise<ApiResponse<{ items: T[], hasMore: boolean, nextCursor?: string }>>
  initialParams?: any
  immediate?: boolean
  onSuccess?: (data: { items: T[], hasMore: boolean, nextCursor?: string }) => void
  onError?: (error: string) => void
} = {} as any) => {
  const { apiCall, initialParams = {}, immediate = true, onSuccess, onError } = options
  
  const [items, setItems] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [params, setParams] = useState(initialParams)
  
  const { execute, isLoading, error } = useApiRequest<{ items: T[], hasMore: boolean, nextCursor?: string }>({
    onSuccess: (data) => {
      setItems(prev => [...prev, ...data.items])
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
      onSuccess?.(data)
    },
    onError,
  })
  
  const fetchData = useCallback((newParams = {}, append = false) => {
    const mergedParams = { ...params, ...newParams }
    if (!append) {
      setItems([])
      setHasMore(true)
      setNextCursor(undefined)
    }
    setParams(mergedParams)
    return execute(() => apiCall(mergedParams))
  }, [apiCall, params, execute])
  
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    
    const loadParams = { ...params }
    if (nextCursor) {
      loadParams.cursor = nextCursor
    }
    
    return execute(() => apiCall(loadParams))
  }, [apiCall, params, nextCursor, hasMore, isLoading, execute])
  
  const refresh = useCallback(() => {
    return fetchData()
  }, [fetchData])
  
  const search = useCallback((searchParams: any) => {
    return fetchData(searchParams)
  }, [fetchData])
  
  // 初始加载
  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [immediate]) // 只在immediate变化时执行
  
  return {
    items,
    hasMore,
    isLoading,
    error,
    fetchData,
    loadMore,
    refresh,
    search,
    isEmpty: items.length === 0 && !isLoading,
  }
}

// 表单提交hook
export const useFormSubmit = <T = any>(options: {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
  loadingKey?: string
} = {}) => {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    loadingKey,
  } = options
  
  const { execute, isLoading, error } = useApiRequest<T>({
    onSuccess: (data) => {
      if (successMessage) {
        toast.success(successMessage)
      }
      onSuccess?.(data)
    },
    onError: (err) => {
      if (errorMessage) {
        toast.error(errorMessage)
      } else {
        toast.error(err)
      }
      onError?.(err)
    },
    loadingKey,
  })
  
  const submit = useCallback((apiCall: () => Promise<ApiResponse<T>>) => {
    return execute(apiCall)
  }, [execute])
  
  return {
    submit,
    isLoading,
    error,
  }
}

// 数据缓存hook
export const useCachedApi = <T = any>(options: {
  key: string
  apiCall: () => Promise<ApiResponse<T>>
  ttl?: number // 缓存时间（毫秒）
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
} = {} as any) => {
  const { key, apiCall, ttl = 5 * 60 * 1000, immediate = true, onSuccess, onError } = options
  
  const [data, setData] = useState<T | null>(() => {
    // 从缓存中获取数据
    const cached = localStorage.getItem(`cache_${key}`)
    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < ttl) {
          return cachedData
        }
      } catch {
        // 缓存数据无效，忽略
      }
    }
    return null
  })
  
  const { execute, isLoading, error } = useApiRequest<T>({
    onSuccess: (responseData) => {
      // 缓存数据
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data: responseData,
        timestamp: Date.now(),
      }))
      setData(responseData)
      onSuccess?.(responseData)
    },
    onError,
  })
  
  const fetchData = useCallback(() => {
    return execute(apiCall)
  }, [execute, apiCall])
  
  const clearCache = useCallback(() => {
    localStorage.removeItem(`cache_${key}`)
    setData(null)
  }, [key])
  
  // 检查缓存是否过期
  const isCacheExpired = useCallback(() => {
    const cached = localStorage.getItem(`cache_${key}`)
    if (!cached) return true
    
    try {
      const { timestamp } = JSON.parse(cached)
      return Date.now() - timestamp >= ttl
    } catch {
      return true
    }
  }, [key, ttl])
  
  // 初始加载
  useEffect(() => {
    if (immediate && (!data || isCacheExpired())) {
      fetchData()
    }
  }, [immediate, data, isCacheExpired, fetchData])
  
  return {
    data,
    isLoading,
    error,
    fetchData,
    clearCache,
    isCacheExpired: isCacheExpired(),
    hasCache: data !== null,
  }
}

// 轮询hook
export const usePolling = <T = any>(options: {
  apiCall: () => Promise<ApiResponse<T>>
  interval: number
  immediate?: boolean
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
} = {} as any) => {
  const { apiCall, interval, immediate = true, enabled = true, onSuccess, onError } = options
  
  const { execute, data, isLoading, error } = useApiRequest<T>({
    onSuccess,
    onError,
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      execute(apiCall)
    }, interval)
  }, [execute, apiCall, interval])
  
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])
  
  const fetchOnce = useCallback(() => {
    return execute(apiCall)
  }, [execute, apiCall])
  
  // 控制轮询
  useEffect(() => {
    if (enabled) {
      if (immediate) {
        fetchOnce()
      }
      startPolling()
    } else {
      stopPolling()
    }
    
    return stopPolling
  }, [enabled, immediate, startPolling, stopPolling, fetchOnce])
  
  return {
    data,
    isLoading,
    error,
    startPolling,
    stopPolling,
    fetchOnce,
    isPolling: intervalRef.current !== null,
  }
}