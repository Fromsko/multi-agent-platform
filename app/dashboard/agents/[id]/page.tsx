"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Bot, Play, Pause, Edit, Trash2, Activity, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { mockDataStore } from "@/lib/mock-data"
import { toast } from "react-hot-toast"
import { SplitLayout } from "@/components/common/SplitLayout"
import { ChatInterface, type Message } from "@/components/common/ChatInterface"

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [agent, setAgent] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [performance, setPerformance] = useState({
    tasksCompleted: 0,
    successRate: 0,
    averageResponseTime: 0,
    totalTokensUsed: 0,
  })

  useEffect(() => {
    const agents = mockDataStore.getAgents()
    const foundAgent = agents.find((a) => a.id === params.id)
    if (foundAgent) {
      setAgent(foundAgent)
      setIsRunning(foundAgent.status === "active")

      // 初始化聊天消息
      setMessages([
        {
          id: "welcome",
          type: "system",
          content: `欢迎使用 ${foundAgent.name}！Agent已准备就绪。`,
          timestamp: new Date(),
        },
      ])

      // 模拟性能数据
      setPerformance({
        tasksCompleted: Math.floor(Math.random() * 100) + 50,
        successRate: Math.floor(Math.random() * 20) + 80,
        averageResponseTime: Math.floor(Math.random() * 500) + 200,
        totalTokensUsed: Math.floor(Math.random() * 10000) + 5000,
      })
    }
  }, [params.id])

  const handleStart = () => {
    setIsRunning(true)
    if (agent) {
      const updatedAgent = { ...agent, status: "active" }
      setAgent(updatedAgent)
    }
    toast.success("Agent已启动")
  }

  const handleStop = () => {
    setIsRunning(false)
    if (agent) {
      const updatedAgent = { ...agent, status: "idle" }
      setAgent(updatedAgent)
    }
    toast.success("Agent已停止")
  }

  const handleEdit = () => {
    router.push(`/dashboard/agents/${agent.id}/edit`)
  }

  const handleDelete = () => {
    if (confirm("确定要删除这个Agent吗？")) {
      // 这里应该调用删除API
      toast.success("Agent已删除")
      router.push("/dashboard/agents")
    }
  }

  const handleSendMessage = (content: string, attachments?: File[]) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // 模拟Agent回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        type: "assistant",
        content: `收到指令："${content}"。正在处理...`,
        timestamp: new Date(),
        metadata: {
          model: agent?.model || "GPT-4",
          tokens: 150,
        },
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const leftPanel = (
    <div className="h-full flex flex-col">
      {/* Agent信息头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/agents")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={isRunning ? handleStop : handleStart}
              className={isRunning ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  停止
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  启动
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{agent.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                className={agent.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {agent.status === "active" ? "运行中" : "已停止"}
              </Badge>
              <span className="text-sm text-gray-600">{agent.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              概览
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">
              对话
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              设置
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "overview" && (
          <div className="p-6 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">描述</label>
                  <p className="text-gray-900">{agent.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">模型</label>
                  <p className="text-gray-900">{agent.model || "GPT-4"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">创建时间</label>
                  <p className="text-gray-900">{agent.createdAt || "2024-01-01"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">最后更新</label>
                  <p className="text-gray-900">{agent.updatedAt || "2024-01-15"}</p>
                </div>
              </CardContent>
            </Card>

            {/* 能力列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">能力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities?.map((capability: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {capability}
                    </Badge>
                  )) || <span className="text-gray-500">暂无能力信息</span>}
                </div>
              </CardContent>
            </Card>

            {/* 性能指标 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">性能指标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{performance.tasksCompleted}</div>
                    <div className="text-sm text-gray-600">完成任务</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{performance.successRate}%</div>
                    <div className="text-sm text-gray-600">成功率</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>平均响应时间</span>
                    <span>{performance.averageResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>总Token使用量</span>
                    <span>{performance.totalTokensUsed.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "chat" && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={false}
            placeholder={`与 ${agent.name} 对话...`}
            showAttachments={true}
          />
        )}

        {activeTab === "settings" && (
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agent配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">系统提示词</label>
                  <textarea
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md"
                    rows={4}
                    defaultValue={agent.systemPrompt || "你是一个有用的AI助手。"}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">温度设置</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue={agent.temperature || 0.7}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">最大Token数</label>
                  <input
                    type="number"
                    defaultValue={agent.maxTokens || 2048}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <Button className="w-full">保存设置</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )

  const rightPanel = (
    <div className="h-full flex flex-col">
      {/* 右侧头部 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">实时监控</h3>
      </div>

      {/* 监控内容 */}
      <div className="flex-1 p-4 space-y-6">
        {/* 状态指示器 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">运行状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRunning ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm">{isRunning ? "运行中" : "已停止"}</span>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-sm">
                  <div className="font-medium">任务完成</div>
                  <div className="text-gray-500">2分钟前</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-4 w-4 text-blue-500" />
                <div className="text-sm">
                  <div className="font-medium">开始处理新任务</div>
                  <div className="text-gray-500">5分钟前</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <div className="text-sm">
                  <div className="font-medium">警告：响应时间较长</div>
                  <div className="text-gray-500">10分钟前</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 资源使用情况 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">资源使用</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU使用率</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>内存使用率</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Token使用率</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 日志 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">实时日志</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs font-mono max-h-40 overflow-y-auto">
              <div className="text-gray-600">[{new Date().toLocaleTimeString()}] Agent初始化完成</div>
              <div className="text-gray-600">[{new Date().toLocaleTimeString()}] 连接到模型服务</div>
              {isRunning && <div className="text-green-600">[{new Date().toLocaleTimeString()}] Agent运行正常</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50">
      <SplitLayout
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        defaultSplit={70}
        minLeftWidth={50}
        minRightWidth={30}
      />
    </div>
  )
}
