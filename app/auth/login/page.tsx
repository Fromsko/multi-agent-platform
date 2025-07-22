"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { authApi } from "@/lib/api"
import { motion } from "framer-motion"
import { ArrowRight, Bot, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  // 快速填充演示账户
  const fillDemoAccount = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@example.com")
      setPassword("admin123")
    } else {
      setEmail("user@example.com")
      setPassword("user123")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("请填写所有字段")
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })

      if (response.success) {
        // 保存用户信息和token
        if (response.data?.token) {
          localStorage.setItem("token", response.data.token)
        }
        if (response.data?.refresh_token) {
          localStorage.setItem("refreshToken", response.data.refresh_token)
        }
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }

        toast.success("登录成功！")

        // 使用AuthContext的login方法
        await login(email, password)

        router.push("/dashboard")
      } else {
        toast.error(response.error?.message || "登录失败")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          className="max-w-md w-full space-y-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Title */}
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center space-x-3 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">AgentCorp</h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                欢迎回来
              </h2>
              <p className="text-gray-600">登录您的账户，继续管理您的AI公司</p>
            </motion.div>
          </div>

          {/* Demo Accounts */}
          <motion.div
            className="bg-primary-50 border border-primary-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-primary-800 mb-3">
              演示账户
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-primary-700">
                  <p>管理员: admin@example.com / admin123</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("admin")}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                >
                  使用
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-primary-700">
                  <p>用户: user@example.com / user123</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("user")}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                >
                  使用
                </button>
              </div>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form
            className="space-y-6"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary-500"
                  placeholder="输入您的邮箱"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary-500"
                  placeholder="输入您的密码"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  忘记密码？
                </a>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <div className="text-center">
              <span className="text-gray-600">还没有账户？</span>
              <Link
                href="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-500 ml-1 transition-colors"
              >
                立即注册
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="mb-8">
              <motion.div
                className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                <Bot className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-4">构建您的AI团队</h3>
              <p className="text-xl text-primary-100 max-w-md">
                让智能Agent协作完成复杂项目，体验未来工作方式
              </p>
            </div>

            {/* Floating Elements */}
            <div className="relative">
              <motion.div
                className="absolute -top-10 -left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute -bottom-10 -right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute top-5 right-5 w-12 h-12 bg-white bg-opacity-10 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.5,
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
