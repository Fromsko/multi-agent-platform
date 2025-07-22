"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Plus, Search, MoreHorizontal, Edit, Trash2, Play, Pause } from "lucide-react"
import { mockDataStore, type Agent } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null)
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    type: "对话型",
    model: "gpt-4",
    avatar: "🤖",
  })

  useEffect(() => {
    setAgents(mockDataStore.getAgents())
  }, [])

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter
    const matchesType = typeFilter === "all" || agent.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const handleSelectAll = () => {
    setSelectedAgents(selectedAgents.length === filteredAgents.length ? [] : filteredAgents.map((agent) => agent.id))
  }

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.description) {
      toast.error("请填写Agent名称和描述")
      return
    }

    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name,
      description: newAgent.description,
      type: newAgent.type,
      status: "idle",
      lastActivity: "刚刚",
      interactions: 0,
      successRate: 100,
      avatar: newAgent.avatar,
      companyId: "",
      skills: ["基础对话", "信息检索"],
      config: {
        temperature: 0.7,
        maxTokens: 2048,
        memoryLength: 10,
      },
      createdAt: new Date().toISOString(),
      model: newAgent.model,
    }

    // 添加到mock数据
    mockDataStore.getAgents().push(agent)
    setAgents([...mockDataStore.getAgents()])

    // 重置表单并关闭对话框
    setNewAgent({
      name: "",
      description: "",
      type: "对话型",
      model: "gpt-4",
      avatar: "🤖",
    })
    setIsCreateDialogOpen(false)

    toast.success("Agent创建成功")
  }

  const handleDeleteAgent = (agentId: string) => {
    setAgentToDelete(agentId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAgent = () => {
    if (!agentToDelete) return

    // 从mock数据中删除
    const agentList = mockDataStore.getAgents()
    const index = agentList.findIndex((a) => a.id === agentToDelete)
    if (index !== -1) {
      agentList.splice(index, 1)
      setAgents([...agentList])
      toast.success("Agent已删除")
    }

    setIsDeleteDialogOpen(false)
    setAgentToDelete(null)
  }

  const handleBatchDelete = () => {
    if (selectedAgents.length === 0) return

    // 从mock数据中批量删除
    const agentList = mockDataStore.getAgents()
    selectedAgents.forEach((agentId) => {
      const index = agentList.findIndex((a) => a.id === agentId)
      if (index !== -1) {
        agentList.splice(index, 1)
      }
    })

    setAgents([...agentList])
    setSelectedAgents([])
    toast.success(`已删除 ${selectedAgents.length} 个Agent`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "idle":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
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
      case "error":
        return "错误"
      default:
        return "未知"
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent管理</h1>
          <p className="mt-2 text-gray-600">管理和配置您的智能体</p>
        </div>
        <Button className="flex items-center space-x-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>创建Agent</span>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索Agent名称或描述..."
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
              <SelectItem value="error">错误</SelectItem>
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
      </motion.div>

      {/* Batch Actions */}
      {selectedAgents.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">已选择 {selectedAgents.length} 个Agent</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                批量启动
              </Button>
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                批量停止
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 bg-transparent"
                onClick={handleBatchDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Agents Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            className="card hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedAgents.includes(agent.id)}
                  onCheckedChange={() => handleSelectAgent(agent.id)}
                />
                <div className="text-2xl">{agent.avatar}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
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
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${agent.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Play className="h-4 w-4 mr-2" />
                    启动
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAgent(agent.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-gray-600 mb-4">{agent.description}</p>

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

              <div>
                <span className="text-sm text-gray-600 block mb-2">技能</span>
                <div className="flex flex-wrap gap-1">
                  {agent.skills.slice(0, 3).map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {agent.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
              >
                查看详情
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredAgents.length === 0 && (
        <motion.div
          className="card text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到Agent</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或创建新的Agent</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建Agent
          </Button>
        </motion.div>
      )}

      {/* Create Agent Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>创建新Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent名称</Label>
              <Input
                id="name"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="输入Agent名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={newAgent.description}
                onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                placeholder="描述Agent的功能和用途"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">类型</Label>
                <Select value={newAgent.type} onValueChange={(value) => setNewAgent({ ...newAgent, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="对话型">对话型</SelectItem>
                    <SelectItem value="分析型">分析型</SelectItem>
                    <SelectItem value="生成型">生成型</SelectItem>
                    <SelectItem value="协调型">协调型</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">模型</Label>
                <Select value={newAgent.model} onValueChange={(value) => setNewAgent({ ...newAgent, model: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>选择图标</Label>
              <div className="flex flex-wrap gap-2">
                {["🤖", "👨‍💼", "👩‍💻", "🧠", "⚡", "🔧", "📊", "🎯"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`w-10 h-10 text-xl border-2 rounded-lg hover:border-blue-500 ${
                      newAgent.avatar === emoji ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                    onClick={() => setNewAgent({ ...newAgent, avatar: emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateAgent}>创建Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>确定要删除此Agent吗？此操作无法撤销。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAgent}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
