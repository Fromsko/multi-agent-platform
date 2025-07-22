"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Plus, Play, Save, Settings, Trash2, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

// 模拟智能体数据
const availableAgents = [
  { id: 1, name: "客服助手", type: "对话型", color: "bg-blue-500" },
  { id: 2, name: "数据分析师", type: "分析型", color: "bg-green-500" },
  { id: 3, name: "文档助手", type: "生成型", color: "bg-purple-500" },
  { id: 4, name: "任务调度器", type: "协调型", color: "bg-orange-500" },
]

// 模拟场景数据
const mockScenarios = [
  {
    id: 1,
    name: "客户服务协作",
    description: "客服助手与数据分析师协作处理客户问题",
    agents: [1, 2],
    status: "active",
    lastRun: "2分钟前",
    executions: 156,
  },
  {
    id: 2,
    name: "内容生成流水线",
    description: "文档助手与任务调度器协作生成内容",
    agents: [3, 4],
    status: "idle",
    lastRun: "1小时前",
    executions: 89,
  },
  {
    id: 3,
    name: "数据处理工作流",
    description: "多智能体协作进行数据分析和报告生成",
    agents: [2, 3, 4],
    status: "running",
    lastRun: "正在运行",
    executions: 234,
  },
]

interface DroppedAgent {
  id: number
  name: string
  type: string
  color: string
  x: number
  y: number
}

interface Connection {
  from: number
  to: number
}

export default function ScenariosPage() {
  const [activeTab, setActiveTab] = useState<"list" | "editor">("list")
  const [droppedAgents, setDroppedAgents] = useState<DroppedAgent[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent, agent: (typeof availableAgents)[0]) => {
    e.dataTransfer.setData("application/json", JSON.stringify(agent))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const agentData = JSON.parse(e.dataTransfer.getData("application/json"))
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setDroppedAgents((prev) => [
        ...prev,
        {
          ...agentData,
          x,
          y,
        },
      ])
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAgentClick = (agentId: number) => {
    if (isConnecting && selectedAgent && selectedAgent !== agentId) {
      // 创建连接
      setConnections((prev) => [...prev, { from: selectedAgent, to: agentId }])
      setIsConnecting(false)
      setSelectedAgent(null)
    } else {
      setSelectedAgent(agentId)
    }
  }

  const startConnection = () => {
    if (selectedAgent) {
      setIsConnecting(true)
    }
  }

  const removeAgent = (agentId: number) => {
    setDroppedAgents((prev) => prev.filter((agent) => agent.id !== agentId))
    setConnections((prev) => prev.filter((conn) => conn.from !== agentId && conn.to !== agentId))
    if (selectedAgent === agentId) {
      setSelectedAgent(null)
    }
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
            <Link
              href="/agents"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              智能体管理
            </Link>
            <Link href="/scenarios" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              交互场景
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">交互场景设计</h2>
            <p className="mt-2 text-gray-600">设计和管理智能体协作场景</p>
          </div>
          <div className="flex space-x-3">
            <Button variant={activeTab === "list" ? "default" : "outline"} onClick={() => setActiveTab("list")}>
              场景列表
            </Button>
            <Button variant={activeTab === "editor" ? "default" : "outline"} onClick={() => setActiveTab("editor")}>
              场景编辑器
            </Button>
          </div>
        </div>

        {activeTab === "list" ? (
          /* Scenarios List */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockScenarios.map((scenario) => (
                <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{scenario.name}</CardTitle>
                        <CardDescription className="mt-2">{scenario.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(scenario.status)}>{getStatusText(scenario.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">参与智能体</p>
                        <div className="flex flex-wrap gap-2">
                          {scenario.agents.map((agentId) => {
                            const agent = availableAgents.find((a) => a.id === agentId)
                            return agent ? (
                              <Badge key={agentId} variant="outline" className="text-xs">
                                {agent.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">最近运行</span>
                        <span className="font-medium">{scenario.lastRun}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">执行次数</span>
                        <span className="font-medium">{scenario.executions}</span>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t">
                        <Button size="sm" className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          运行
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create New Scenario Card */}
              <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plus className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">创建新场景</h3>
                  <p className="text-gray-600 text-center mb-4">设计智能体协作流程</p>
                  <Button onClick={() => setActiveTab("editor")}>开始设计</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Scenario Editor */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Agent Library */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">智能体库</CardTitle>
                  <CardDescription>拖拽智能体到画布</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableAgents.map((agent) => (
                      <div
                        key={agent.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, agent)}
                        className="p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${agent.color}`} />
                          <div>
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Canvas Controls */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">画布控制</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={startConnection}
                    disabled={!selectedAgent}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    连接智能体
                  </Button>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    <Save className="h-4 w-4 mr-2" />
                    保存场景
                  </Button>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    <Play className="h-4 w-4 mr-2" />
                    运行测试
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="text-lg">场景画布</CardTitle>
                  <CardDescription>
                    {isConnecting ? "点击目标智能体创建连接" : "拖拽智能体到此处开始设计"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <div
                    ref={canvasRef}
                    className="relative w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {/* SVG for connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {connections.map((connection, index) => {
                        const fromAgent = droppedAgents.find((a) => a.id === connection.from)
                        const toAgent = droppedAgents.find((a) => a.id === connection.to)
                        if (!fromAgent || !toAgent) return null

                        return (
                          <line
                            key={index}
                            x1={fromAgent.x + 40}
                            y1={fromAgent.y + 40}
                            x2={toAgent.x + 40}
                            y2={toAgent.y + 40}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        )
                      })}
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                        </marker>
                      </defs>
                    </svg>

                    {/* Dropped agents */}
                    {droppedAgents.map((agent) => (
                      <div
                        key={`${agent.id}-${agent.x}-${agent.y}`}
                        className={`absolute w-20 h-20 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAgent === agent.id
                            ? "border-blue-500 shadow-lg scale-105"
                            : "border-gray-300 hover:border-gray-400"
                        } ${agent.color} text-white flex flex-col items-center justify-center text-xs font-medium`}
                        style={{ left: agent.x - 40, top: agent.y - 40 }}
                        onClick={() => handleAgentClick(agent.id)}
                      >
                        <Bot className="h-6 w-6 mb-1" />
                        <span className="text-center leading-tight">{agent.name}</span>
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeAgent(agent.id)
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {droppedAgents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">开始设计场景</p>
                          <p className="text-sm">从左侧拖拽智能体到此处</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">场景配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">场景名称</label>
                    <Input placeholder="输入场景名称" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">触发条件</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择触发方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">手动触发</SelectItem>
                        <SelectItem value="scheduled">定时触发</SelectItem>
                        <SelectItem value="event">事件触发</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">执行模式</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择执行模式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">串行执行</SelectItem>
                        <SelectItem value="parallel">并行执行</SelectItem>
                        <SelectItem value="conditional">条件执行</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAgent && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">选中智能体</h4>
                      <p className="text-sm text-blue-700">
                        {availableAgents.find((a) => a.id === selectedAgent)?.name}
                      </p>
                      <div className="mt-3 space-y-2">
                        <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={startConnection}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          创建连接
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => removeAgent(selectedAgent)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除智能体
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Real-time Execution Panel */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    实时执行
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-600 mb-2">执行状态</p>
                      <Badge variant="secondary">待机中</Badge>
                    </div>

                    <div className="text-sm">
                      <p className="text-gray-600 mb-2">活跃智能体</p>
                      <p className="font-medium">0 / {droppedAgents.length}</p>
                    </div>

                    <div className="text-sm">
                      <p className="text-gray-600 mb-2">执行日志</p>
                      <div className="h-32 bg-gray-50 rounded border p-2 text-xs overflow-y-auto">
                        <p className="text-gray-500">等待场景启动...</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
