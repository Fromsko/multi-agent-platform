"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useWebSocket } from "@/contexts/WebSocketContext"
import { motion } from "framer-motion"
import { Building2, Bot, Activity, TrendingUp, Plus, Play, Settings, RefreshCw } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import toast from "react-hot-toast"

interface DashboardStats {
  totalCompanies: number
  totalAgents: number
  activeProjects: number
  completedTasks: number
  todayTasks: number
  weeklyGrowth: {
    companies: number
    agents: number
    projects: number
    tasks: number
  }
}

interface PerformanceData {
  timestamp: string
  tasks: number
  efficiency: number
  responseTime: number
  errorRate: number
  activeAgents: number
}

interface Company {
  id: string
  name: string
  agents: number
  status: string
  progress: number
  currentProject: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { connected } = useWebSocket()
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [performance, setPerformance] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      // 并行获取所有数据
      const [statsRes, companiesRes, performanceRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/companies?limit=3"),
        fetch("/api/dashboard/performance"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanies(
          companiesData.data.map((company: any) => ({
            id: company.id,
            name: company.name,
            agents: company.agents?.length || 0,
            status: company.status,
            progress: Math.floor(Math.random() * 100),
            currentProject: company.description || "暂无项目",
          })),
        )
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json()
        setPerformance(performanceData.data)
      }
    } catch (error) {
      console.error("获取仪表盘数据失败:", error)
      toast.error("获取数据失败，请稍后重试")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // 设置定时刷新
    const interval = setInterval(fetchDashboardData, 30000) // 每30秒刷新一次
    return () => clearInterval(interval)
  }, [])

  const agentDistribution = [
    { name: "开发类", value: 6, color: "#3b82f6" },
    { name: "设计类", value: 3, color: "#10b981" },
    { name: "测试类", value: 2, color: "#f59e0b" },
    { name: "管理类", value: 4, color: "#ef4444" },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">欢迎回来，{user?.name}！</h1>
            <p className="text-gray-600 mt-2">管理您的AI公司，监控Agent协作进展</p>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
                animate={{ scale: connected ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <span className="text-sm font-medium">{connected ? "已连接" : "未连接"}</span>
            </div>

            <motion.button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={fetchDashboardData}
              disabled={refreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
            </motion.button>

            <motion.button
              className="btn-primary flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>创建公司</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            {
              title: "公司总数",
              value: stats.totalCompanies,
              icon: Building2,
              color: "text-blue-600",
              bgColor: "bg-blue-100",
              change: `+${stats.weeklyGrowth.companies}`,
            },
            {
              title: "Agent总数",
              value: stats.totalAgents,
              icon: Bot,
              color: "text-green-600",
              bgColor: "bg-green-100",
              change: `+${stats.weeklyGrowth.agents}`,
            },
            {
              title: "活跃项目",
              value: stats.activeProjects,
              icon: Activity,
              color: "text-yellow-600",
              bgColor: "bg-yellow-100",
              change: `+${stats.weeklyGrowth.projects}`,
            },
            {
              title: "完成任务",
              value: stats.completedTasks,
              icon: TrendingUp,
              color: "text-purple-600",
              bgColor: "bg-purple-100",
              change: `+${stats.weeklyGrowth.tasks}`,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="card hover:shadow-lg transition-all duration-300 cursor-pointer"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <motion.p
                    className="text-3xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} 本周</p>
                </div>
                <motion.div
                  className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">性能趋势</h3>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="input-field w-auto"
              >
                <option value="24h">过去24小时</option>
                <option value="7d">过去7天</option>
                <option value="30d">过去30天</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
                    }
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleString("zh-CN")} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="tasks"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="完成任务数"
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="效率 (%)"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Agent Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Agent分布</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {agentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {agentDistribution.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Companies Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">我的公司</h3>
              <button className="btn-secondary text-sm">查看全部</button>
            </div>
            <div className="space-y-4">
              {companies.map((company, index) => (
                <motion.div
                  key={company.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{company.name}</h4>
                        <p className="text-sm text-gray-600">{company.agents} 个Agent</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {company.status === "active" ? "活跃" : "空闲"}
                      </span>
                      <motion.button
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">当前项目</span>
                      <span className="font-medium">{company.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-primary-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${company.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{company.currentProject}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">最近活动</h3>
              <button className="btn-secondary text-sm">查看全部</button>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  type: "task_completed",
                  message: "前端开发AI完成了登录页面组件开发",
                  companyName: "AI软件开发公司",
                  timestamp: new Date().toISOString(),
                },
                {
                  id: 2,
                  type: "agent_created",
                  message: "创建了新的数据分析AI",
                  companyName: "市场调研分析公司",
                  timestamp: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                  id: 3,
                  type: "project_started",
                  message: "启动了新的电商平台开发项目",
                  companyName: "AI软件开发公司",
                  timestamp: new Date(Date.now() - 7200000).toISOString(),
                },
              ].map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "task_completed"
                        ? "bg-green-100"
                        : activity.type === "agent_created"
                          ? "bg-blue-100"
                          : "bg-yellow-100"
                    }`}
                  >
                    {activity.type === "task_completed" && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {activity.type === "agent_created" && <Bot className="w-4 h-4 text-blue-600" />}
                    {activity.type === "project_started" && <Play className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.companyName}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
