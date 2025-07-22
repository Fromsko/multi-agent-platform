"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wrench, Plus, Search, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react"
import { mockDataStore, type Tool } from "@/lib/mock-data"
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

export default function ToolsPage() {
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toolToDelete, setToolToDelete] = useState<string | null>(null)
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    type: "api",
    provider: "openai",
    apiEndpoint: "",
    apiKey: "",
    status: "active",
  })

  useEffect(() => {
    setTools(mockDataStore.getTools())
  }, [])

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || tool.status === statusFilter
    const matchesType = typeFilter === "all" || tool.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSelectTool = (toolId: string) => {
    setSelectedTools((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
  }

  const handleSelectAll = () => {
    setSelectedTools(selectedTools.length === filteredTools.length ? [] : filteredTools.map((tool) => tool.id))
  }

  const handleCreateTool = () => {
    if (!newTool.name || !newTool.description) {
      toast.error("请填写工具名称和描述")
      return
    }

    const tool: Tool = {
      id: `tool-${Date.now()}`,
      name: newTool.name,
      description: newTool.description,
      type: newTool.type,
      status: newTool.status as "active" | "inactive" | "maintenance",
      provider: newTool.provider,
      config: {
        apiEndpoint: newTool.apiEndpoint,
        apiKey: newTool.apiKey,
      },
      usage: {
        calls: 0,
        errors: 0,
        avgResponseTime: 0,
      },
      createdAt: new Date().toISOString(),
    }

    // 添加到mock数据
    mockDataStore.getTools().push(tool)
    setTools([...mockDataStore.getTools()])

    // 重置表单并关闭对话框
    setNewTool({
      name: "",
      description: "",
      type: "api",
      provider: "openai",
      apiEndpoint: "",
      apiKey: "",
      status: "active",
    })
    setIsCreateDialogOpen(false)

    toast.success("工具创建成功")
  }

  const handleDeleteTool = (toolId: string) => {
    setToolToDelete(toolId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTool = () => {
    if (!toolToDelete) return

    // 从mock数据中删除
    const toolList = mockDataStore.getTools()
    const index = toolList.findIndex((t) => t.id === toolToDelete)
    if (index !== -1) {
      toolList.splice(index, 1)
      setTools([...toolList])
      toast.success("工具已删除")
    }

    setIsDeleteDialogOpen(false)
    setToolToDelete(null)
  }

  const handleBatchDelete = () => {
    if (selectedTools.length === 0) return

    // 从mock数据中批量删除
    const toolList = mockDataStore.getTools()
    selectedTools.forEach((toolId) => {
      const index = toolList.findIndex((t) => t.id === toolId)
      if (index !== -1) {
        toolList.splice(index, 1)
      }
    })

    setTools([...toolList])
    setSelectedTools([])
    toast.success(`已删除 ${selectedTools.length} 个工具`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "活跃"
      case "inactive":
        return "未激活"
      case "maintenance":
        return "维护中"
      default:
        return "未知"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "api":
        return "API"
      case "database":
        return "数据库"
      case "file":
        return "文件处理"
      case "search":
        return "搜索引擎"
      case "analytics":
        return "数据分析"
      default:
        return type
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
          <h1 className="text-3xl font-bold text-gray-900">MCP工具管理</h1>
          <p className="mt-2 text-gray-600">管理和配置您的工具</p>
        </div>
        <Button className="flex items-center space-x-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>添加工具</span>
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
                placeholder="搜索工具名称或描述..."
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
              <SelectItem value="inactive">未激活</SelectItem>
              <SelectItem value="maintenance">维护中</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="类型筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有类型</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="database">数据库</SelectItem>
              <SelectItem value="file">文件处理</SelectItem>
              <SelectItem value="search">搜索引擎</SelectItem>
              <SelectItem value="analytics">数据分析</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Batch Actions */}
      {selectedTools.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">已选择 {selectedTools.length} 个工具</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                批量导出
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

      {/* Tools Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            className="card hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Checkbox checked={selectedTools.includes(tool.id)} onCheckedChange={() => handleSelectTool(tool.id)} />
                <div className="bg-orange-100 text-orange-800 p-2 rounded-lg">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {getTypeText(tool.type)}
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
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/tools/${tool.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTool(tool.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-gray-600 mb-4">{tool.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">状态</span>
                <Badge className={getStatusColor(tool.status)}>{getStatusText(tool.status)}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">提供商</span>
                <span className="text-sm font-medium">{tool.provider}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">调用次数</span>
                <span className="text-sm font-medium">{tool.usage.calls}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均响应时间</span>
                <span className="text-sm font-medium">{tool.usage.avgResponseTime}ms</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => router.push(`/dashboard/tools/${tool.id}`)}
              >
                查看详情
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredTools.length === 0 && (
        <motion.div
          className="card text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到工具</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或添加新的工具</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加工具
          </Button>
        </motion.div>
      )}

      {/* Create Tool Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加新工具</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">工具名称</Label>
              <Input
                id="name"
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                placeholder="输入工具名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                placeholder="描述工具的功能和用途"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">类型</Label>
                <Select value={newTool.type} onValueChange={(value) => setNewTool({ ...newTool, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="database">数据库</SelectItem>
                    <SelectItem value="file">文件处理</SelectItem>
                    <SelectItem value="search">搜索引擎</SelectItem>
                    <SelectItem value="analytics">数据分析</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">提供商</Label>
                <Select value={newTool.provider} onValueChange={(value) => setNewTool({ ...newTool, provider: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择提供商" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="azure">Azure</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API端点</Label>
              <Input
                id="apiEndpoint"
                value={newTool.apiEndpoint}
                onChange={(e) => setNewTool({ ...newTool, apiEndpoint: e.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API密钥</Label>
              <Input
                id="apiKey"
                type="password"
                value={newTool.apiKey}
                onChange={(e) => setNewTool({ ...newTool, apiKey: e.target.value })}
                placeholder="输入API密钥"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select value={newTool.status} onValueChange={(value) => setNewTool({ ...newTool, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                  <SelectItem value="maintenance">维护中</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTool}>添加工具</Button>
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
            <p>确定要删除此工具吗？此操作无法撤销。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTool}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
