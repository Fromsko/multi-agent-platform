"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Bot, Search, Plus, MoreHorizontal, Edit, Trash2, Play, Pause } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

const mockAgents = [
  {
    id: 1,
    name: "客服助手",
    description: "处理客户咨询和问题解答",
    type: "对话型",
    status: "active",
    lastActivity: "2分钟前",
    interactions: 156,
    successRate: 98.5,
    avatar: "🤖",
  },
  {
    id: 2,
    name: "数据分析师",
    description: "执行数据分析和报告生成",
    type: "分析型",
    status: "idle",
    lastActivity: "1小时前",
    interactions: 89,
    successRate: 96.2,
    avatar: "📊",
  },
  {
    id: 3,
    name: "文档助手",
    description: "文档处理和内容生成",
    type: "生成型",
    status: "active",
    lastActivity: "5分钟前",
    interactions: 234,
    successRate: 99.1,
    avatar: "📝",
  },
  {
    id: 4,
    name: "任务调度器",
    description: "协调和分配任务给其他智能体",
    type: "协调型",
    status: "running",
    lastActivity: "正在运行",
    interactions: 67,
    successRate: 94.8,
    avatar: "⚡",
  },
  {
    id: 5,
    name: "代码审查员",
    description: "代码质量检查和建议",
    type: "分析型",
    status: "idle",
    lastActivity: "3小时前",
    interactions: 45,
    successRate: 97.3,
    avatar: "💻",
  },
  {
    id: 6,
    name: "翻译助手",
    description: "多语言翻译和本地化",
    type: "生成型",
    status: "active",
    lastActivity: "1分钟前",
    interactions: 178,
    successRate: 98.9,
    avatar: "🌐",
  },
]

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedAgents, setSelectedAgents] = useState<number[]>([])

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter
    const matchesType = typeFilter === "all" || agent.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSelectAgent = (agentId: number) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const handleSelectAll = () => {
    setSelectedAgents(selectedAgents.length === filteredAgents.length ? [] : filteredAgents.map((agent) => agent.id))
  }

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
              <h1 className="text-2xl font-bold text-gray-900">多智能体管理平台</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              仪表盘
            </Link>
            <Link href="/agents" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              智能体管理
            </Link>
            <Link
              href="/scenarios"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              交互场景
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">智能体管理</h2>
            <p className="mt-2 text-gray-600">管理和配置您的智能体</p>
          </div>
          <Button asChild>
            <Link href="/agents/create">
              <Plus className="h-4 w-4 mr-2" />
              创建智能体
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索智能体名称或描述..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="running">运行中</SelectItem>
                  <SelectItem value="idle">空闲</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="对话型">对话型</SelectItem>
                  <SelectItem value="分析型">分析型</SelectItem>
                  <SelectItem value="生成型">生成型</SelectItem>
                  <SelectItem value="协调型">协调型</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Batch Actions */}
        {selectedAgents.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">已选择 {selectedAgents.length} 个智能体</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    批量启动
                  </Button>
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    批量停止
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    批量删除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={() => handleSelectAgent(agent.id)}
                    />
                    <div className="text-2xl">{agent.avatar}</div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {agent.type}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/agents/${agent.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="h-4 w-4 mr-2" />
                        启动
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{agent.description}</CardDescription>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">状态</span>
                    <Badge className={getStatusColor(agent.status)}>{getStatusText(agent.status)}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">最近活动</span>
                    <span className="text-sm font-medium">{agent.lastActivity}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">交互次数</span>
                    <span className="text-sm font-medium">{agent.interactions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">成功率</span>
                    <span className="text-sm font-medium">{agent.successRate}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <Link href={`/agents/${agent.id}`}>查看详情</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到智能体</h3>
              <p className="text-gray-600 mb-4">尝试调整搜索条件或创建新的智能体</p>
              <Button asChild>
                <Link href="/agents/create">
                  <Plus className="h-4 w-4 mr-2" />
                  创建智能体
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
