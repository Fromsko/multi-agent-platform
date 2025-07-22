"use client"

import { ChatInterface, type Message } from "@/components/common/ChatInterface"
import { CodeEditor } from "@/components/common/CodeEditor"
import { SplitLayout } from "@/components/common/SplitLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowEditor } from "@/components/ui/workflow/workflow-editor"
import { mockDataStore, type Company } from "@/lib/mock-data"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowLeft,
  Code,
  Download,
  Pause,
  Play,
  Settings,
  Share,
  Users,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import type { Edge, Node } from "reactflow"

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<"output" | "progress">("output")
  const [generatedCode, setGeneratedCode] = useState("")
  const [workflowTab, setWorkflowTab] = useState("workflow")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    const companies = mockDataStore.getCompanies()
    const foundCompany = companies.find((c) => c.id === params.id)
    if (foundCompany) {
      setCompany(foundCompany)
      setIsRunning(foundCompany.status === "active")

      // 初始化聊天消息
      setMessages([
        {
          id: "welcome",
          type: "system",
          content: `欢迎来到 ${foundCompany.name}！公司已准备就绪，包含 ${foundCompany.agents} 个Agent。`,
          timestamp: new Date(),
        },
      ])

      // 初始化工作流
      if ("workflow" in foundCompany && foundCompany.workflow) {
        setNodes((foundCompany.workflow as any)?.nodes || [])
        setEdges((foundCompany.workflow as any)?.edges || [])
      } else {
        // 创建默认工作流
        const defaultNodes: Node[] = [
          {
            id: "input_1",
            type: "input",
            position: { x: 100, y: 100 },
            data: { label: "用户输入", format: "text" },
          },
          {
            id: "agent_1",
            type: "agent",
            position: { x: 300, y: 100 },
            data: {
              label: "主智能体",
              agents: mockDataStore.getAgents(),
              onAgentSelect: () => {},
            },
          },
          {
            id: "output_1",
            type: "output",
            position: { x: 500, y: 100 },
            data: { label: "输出", format: "text/html" },
          },
        ]

        const defaultEdges: Edge[] = [
          {
            id: "edge_input_agent",
            source: "input_1",
            target: "agent_1",
            animated: true,
          },
          {
            id: "edge_agent_output",
            source: "agent_1",
            target: "output_1",
            animated: true,
          },
        ]

        setNodes(defaultNodes)
        setEdges(defaultEdges)
      }
    }
  }, [params.id])

  const handleStart = () => {
    setIsRunning(true)
    if (company) {
      const updatedCompany = { ...company, status: "active" as const }
      setCompany(updatedCompany)

      // 更新mock数据
      const companies = mockDataStore.getCompanies()
      const index = companies.findIndex((c) => c.id === company.id)
      if (index !== -1) {
        companies[index] = updatedCompany
      }
    }

    toast.success("公司已启动")

    // 模拟Agent开始工作
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          type: "assistant",
          content: "所有Agent已启动，开始执行任务...",
          timestamp: new Date(),
        },
      ])
    }, 1000)
  }

  const handleStop = () => {
    setIsRunning(false)
    if (company) {
      const updatedCompany = { ...company, status: "idle" as const }
      setCompany(updatedCompany)
    }
    toast.success("公司已暂停")
  }

  const handleSendMessage = (content: string, attachments?: File[]) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        type: "assistant",
        content: `收到指令："${content}"。正在分配给相关Agent处理...`,
        timestamp: new Date(),
        metadata: {
          model: "GPT-4",
          tokens: 150,
        },
      }
      setMessages((prev) => [...prev, aiMessage])

      // 模拟生成代码
      if (
        content.toLowerCase().includes("代码") ||
        content.toLowerCase().includes("html")
      ) {
        setTimeout(() => {
          const sampleCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成页面</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">欢迎使用AI助手</h1>
        <p class="text-gray-600 mb-6">这是根据您的需求生成的页面。</p>
        <button class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
            开始使用
        </button>
    </div>
</body>
</html>`
          setGeneratedCode(sampleCode)
          setActiveTab("output")
        }, 2000)
      }
    }, 1000)
  }

  const handleExportCode = () => {
    if (!generatedCode) {
      toast.error("没有可导出的代码")
      return
    }

    const blob = new Blob([generatedCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${company?.name || "output"}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("代码已导出")
  }

  const handleDeploy = () => {
    toast.success("正在部署到Vercel...")
    // 这里可以集成实际的部署逻辑
  }

  const handleSaveWorkflow = (nodes: Node[], edges: Edge[]) => {
    setNodes(nodes)
    setEdges(edges)

    if (company) {
      const updatedCompany = {
        ...company,
        workflow: { nodes, edges },
      }
      setCompany(updatedCompany)

      // 更新mock数据
      const companies = mockDataStore.getCompanies()
      const index = companies.findIndex((c) => c.id === company.id)
      if (index !== -1) {
        companies[index] = updatedCompany
      }
    }

    toast.success("工作流已保存")
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const leftPanel = (
    <div className="h-full flex flex-col">
      {/* 公司信息头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/companies")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/companies/${company.id}/settings`)
              }
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={isRunning ? handleStop : handleStart}
              className={isRunning ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  暂停
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
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {company.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                className={
                  company.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {company.status === "active" ? "运行中" : "已暂停"}
              </Badge>
              <span className="text-sm text-gray-600">
                {company.agents} 个Agent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="border-b border-gray-200">
        <Tabs value={workflowTab} onValueChange={setWorkflowTab}>
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1">
              对话
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex-1">
              工作流
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {workflowTab === "chat" ? (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={false}
            placeholder="输入指令给AI公司..."
            showAttachments={true}
          />
        ) : (
          <div className="h-full">
            <WorkflowEditor
              initialNodes={nodes}
              initialEdges={edges}
              onSave={handleSaveWorkflow}
              onRun={handleStart}
              readOnly={false}
            />
          </div>
        )}
      </div>
    </div>
  )

  const rightPanel = (
    <div className="h-full flex flex-col">
      {/* 右侧头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
          >
            <TabsList>
              <TabsTrigger value="output" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                产物
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                进度
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2">
            {generatedCode && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportCode}>
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeploy}>
                  <Share className="h-4 w-4 mr-2" />
                  部署
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 右侧内容 */}
      <div className="flex-1">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="output" className="h-full m-0">
            {generatedCode ? (
              <CodeEditor
                defaultValue={generatedCode}
                language="html"
                showPreview={true}
                readOnly={false}
                className="h-full"
                onChange={setGeneratedCode}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    等待生成内容
                  </h3>
                  <p className="text-gray-600">
                    向AI发送指令开始生成代码或内容
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="h-full m-0 p-4">
            <div className="space-y-6">
              {/* 实时统计 */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      完成任务
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {company.tasks.completed}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      进行中
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {company.tasks.inProgress}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 进度条 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    当前项目进度
                  </CardTitle>
                  <CardDescription>{company.currentProject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>完成度</span>
                      <span>{company.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-primary-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${company.progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent状态 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Agent状态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {company.agents && Array.isArray(company.agents) ? (
                      company.agents.map((agent, index) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isRunning ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {agent.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {agent.type}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {isRunning ? "运行中" : "空闲"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        暂无Agent信息
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 实时日志 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    实时日志
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <div className="text-xs text-gray-600 font-mono">
                      [{new Date().toLocaleTimeString()}] 系统初始化完成
                    </div>
                    <div className="text-xs text-gray-600 font-mono">
                      [{new Date().toLocaleTimeString()}] Agent连接状态检查
                    </div>
                    {isRunning && (
                      <div className="text-xs text-green-600 font-mono">
                        [{new Date().toLocaleTimeString()}] 所有Agent运行正常
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50">
      <SplitLayout
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        defaultSplit={50}
        minLeftWidth={30}
        minRightWidth={30}
      />
    </div>
  )
}
