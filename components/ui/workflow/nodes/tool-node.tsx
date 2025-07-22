"use client"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Wrench, Settings, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface ToolNodeData {
  label: string
  toolId?: string
  tools?: any[]
  configuration?: {
    timeout?: number
    retries?: number
    parameters?: Record<string, any>
  }
  status?: "active" | "inactive" | "error"
  onToolSelect?: (toolId: string, nodeId: string) => void
  onConfigChange?: (nodeId: string, config: any) => void
}

export const ToolNode = memo(({ id, data, selected }: NodeProps<ToolNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [config, setConfig] = useState(
    data.configuration || {
      timeout: 30000,
      retries: 3,
      parameters: {},
    },
  )

  const handleToolSelect = (toolId: string) => {
    if (data.onToolSelect) {
      data.onToolSelect(toolId, id)
    }
  }

  const handleConfigSave = () => {
    if (data.onConfigChange) {
      data.onConfigChange(id, config)
    }
    setIsConfigOpen(false)
  }

  const getStatusColor = () => {
    switch (data.status) {
      case "active":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getToolIcon = (type?: string) => {
    switch (type) {
      case "api":
        return "🌐"
      case "database":
        return "🗄️"
      case "file":
        return "📁"
      case "code":
        return "💻"
      default:
        return "🔧"
    }
  }

  return (
    <div
      className={`bg-white border-2 rounded-lg shadow-lg min-w-[200px] ${
        selected ? "border-orange-500" : "border-gray-300"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Wrench className="w-5 h-5 text-orange-600" />
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getStatusColor()}`} />
            </div>
            <span className="font-medium text-sm">{data.label}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Settings className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>工具配置</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeout">超时时间(ms)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={config.timeout}
                        onChange={(e) => setConfig({ ...config, timeout: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retries">重试次数</Label>
                      <Input
                        id="retries"
                        type="number"
                        value={config.retries}
                        onChange={(e) => setConfig({ ...config, retries: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parameters">参数配置</Label>
                    <Textarea
                      id="parameters"
                      value={JSON.stringify(config.parameters, null, 2)}
                      onChange={(e) => {
                        try {
                          const params = JSON.parse(e.target.value)
                          setConfig({ ...config, parameters: params })
                        } catch (error) {
                          // 忽略JSON解析错误
                        }
                      }}
                      rows={4}
                      placeholder='{"key": "value"}'
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleConfigSave}>保存</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" className="p-1">
              <Play className="w-3 h-3 text-green-500" />
            </Button>
          </div>
        </div>

        {data.tools && data.tools.length > 0 && (
          <div className="mb-3">
            <Select value={data.toolId} onValueChange={handleToolSelect}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="选择工具" />
              </SelectTrigger>
              <SelectContent>
                {data.tools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    <div className="flex items-center space-x-2">
                      <span>{getToolIcon(tool.type)}</span>
                      <span>{tool.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {data.toolId && (
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs">
              {data.tools?.find((t) => t.id === data.toolId)?.type || "Tool"}
            </Badge>
            {data.status && (
              <Badge
                variant={data.status === "active" ? "default" : data.status === "error" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {data.status === "active" ? "激活" : data.status === "error" ? "错误" : "未激活"}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
    </div>
  )
})

ToolNode.displayName = "ToolNode"
