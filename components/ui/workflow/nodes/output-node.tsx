"use client"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { ArrowLeft, Settings, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface OutputNodeData {
  label: string
  format?: "text" | "json" | "html" | "file" | "image"
  configuration?: {
    filename?: string
    template?: string
    compression?: boolean
  }
  onConfigChange?: (nodeId: string, config: any) => void
}

export const OutputNode = memo(({ id, data, selected }: NodeProps<OutputNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [config, setConfig] = useState(
    data.configuration || {
      filename: "output",
      template: "",
      compression: false,
    },
  )

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }))
    if (data.onConfigChange) {
      data.onConfigChange(id, {
        ...config,
        [key]: value,
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>{data.label}</span>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => setIsConfigOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Open Settings</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Output Node Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                Filename
              </Label>
              <Input
                id="filename"
                value={config.filename}
                onChange={(e) => handleConfigChange("filename", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Template
              </Label>
              <Input
                id="template"
                value={config.template}
                onChange={(e) => handleConfigChange("template", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="compression" className="text-right">
                Compression
              </Label>
              <Select
                value={config.compression ? "enabled" : "disabled"}
                onValueChange={(value) => handleConfigChange("compression", value === "enabled")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Compression" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Handle type="target" position={Position.Left} />
      <Badge className="absolute top-2 right-2">{data.format || "text"}</Badge>
    </div>
  )
})
