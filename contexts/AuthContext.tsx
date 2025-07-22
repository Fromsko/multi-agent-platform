"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

      // 检查默认管理员账户
      const defaultAdminEmail = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || "admin@gmail.com"
      const defaultAdminPassword = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD || "admin"

      if (email === defaultAdminEmail && password === defaultAdminPassword) {
        const adminUser: User = {
          id: "admin",
          email: defaultAdminEmail,
          name: "系统管理员",
          role: "admin",
          avatar: "👨‍💼",
          createdAt: new Date().toISOString(),
          profile: {
            company: "AgentCorp",
            position: "系统管理员",
            bio: "负责平台的整体管理和维护",
          },
        }
        setUser(adminUser)
        localStorage.setItem("user", JSON.stringify(adminUser))
        toast.success("管理员登录成功！")
        return true
      }

      // 模拟其他用户登录
      if (email === "user@example.com" && password === "user123") {
        const normalUser: User = {
          id: "2",
          email: "user@example.com",
          name: "普通用户",
          role: "user",
          avatar: "👤",
          createdAt: new Date().toISOString(),
          profile: {
            company: "示例公司",
            position: "产品经理",
          },
        }
        setUser(normalUser)
        localStorage.setItem("user", JSON.stringify(normalUser))
        toast.success("登录成功！")
        return true
      }

      toast.error("邮箱或密码错误")
      return false
    } catch (error) {
      toast.error("登录失败，请重试")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true)

      // 模拟注册逻辑
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: "user",
        avatar: "👤",
        createdAt: new Date().toISOString(),
        profile: {},
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      toast.success("注册成功！")
      return true
    } catch (error) {
      toast.error("注册失败，请重试")
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
    toast.success("已退出登录")
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
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
