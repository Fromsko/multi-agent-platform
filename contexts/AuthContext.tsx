"use client"

import { authApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"

interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  avatar?: string
  createdAt: string
  profile?: {
    phone?: string
    company?: string
    position?: string
    bio?: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 检查本地存储的用户信息
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      const response = await authApi.login({ email, password })

      if (response.success && response.data) {
        const userData = response.data.user
        const user: User = {
          id: userData.id,
          email: userData.email,
          name:
            userData.full_name ||
            userData.username ||
            `${userData.first_name} ${userData.last_name}`,
          role: userData.role as "user" | "admin",
          avatar: userData.avatar,
          createdAt: userData.created_at,
          profile: {
            phone: userData.profile?.phone,
            company: userData.profile?.company,
            position: userData.profile?.position,
            bio: userData.profile?.bio,
          },
        }

        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))

        // Token已在登录页面保存，这里不需要重复保存
        toast.success("登录成功！")
        return true
      } else {
        toast.error(response.error?.message || "登录失败")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("网络错误，请稍后重试")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      setLoading(true)

      const response = await authApi.register({
        email,
        password,
        username: name,
        first_name: name,
        last_name: name,
      })

      if (response.success && response.data) {
        const userData = response.data.user
        const user: User = {
          id: userData.id,
          email: userData.email,
          name:
            userData.full_name ||
            userData.username ||
            `${userData.first_name} ${userData.last_name}`,
          role: userData.role as "user" | "admin",
          avatar: userData.avatar,
          createdAt: userData.created_at,
          profile: {
            phone: userData.profile?.phone,
            company: userData.profile?.company,
            position: userData.profile?.position,
            bio: userData.profile?.bio,
          },
        }

        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))

        // 保存token
        if (response.data.token) {
          localStorage.setItem("token", response.data.token)
        }
        if (response.data.refresh_token) {
          localStorage.setItem("refreshToken", response.data.refresh_token)
        }

        toast.success("注册成功！")
        return true
      } else {
        toast.error(response.error?.message || "注册失败")
        return false
      }
    } catch (error) {
      console.error("Register error:", error)
      toast.error("网络错误，请稍后重试")
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false

      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      toast.success("个人信息更新成功！")
      return true
    } catch (error) {
      toast.error("更新失败，请重试")
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("rememberMe")
    toast.success("已退出登录")
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateProfile, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
