"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Wrench,
  Play,
  Pause,
  Edit,
  Trash2,
  Code,
  CheckCircle,
  XCircle,
  FileText,
  Database,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { mockDataStore } from "@/lib/mock-data"
import { toast } from "react-hot-toast"
import { SplitLayout } from "@/components/common/SplitLayout"

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tool, setTool] = useState<any>(null)
  const [isActive, setIsActive] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [usage, setUsage] = useState({
    totalCalls: 0,
    successRate: 0,
    averageResponseTime: 0,
    errorCount: 0,
  })
  const [testResult, setTestResult] = useState("")

  useEffect(() => {
    const tools = mockDataStore.getTools()
    const foundTool = tools.find((t) => t.id === params.id)
    if (foundTool) {
      setTool(foundTool)
      setIsActive(foundTool.status === "active")

      // 模拟使用数据
      setUsage({
        totalCalls: Math.floor(Math.random() * 1000) + 100,
        successRate: Math.floor(Math.random() * 20) + 80,
        averageResponseTime: Math.floor(Math.random() * 200) + 50,
        errorCount: Math.floor(Math.random() * 10),
      })
    }
  }, [params.id])

  const handleActivate = () => {
    setIsActive(true)
    if (tool) {
      const updatedTool = { ...tool, status: "active" }
      setTool(updatedTool)
    }
    toast.success("工具已激活")
  }

  const handleDeactivate = () => {
    setIsActive(false)
    if (tool) {
      const updatedTool = { ...tool, status: "inactive" }
      setTool(updatedTool)
    }
    toast.success("工具已停用")
  }

  const handleEdit = () => {
    router.push(`/dashboard/tools/${tool.id}/edit`)
  }

  const handleDelete = () => {
    if (confirm("确定要删除这个工具吗？")) {
      toast.success("工具已删除")
      router.push("/dashboard/tools")
    }
  }

  const handleTest = () => {
    toast.success("开始测试工具...")

    // 模拟测试结果
    setTimeout(() => {
      const testOutput = `测试工具: ${tool.name}
时间: ${new Date().toLocaleString()}
状态: 成功
响应时间: ${Math.floor(Math.random() * 200) + 50}ms
结果: 工具运行正常，所有功能测试通过`

      setTestResult(testOutput)
      setActiveTab("test")
    }, 2000)
  }

  const getToolIcon = (type: string) => {
    switch (type) {
      case "api":
        return Globe
      case "database":
        return Database
      case "file":
        return FileText
      case "code":
        return Code
      default:
        return Wrench
    }
  }

  if (!tool) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const ToolIcon = getToolIcon(tool.type)

  const leftPanel = (
    <div className="h-full flex flex-col">
      {/* 工具信息头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/tools")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleTest}>
              <Play className="h-4 w-4 mr-2" />
              测试
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={isActive ? handleDeactivate : handleActivate}
              className={isActive ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  停用
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  激活
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <ToolIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{tool.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={tool.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {tool.status === "active" ? "已激活" : "未激活"}
              </Badge>
              <span className="text-sm text-gray-600">{tool.type}</span>
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
            <TabsTrigger value="config" className="flex-1">
              配置
            </TabsTrigger>
            <TabsTrigger value="test" className="flex-1">
              测试
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
                  <p className="text-gray-900">{tool.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">版本</label>
                  <p className="text-gray-900">{tool.version || "1.0.0"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">创建时间</label>
                  <p className="text-gray-900">{tool.createdAt || "2024-01-01"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">最后更新</label>
                  <p className="text-gray-900">{tool.updatedAt || "2024-01-15"}</p>
                </div>
              </CardContent>
            </Card>

            {/* 功能特性 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">功能特性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tool.features?.map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  )) || <span className="text-gray-500">暂无功能信息</span>}
                </div>
              </CardContent>
            </Card>

            {/* 使用统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">使用统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{usage.totalCalls}</div>
                    <div className="text-sm text-gray-600">总调用次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{usage.successRate}%</div>
                    <div className="text-sm text-gray-600">成功率</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>平均响应时间</span>
                    <span>{usage.averageResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>错误次数</span>
                    <span>{usage.errorCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API信息 */}
            {tool.type === "api" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">端点URL</label>
                    <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                      {tool.endpoint || "https://api.example.com/v1/tool"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">认证方式</label>
                    <p className="text-gray-900">{tool.authType || "API Key"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">请求方法</label>
                    <p className="text-gray-900">{tool.method || "POST"}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "config" && (
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">工具配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">配置参数</label>
                  <textarea
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md font-mono text-sm"
                    rows={8}
                    defaultValue={JSON.stringify(
                      tool.config || {
                        timeout: 30000,
                        retries: 3,
                        rateLimit: 100,
                      },
                      null,
                      2,
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">环境变量</label>
                  <textarea
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md font-mono text-sm"
                    rows={4}
                    defaultValue={`API_KEY=your_api_key_here
BASE_URL=https://api.example.com
TIMEOUT=30000`}
                  />
                </div>
                <Button className="w-full">保存配置</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "test" && (
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">工具测试</CardTitle>
                <CardDescription>测试工具的功能和性能</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">测试输入</label>
                  <textarea
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="输入测试数据..."
                    defaultValue='{"message": "Hello, world!"}'
                  />
                </div>
                <Button onClick={handleTest} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  运行测试
                </Button>
                {testResult && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">测试结果</label>
                    <pre className="w-full mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono whitespace-pre-wrap">
                      {testResult}
                    </pre>
                  </div>
                )}
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
              <div className={`w-3 h-3 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm">{isActive ? "已激活" : "未激活"}</span>
            </div>
          </CardContent>
        </Card>

        {/* 最近调用 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">最近调用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-sm">
                  <div className="font-medium">调用成功</div>
                  <div className="text-gray-500">1分钟前</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-sm">
                  <div className="font-medium">调用成功</div>
                  <div className="text-gray-500">3分钟前</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <XCircle className="h-4 w-4 text-red-500" />
                <div className="text-sm">
                  <div className="font-medium">调用失败</div>
                  <div className="text-gray-500">8分钟前</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 性能指标 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">性能指标</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>响应时间</span>
                <span>{usage.averageResponseTime}ms</span>
              </div>
              <Progress value={(200 - usage.averageResponseTime) / 2} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>成功率</span>
                <span>{usage.successRate}%</span>
              </div>
              <Progress value={usage.successRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>可用性</span>
                <span>99.9%</span>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 错误日志 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">错误日志</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs font-mono max-h-40 overflow-y-auto">
              <div className="text-gray-600">[{new Date().toLocaleTimeString()}] 工具初始化完成</div>
              <div className="text-gray-600">[{new Date().toLocaleTimeString()}] 连接检查通过</div>
              {usage.errorCount > 0 && (
                <div className="text-red-600">
                  [{new Date().toLocaleTimeString()}] 发现 {usage.errorCount} 个错误
                </div>
              )}
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
