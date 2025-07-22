"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { Bot, Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("请填写所有字段")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("密码不匹配")
      return
    }

    if (formData.password.length < 6) {
      toast.error("密码至少需要6个字符")
      return
    }

    if (!agreedToTerms) {
      toast.error("请同意服务条款")
      return
    }

    setIsLoading(true)
    const success = await register(formData.email, formData.password, formData.name)

    if (success) {
      router.push("/dashboard")
    }

    setIsLoading(false)
  }

  const passwordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/\d/)) strength++
    if (password.match(/[^a-zA-Z\d]/)) strength++
    return strength
  }

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-blue-500"
      case 4:
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "弱"
      case 2:
        return "中等"
      case 3:
        return "强"
      case 4:
        return "很强"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Image */}
      <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-green-600 via-teal-700 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">开启AI创业之旅</h3>
              <p className="text-xl text-green-100 max-w-md">加入数千家企业，用AI Agent重新定义工作方式</p>
            </div>

            {/* Features List */}
            <div className="space-y-4 text-left max-w-sm">
              {["无限创建AI员工", "多种业务场景模板", "实时协作监控", "企业级安全保障"].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-800" />
                  </div>
                  <span className="text-green-100">{feature}</span>
                </motion.div>
              ))}
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

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          className="max-w-md w-full space-y-8"
          initial={{ opacity: 0, x: 20 }}
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
              <h1 className="text-3xl font-bold text-secondary-900">AgentCorp</h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">创建您的账户</h2>
              <p className="text-secondary-600">开始构建您的AI驱动公司</p>
            </motion.div>
          </div>

          {/* Register Form */}
          <motion.form
            className="space-y-6"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                姓名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="输入您的姓名"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="输入您的邮箱"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="创建密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength(formData.password))}`}
                        style={{ width: `${(passwordStrength(formData.password) / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-secondary-600">
                      {getStrengthText(passwordStrength(formData.password))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                确认密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="再次输入密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-xs">密码匹配</span>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">密码不匹配</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-secondary-700">
                我同意
                <a href="/terms" className="text-primary-600 hover:text-primary-500 mx-1">
                  服务条款
                </a>
                和
                <a href="/privacy" className="text-primary-600 hover:text-primary-500 mx-1">
                  隐私政策
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <span>创建账户</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <span className="text-secondary-600">已有账户？</span>
              <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
                立即登录
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}
