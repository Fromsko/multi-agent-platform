"use client"

import { Label } from "@/components/ui/label"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/stores/useAppStore"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function LogsPage() {
  const { logs, loadLogs } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [filteredLogs, setFilteredLogs] = useState(logs)

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.type && log.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
          log.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((log) => log.type && log.type === typeFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, statusFilter, typeFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type?: string) => {
    if (!type) return "bg-gray-100 text-gray-800"
    
    switch (type.toLowerCase()) {
      case "chat":
        return "bg-blue-100 text-blue-800"
      case "completion":
        return "bg-purple-100 text-purple-800"
      case "embedding":
        return "bg-green-100 text-green-800"
      case "function_call":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  const exportLogs = () => {
    const csvContent = [
      [
        "时间",
        "智能体",
        "类型",
        "状态",
        "持续时间",
        "输入Token",
        "输出Token",
        "成本",
      ].join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.timestamp).toLocaleString(),
          log.agentName || "",
          log.type || "未知",
          log.status || "",
          formatDuration(log.duration || 0),
          log.tokens?.input || 0,
          log.tokens?.output || 0,
          formatCost(log.cost || 0),
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("日志已导出")
  }

  const refreshLogs = () => {
    loadLogs()
    toast.success("日志已刷新")
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
          <h1 className="text-3xl font-bold text-gray-900">调用日志</h1>
          <p className="mt-2 text-gray-600">查看和分析AI模型调用记录</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总调用次数</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.length > 0
                ? (
                    (logs.filter((l) => l.status === "success").length /
                      logs.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0
                ? formatDuration(
                    logs.reduce((sum, log) => sum + (log.duration || 0), 0) /
                      logs.length
                  )
                : "0ms"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总成本</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(logs.reduce((sum, log) => sum + (log.cost || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索智能体、类型或ID..."
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
            <SelectItem value="success">成功</SelectItem>
            <SelectItem value="error">错误</SelectItem>
            <SelectItem value="warning">警告</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="类型筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有类型</SelectItem>
            <SelectItem value="chat">对话</SelectItem>
            <SelectItem value="completion">补全</SelectItem>
            <SelectItem value="embedding">嵌入</SelectItem>
            <SelectItem value="function_call">函数调用</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>智能体</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>持续时间</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>成本</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-mono text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.agentName}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(log.type)}>
                        {log.type || "未知"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDuration(log.duration || 0)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>输入: {log.tokens?.input || 0}</div>
                        <div>输出: {log.tokens?.output || 0}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCost(log.cost || 0)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {filteredLogs.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无日志记录
          </h3>
          <p className="text-gray-600">
            当智能体开始工作时，调用日志将显示在这里
          </p>
        </motion.div>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>调用详情 - {selectedLog?.id}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="request">请求</TabsTrigger>
                <TabsTrigger value="response">响应</TabsTrigger>
                <TabsTrigger value="error">错误</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">智能体</Label>
                    <p className="text-sm text-gray-600">
                      {selectedLog.agentName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">类型</Label>
                    <Badge className={getTypeColor(selectedLog.type)}>
                    {selectedLog.type || "未知"}
                  </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">状态</Label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedLog.status)}
                      <Badge className={getStatusColor(selectedLog.status)}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">持续时间</Label>
                    <p className="text-sm text-gray-600">
                      {formatDuration(selectedLog.duration || 0)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">输入Token</Label>
                    <p className="text-sm text-gray-600">
                      {selectedLog.tokens?.input || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">输出Token</Label>
                    <p className="text-sm text-gray-600">
                      {selectedLog.tokens?.output || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">成本</Label>
                    <p className="text-sm text-gray-600">
                      {formatCost(selectedLog.cost || 0)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">时间</Label>
                    <p className="text-sm text-gray-600">
                      {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : "未知"}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="request">
                <div>
                  <Label className="text-sm font-medium">请求数据</Label>
                  <pre className="mt-2 p-4 bg-gray-50 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(selectedLog.request, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="response">
                <div>
                  <Label className="text-sm font-medium">响应数据</Label>
                  <pre className="mt-2 p-4 bg-gray-50 rounded text-sm overflow-auto max-h-96">
                    {selectedLog.response
                      ? JSON.stringify(selectedLog.response, null, 2)
                      : "无响应数据"}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="error">
                <div>
                  <Label className="text-sm font-medium">错误信息</Label>
                  {selectedLog.error ? (
                    <div className="mt-2 p-4 bg-red-50 rounded">
                      <div className="text-sm font-medium text-red-800">
                        错误代码: {selectedLog.error.code}
                      </div>
                      <div className="text-sm text-red-600 mt-1">
                        {selectedLog.error.message}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">无错误信息</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
