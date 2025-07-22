"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Bot, ArrowLeft, Edit, Play, Trash2, Activity, MessageSquare, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// 模拟智能体详情数据
const agentDetails = {
  id: 1,
  name: "客服助手",
  description: "专业的客户服务智能体，能够处理各种客户咨询和问题解答",
  type: "对话型",
  status: "active",
  avatar: "🤖",
  createdAt: "2024-01-15",
  lastActivity: "2分钟前",

  // 配置信息
  config: {
    temperature: 0.7,
    maxTokens: 2048,
    memoryLength: 10,
    skills: ["自然语言处理", "外部工具调用", "记忆管理"],
    permissions: {
      isPublic: false,
      allowedUsers: ["admin@company.com", "support@company.com"],
      allowedAgents: ["数据分析师", "任务调度器"],
    },
  },

  // 统计数据
  stats: {
    totalInteractions: 1247,
    successRate: 98.5,
    avgResponseTime: 1.2,
    uptime: 99.8,
  },
}

// 模拟性能数据
const performanceData = [
  { time: "00:00", responseTime: 1.1, successRate: 98 },
  { time: "04:00", responseTime: 1.3, successRate: 97 },
  { time: "08:00", responseTime: 1.5, successRate: 99 },
  { time: "12:00", responseTime: 1.2, successRate: 98 },
  { time: "16:00", responseTime: 1.4, successRate: 96 },
  { time: "20:00", responseTime: 1.1, successRate: 99 },
]

// 模拟交互记录
const interactionHistory = [
  {
    id: 1,
    timestamp: "2024-01-20 14:30:25",
    type: "user_query",
    content: "用户询问退款政策",
    response: "根据我们的退款政策，您可以在购买后30天内申请退款...",
    duration: 1.2,
    success: true,
  },
  {
    id: 2,
    timestamp: "2024-01-20 14:28:15",
    type: "agent_collaboration",
    content: "与数据分析师协作查询用户订单信息",
    response: "已获取用户订单详情，订单状态为已发货",
    duration: 2.1,
    success: true,
  },
  {
    id: 3,
    timestamp: "2024-01-20 14:25:10",
    type: "user_query",
    content: "用户咨询产品功能",
    response: "该产品具有以下主要功能：1. 智能分析 2. 自动化处理...",
    duration: 0.9,
    success: true,
  },
]

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const [isEditing, setIsEditing] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "idle":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "活跃"
      case "running":
        return "运行中"
      case "idle":
        return "空闲"
      default:
        return "未知"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">智能体详情</h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/agents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{agentDetails.avatar}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{agentDetails.name}</h2>
                  <p className="text-gray-600 mt-1">{agentDetails.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge variant="outline">{agentDetails.type}</Badge>
                    <Badge className={getStatusColor(agentDetails.status)}>{getStatusText(agentDetails.status)}</Badge>
                    <span className="text-sm text-gray-500">创建于 {agentDetails.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  启动
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总交互次数</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentDetails.stats.totalInteractions}</div>
              <p className="text-xs text-muted-foreground">+12% 较上周</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentDetails.stats.successRate}%</div>
              <Progress value={agentDetails.stats.successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentDetails.stats.avgResponseTime}s</div>
              <p className="text-xs text-muted-foreground">-0.2s 较上周</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">运行时间</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentDetails.stats.uptime}%</div>
              <p className="text-xs text-muted-foreground">过去30天</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="performance">性能统计</TabsTrigger>
            <TabsTrigger value="interactions">交互记录</TabsTrigger>
            <TabsTrigger value="config">配置信息</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                  <CardDescription>智能体的最新交互和状态变化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interactionHistory.slice(0, 5).map((interaction) => (
                      <div key={interaction.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div
                          className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            interaction.success ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{interaction.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{interaction.timestamp}</p>
                          <p className="text-xs text-gray-600 mt-1">响应时间: {interaction.duration}s</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>技能模块</CardTitle>
                  <CardDescription>智能体当前启用的能力</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agentDetails.config.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{skill}</span>
                        <Badge variant="secondary">已启用</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>性能趋势</CardTitle>
                <CardDescription>响应时间和成功率变化趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="响应时间 (s)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="successRate"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="成功率 (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>交互历史</CardTitle>
                <CardDescription>详细的交互记录和响应内容</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interactionHistory.map((interaction) => (
                    <div key={interaction.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={interaction.type === "user_query" ? "default" : "secondary"}>
                            {interaction.type === "user_query" ? "用户查询" : "智能体协作"}
                          </Badge>
                          <span className="text-sm text-gray-500">{interaction.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{interaction.duration}s</span>
                          <div
                            className={`w-2 h-2 rounded-full ${interaction.success ? "bg-green-400" : "bg-red-400"}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">输入:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{interaction.content}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">响应:</p>
                          <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{interaction.response}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>运行参数</CardTitle>
                  <CardDescription>智能体的核心配置参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">温度值</span>
                    <span className="text-sm font-medium">{agentDetails.config.temperature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">最大 Tokens</span>
                    <span className="text-sm font-medium">{agentDetails.config.maxTokens}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">记忆长度</span>
                    <span className="text-sm font-medium">{agentDetails.config.memoryLength} 轮</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>权限设置</CardTitle>
                  <CardDescription>访问控制和权限配置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">公开访问</span>
                    <Badge variant={agentDetails.config.permissions.isPublic ? "default" : "secondary"}>
                      {agentDetails.config.permissions.isPublic ? "是" : "否"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">允许的用户</p>
                    <div className="space-y-1">
                      {agentDetails.config.permissions.allowedUsers.map((user, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-2">
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">允许的智能体</p>
                    <div className="space-y-1">
                      {agentDetails.config.permissions.allowedAgents.map((agent, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-2">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
