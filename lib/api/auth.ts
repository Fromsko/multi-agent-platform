import { api } from "./base"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    role: string
    avatar?: string
  }
  token: string
  refreshToken: string
}

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterRequest) => api.post<AuthResponse>("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  refreshToken: (refreshToken: string) => api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) => api.post("/auth/reset-password", { token, password }),

  getCurrentUser: () => api.get("/auth/me"),
}
