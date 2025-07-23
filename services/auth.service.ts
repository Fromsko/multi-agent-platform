import { api, type ApiResponse } from './api/client'
import { API_ENDPOINTS } from './api/config'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from './types'

export class AuthService {
  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
  }

  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    })
  }

  /**
   * 用户登出
   */
  async logout(
    refreshToken: string,
    allDevices: boolean = false
  ): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.AUTH.LOGOUT, {
      refresh_token: refreshToken,
      all_devices: allDevices,
    })
  }

  /**
   * 忘记密码
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  }

  /**
   * 重置密码
   */
  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password,
    })
  }

  /**
   * 修改密码
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>(API_ENDPOINTS.AUTH.ME)
  }

  /**
   * 检查令牌是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser()
      return response.success
    } catch {
      return false
    }
  }

  /**
   * 获取存储的令牌
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  /**
   * 获取存储的刷新令牌
   */
  getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  /**
   * 存储令牌
   */
  storeTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('token', token)
    localStorage.setItem('refresh_token', refreshToken)
  }

  /**
   * 清除存储的令牌
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
  }

  /**
   * 存储用户信息
   */
  storeUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('user', JSON.stringify(user))
  }

  /**
   * 获取存储的用户信息
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  /**
   * 清除存储的用户信息
   */
  clearUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('user')
  }

  /**
   * 清除所有认证数据
   */
  clearAll(): void {
    this.clearTokens()
    this.clearUser()
  }

  /**
   * 检查用户是否已登录
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken()
    const user = this.getStoredUser()
    return !!(token && user)
  }

  /**
   * 自动刷新令牌
   */
  async autoRefreshToken(): Promise<boolean> {
    const refreshToken = this.getStoredRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await this.refreshToken(refreshToken)
      if (response.success && response.data) {
        this.storeTokens(response.data.token, response.data.refresh_token)
        this.storeUser(response.data.user)
        return true
      }
    } catch {
      this.clearAll()
    }
    return false
  }
}

// 创建单例实例
export const authService = new AuthService()