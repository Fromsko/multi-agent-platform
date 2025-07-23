import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

/**
 * 认证相关的hooks
 */

// 基础认证hook
export const useAuth = () => {
  const authStore = useAuthStore()
  const { setGlobalLoading } = useUIStore()

  // 登录
  const login = async (email: string, password: string, remember = false) => {
    setGlobalLoading(true)

    try {
      const success = await authStore.login({ email, password })
      return success
    } finally {
      setGlobalLoading(false)
    }
  }

  // 注册
  const register = async (data: {
    email: string
    password: string
    confirmPassword: string
    name: string
    company?: string
  }) => {
    setGlobalLoading(true)

    try {
      const success = await authStore.register(data)
      return success
    } finally {
      setGlobalLoading(false)
    }
  }

  // 登出
  const logout = async (allDevices = false) => {
    setGlobalLoading(true)

    try {
      await authStore.logout(allDevices)
    } finally {
      setGlobalLoading(false)
    }
  }

  return {
    // 状态
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,

    // 操作
    login,
    register,
    logout,
    refreshAuth: authStore.refreshAuth,
    updateProfile: authStore.updateProfile,
    clearError: authStore.clearError,
  }
}

// 路由保护hook
export const useAuthGuard = (options: {
  redirectTo?: string
  requireAuth?: boolean
  requireGuest?: boolean
} = {}) => {
  const {
    redirectTo = '/auth/login',
    requireAuth = true,
    requireGuest = false,
  } = options

  const { isAuthenticated, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      // 检查认证状态
      await checkAuth()

      // 需要认证但未认证
      if (requireAuth && !isAuthenticated) {
        toast.error('请先登录')
        router.push(redirectTo)
        return
      }

      // 需要游客状态但已认证
      if (requireGuest && isAuthenticated) {
        router.push('/dashboard')
        return
      }
    }

    initAuth()
  }, [isAuthenticated, requireAuth, requireGuest, redirectTo, router, checkAuth])

  return {
    isAuthenticated,
    isReady: true, // 可以添加更复杂的就绪状态逻辑
  }
}

// 权限检查hook
export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasPermission = (permission: string) => {
    if (!user) return false

    // 超级管理员拥有所有权限
    if (user.role === 'admin') return true

    // 检查用户权限
    return user.role?.includes(permission) || false
  }

  const hasRole = (role: string) => {
    if (!user) return false
    return user.role === role
  }

  const hasAnyRole = (roles: string[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const hasAnyPermission = (permissions: string[]) => {
    if (!user) return false
    return permissions.some(permission => hasPermission(permission))
  }

  return {
    user,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    isAdmin: hasRole('admin') || hasRole('super_admin'),
    isSuperAdmin: hasRole('super_admin'),
  }
}

// 自动登出hook
export const useAutoLogout = (options: {
  timeout?: number // 无活动超时时间（毫秒）
  warningTime?: number // 警告时间（毫秒）
  enabled?: boolean
} = {}) => {
  const {
    timeout = 30 * 60 * 1000, // 30分钟
    warningTime = 5 * 60 * 1000, // 5分钟
    enabled = true,
  } = options

  const { logout, isAuthenticated } = useAuthStore()
  const { openModal, closeModal } = useUIStore()

  useEffect(() => {
    if (!enabled || !isAuthenticated) return

    let timeoutId: NodeJS.Timeout
    let warningId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      clearTimeout(warningId)

      // 设置警告定时器
      warningId = setTimeout(() => {
        openModal('logout-warning')
      }, timeout - warningTime)

      // 设置自动登出定时器
      timeoutId = setTimeout(() => {
        logout()
        toast.error('由于长时间无活动，您已被自动登出')
        closeModal('logout-warning')
      }, timeout)
    }

    // 监听用户活动
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    const handleActivity = () => {
      resetTimer()
      closeModal('logout-warning')
    }

    // 添加事件监听器
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // 初始化定时器
    resetTimer()

    return () => {
      // 清理
      clearTimeout(timeoutId)
      clearTimeout(warningId)
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [enabled, isAuthenticated, timeout, warningTime, logout, openModal, closeModal])
}

// 密码强度检查hook
export const usePasswordStrength = (password: string) => {
  const getStrength = (pwd: string): {
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong'
    feedback: string[]
  } => {
    if (!pwd) {
      return { score: 0, level: 'weak', feedback: ['请输入密码'] }
    }

    let score = 0
    const feedback: string[] = []

    // 长度检查
    if (pwd.length >= 8) {
      score += 1
    } else {
      feedback.push('密码长度至少8位')
    }

    // 包含小写字母
    if (/[a-z]/.test(pwd)) {
      score += 1
    } else {
      feedback.push('包含小写字母')
    }

    // 包含大写字母
    if (/[A-Z]/.test(pwd)) {
      score += 1
    } else {
      feedback.push('包含大写字母')
    }

    // 包含数字
    if (/\d/.test(pwd)) {
      score += 1
    } else {
      feedback.push('包含数字')
    }

    // 包含特殊字符
    if (/[^\w\s]/.test(pwd)) {
      score += 1
    } else {
      feedback.push('包含特殊字符')
    }

    // 长度奖励
    if (pwd.length >= 12) {
      score += 1
    }

    // 确定等级
    let level: 'weak' | 'fair' | 'good' | 'strong'
    if (score <= 2) {
      level = 'weak'
    } else if (score <= 3) {
      level = 'fair'
    } else if (score <= 4) {
      level = 'good'
    } else {
      level = 'strong'
    }

    return { score, level, feedback }
  }

  return getStrength(password)
}