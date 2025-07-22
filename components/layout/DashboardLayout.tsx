"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  ChevronLeft,
  ChevronRight,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // 从localStorage恢复侧边栏状态
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // 保存侧边栏状态到localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  const isActive = (href: string) => pathname === href

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
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
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded"
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">AgentCorp</span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Bot className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center space-x-2">
            <button
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button className="lg:hidden p-1 hover:bg-gray-100 rounded" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-3 space-y-1">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`sidebar-item group relative ${isActive(item.href) ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {user?.role === "admin" && (
            <div className="mt-8">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    className="px-6 py-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">管理员功能</h3>
                  </motion.div>
                )}
              </AnimatePresence>

              <nav className="px-3 space-y-1">
                {adminItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (navigationItems.length + index) * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`sidebar-item group relative ${isActive(item.href) ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 truncate"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"} mb-3`}>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">{user?.avatar || "👤"}</span>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "px-3"} py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group relative`}
            title={sidebarCollapsed ? "退出登录" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  退出登录
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                退出登录
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="transition-all duration-300"
        animate={{ marginLeft: sidebarCollapsed ? 80 : 256 }}
        style={{ marginLeft: 0 }}
        className="lg:ml-64"
      >
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              <motion.button
                className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <motion.span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.button>

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
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  )
}
