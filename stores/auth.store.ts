import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth.service'
import type { User, LoginRequest, RegisterRequest } from '@/services/types'
import toast from 'react-hot-toast'

interface AuthState {
  // 状态
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // 操作
  login: (data: LoginRequest) => Promise<boolean>
  register: (data: RegisterRequest) => Promise<boolean>
  logout: (allDevices?: boolean) => Promise<void>
  refreshAuth: () => Promise<boolean>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  clearError: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 登录
      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.login(data)
          
          if (response.success && response.data) {
            const { user, token, refresh_token } = response.data
            
            // 存储到localStorage
            authService.storeTokens(token, refresh_token)
            authService.storeUser(user)
            
            set({
              user,
              token,
              refreshToken: refresh_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            
            toast.success('登录成功')
            return true
          } else {
            const errorMessage = response.error?.message || '登录失败'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            return false
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '登录失败'
          set({ error: errorMessage, isLoading: false })
          toast.error(errorMessage)
          return false
        }
      },

      // 注册
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.register(data)
          
          if (response.success && response.data) {
            const { user, token, refresh_token } = response.data
            
            // 存储到localStorage
            authService.storeTokens(token, refresh_token)
            authService.storeUser(user)
            
            set({
              user,
              token,
              refreshToken: refresh_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            
            toast.success('注册成功')
            return true
          } else {
            const errorMessage = response.error?.message || '注册失败'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            return false
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '注册失败'
          set({ error: errorMessage, isLoading: false })
          toast.error(errorMessage)
          return false
        }
      },

      // 登出
      logout: async (allDevices = false) => {
        const { refreshToken } = get()
        
        try {
          if (refreshToken) {
            await authService.logout(refreshToken, allDevices)
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // 清除本地存储
          authService.clearAll()
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
          
          toast.success('已退出登录')
        }
      },

      // 刷新认证
      refreshAuth: async () => {
        const { refreshToken } = get()
        
        if (!refreshToken) {
          return false
        }
        
        try {
          const response = await authService.refreshToken(refreshToken)
          
          if (response.success && response.data) {
            const { user, token, refresh_token } = response.data
            
            // 更新存储
            authService.storeTokens(token, refresh_token)
            authService.storeUser(user)
            
            set({
              user,
              token,
              refreshToken: refresh_token,
              isAuthenticated: true,
              error: null,
            })
            
            return true
          } else {
            // 刷新失败，清除认证状态
            authService.clearAll()
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              error: null,
            })
            return false
          }
        } catch (error) {
          // 刷新失败，清除认证状态
          authService.clearAll()
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
          return false
        }
      },

      // 更新用户资料
      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        
        if (!user) {
          return false
        }
        
        set({ isLoading: true, error: null })
        
        try {
          // TODO: 实现更新用户资料的API调用
          // const response = await userService.updateProfile(user.id, data)
          
          // 暂时直接更新本地状态
          const updatedUser = { ...user, ...data }
          authService.storeUser(updatedUser)
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          })
          
          toast.success('资料更新成功')
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '更新失败'
          set({ error: errorMessage, isLoading: false })
          toast.error(errorMessage)
          return false
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null })
      },

      // 检查认证状态
      checkAuth: async () => {
        const storedToken = authService.getStoredToken()
        const storedUser = authService.getStoredUser()
        const storedRefreshToken = authService.getStoredRefreshToken()
        
        if (!storedToken || !storedUser || !storedRefreshToken) {
          return false
        }
        
        // 验证token是否有效
        try {
          const response = await authService.getCurrentUser()
          
          if (response.success && response.data) {
            set({
              user: response.data,
              token: storedToken,
              refreshToken: storedRefreshToken,
              isAuthenticated: true,
              error: null,
            })
            return true
          } else {
            // Token无效，尝试刷新
            return await get().refreshAuth()
          }
        } catch (error) {
          // Token无效，尝试刷新
          return await get().refreshAuth()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// 自动刷新token的hook
import { useEffect } from 'react'

export const useAutoRefreshToken = () => {
  const { refreshAuth, isAuthenticated, refreshToken } = useAuthStore()
  
  // 设置定时刷新
  useEffect(() => {
    if (!isAuthenticated || !refreshToken) {
      return
    }
    
    // 每30分钟尝试刷新一次token
    const interval = setInterval(() => {
      refreshAuth()
    }, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, refreshToken, refreshAuth])
}