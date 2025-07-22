"use client"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Bot, Settings, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface AgentNodeData {
  label: string
  agentId?: string
  agents?: any[]
  configuration?: {
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }
  status?: "idle" | "running" | "error"
  onAgentSelect?: (agentId: string, nodeId: string) => void
  onConfigChange?: (nodeId: string, config: any) => void
}

export const AgentNode = memo(({ id, data, selected }: NodeProps<AgentNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [config, setConfig] = useState(
    data.configuration || {
      systemPrompt: "你是一个有用的AI助手",
      temperature: 0.7,
      maxTokens: 2048,
    },
  )

  const handleAgentSelect = (agentId: string) => {
    if (data.onAgentSelect) {
      data.onAgentSelect(agentId, id)
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
      case "running":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div
      className={`bg-white border-2 rounded-lg shadow-lg min-w-[200px] ${
        selected ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="w-5 h-5 text-purple-600" />
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
                  <DialogTitle>Agent配置</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">系统提示词</Label>
                    <Textarea
                      id="systemPrompt"
                      value={config.systemPrompt}
                      onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">温度</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfig({ ...config, temperature: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">最大Token数</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        value={config.maxTokens}
                        onChange={(e) => setConfig({ ...config, maxTokens: Number.parseInt(e.target.value) })}
                      />
                    </div>
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
            {data.status === "running" ? (
              <Button variant="ghost" size="sm" className="p-1">
                <Pause className="w-3 h-3 text-red-500" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="p-1">
                <Play className="w-3 h-3 text-green-500" />
              </Button>
            )}
          </div>
        </div>

        {data.agents && data.agents.length > 0 && (
          <div className="mb-3">
            <Select value={data.agentId} onValueChange={handleAgentSelect}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="选择Agent" />
              </SelectTrigger>
              <SelectContent>
                {data.agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center space-x-2">
                      <span>{agent.avatar}</span>
                      <span>{agent.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {data.agentId && (
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs">
              {data.agents?.find((a) => a.id === data.agentId)?.type || "Agent"}
            </Badge>
            {data.status && (
              <Badge
                variant={data.status === "running" ? "default" : data.status === "error" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {data.status === "running" ? "运行中" : data.status === "error" ? "错误" : "空闲"}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  )
})

AgentNode.displayName = "AgentNode"
