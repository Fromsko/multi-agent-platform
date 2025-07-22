import { api } from "./base"

export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
  device_info?: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  invite_code?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    username: string
    first_name: string
    last_name: string
    full_name?: string
    avatar?: string
    role: string
    status: string
    profile?: any
    preferences?: any
    email_verified?: boolean
    last_login_at?: string
    created_at: string
    updated_at: string
  }
  token: string
  refreshToken: string
  expires_in: number
}

export const authApi = {
  register: (data: RegisterRequest) => api.post<AuthResponse>("/api/v1/auth/register", data),

  login: (data: LoginRequest) => api.post<AuthResponse>("/api/v1/auth/login", data),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>("/api/v1/auth/refresh", { refresh_token: refreshToken }),

  logout: (refreshToken: string, all_devices: boolean) =>
    api.post("/api/v1/auth/logout", { refresh_token: refreshToken, all_devices }),

  forgotPassword: (email: string) => api.post("/api/v1/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) => api.post("/api/v1/auth/reset-password", { token, password }),

  changePassword: (current_password: string, new_password: string) =>
    api.post("/api/v1/auth/change-password", { current_password, new_password }),

  verifyEmail: (token: string) => api.post("/api/v1/auth/verify-email", { token }),

  getCurrentUser: () => api.get("/api/v1/auth/me"),
}
