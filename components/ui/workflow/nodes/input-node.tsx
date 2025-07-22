"use client"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { ArrowRight, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface InputNodeData {
  label: string
  format?: "text" | "json" | "file" | "image"
  configuration?: {
    placeholder?: string
    validation?: string
    required?: boolean
    maxLength?: number
  }
  onConfigChange?: (nodeId: string, config: any) => void
}

export const InputNode = memo(({ id, data, selected }: NodeProps<InputNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [config, setConfig] = useState(
    data.configuration || {
      placeholder: "请输入内容...",
      validation: "",
      required: true,
      maxLength: 1000,
    },
  )

  const handleConfigSave = () => {
    if (data.onConfigChange) {
      data.onConfigChange(id, config)
    }
    setIsConfigOpen(false)
  }

  const getFormatIcon = () => {
    switch (data.format) {
      case "json":
        return "📋"
      case "file":
        return "📁"
      case "image":
        return "🖼️"
      default:
        return "📝"
    }
  }

  const getFormatColor = () => {
    switch (data.format) {
      case "json":
        return "bg-blue-100 text-blue-800"
      case "file":
        return "bg-green-100 text-green-800"
      case "image":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      className={`bg-white border-2 rounded-lg shadow-lg min-w-[180px] ${
        selected ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-sm">{data.label}</span>
          </div>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <Settings className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>输入配置</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="format">输入格式</Label>
                  <Select
                    value={data.format || "text"}
                    onValueChange={(value) => {
                      // 这里应该更新节点数据
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文本</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="file">文件</SelectItem>
                      <SelectItem value="image">图片</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeholder">占位符</Label>
                  <Input
                    id="placeholder"
                    value={config.placeholder}
                    onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validation">验证规则</Label>
                  <Textarea
                    id="validation"
                    value={config.validation}
                    onChange={(e) => setConfig({ ...config, validation: e.target.value })}
                    placeholder="正则表达式或验证规则"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={config.required}
                      onChange={(e) => setConfig({ ...config, required: e.target.checked })}
                    />
                    <Label htmlFor="required">必填</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLength">最大长度</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={config.maxLength}
                      onChange={(e) => setConfig({ ...config, maxLength: Number.parseInt(e.target.value) })}
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
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getFormatIcon()}</span>
            <Badge className={getFormatColor()}>{data.format || "text"}</Badge>
          </div>

          {config.required && (
            <Badge variant="outline" className="text-xs">
              必填
            </Badge>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  )
})

InputNode.displayName = "InputNode"
