"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Zap,
  Key,
  FileText,
  BarChart3,
  Shield,
  Bell,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: "仪表盘", href: "/dashboard", icon: Home },
  { name: "我的公司", href: "/dashboard/companies", icon: Building2 },
  { name: "Agent管理", href: "/dashboard/agents", icon: Bot },
  { name: "MCP工具", href: "/dashboard/tools", icon: Zap },
  { name: "API密钥", href: "/dashboard/api-keys", icon: Key },
  { name: "提示词优化", href: "/dashboard/prompts", icon: FileText },
  { name: "调用日志", href: "/dashboard/logs", icon: BarChart3 },
]

const adminItems = [
  { name: "用户管理", href: "/dashboard/admin/users", icon: Users },
  { name: "系统设置", href: "/dashboard/admin/settings", icon: Settings },
  { name: "权限管理", href: "/dashboard/admin/permissions", icon: Shield },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        initial={false}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgentCorp</span>
          </div>
          <button className="lg:hidden p-1 hover:bg-gray-100 rounded" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {user?.role === "admin" && (
            <div className="mt-8">
              <div className="px-6 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">管理员功能</h3>
              </div>
              <nav className="px-3 space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-lg">{user?.avatar || "👤"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/profile"
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <User className="w-4 h-4 mr-3" />
              个人信息
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              退出登录
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">{user?.avatar || "👤"}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role === "admin" ? "管理员" : "用户"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
