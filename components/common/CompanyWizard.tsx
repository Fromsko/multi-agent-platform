"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Building2, Users, Wrench, Bot, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockDataStore } from "@/lib/mock-data"
import { WorkflowEditor } from "@/components/ui/workflow/workflow-editor"
import type { Node, Edge } from "reactflow"

interface CompanyWizardProps {
  onComplete: (data: any) => void
  onCancel: () => void
}

export function CompanyWizard({ onComplete, onCancel }: CompanyWizardProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "software",
    industry: "technology",
    agents: [] as any[],
    tools: [] as any[],
    workflow: {
      nodes: [] as Node[],
      edges: [] as Edge[],
    },
    settings: {
      autoStart: false,
      maxAgents: 5,
      maxTools: 5,
      notifyOnCompletion: true,
      apiRateLimit: 100,
      memorySize: 10,
      visibility: "private",
    },
  })

  const steps = [
    { id: 1, name: "基本信息", icon: Building2 },
    { id: 2, name: "选择智能体", icon: Bot },
    { id: 3, name: "选择工具", icon: Wrench },
    { id: 4, name: "工作流配置", icon: Users },
    { id: 5, name: "设置", icon: Settings },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleIndustryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, industry: value }))
  }

  const handleAgentSelection = (agentId: string) => {
    setFormData((prev) => {
      const agents = [...prev.agents]
      const agent = mockDataStore.getAgentById(agentId)

      if (!agent) return prev

      const existingIndex = agents.findIndex((a) => a.id === agentId)
      if (existingIndex >= 0) {
        return { ...prev, agents: agents.filter((_, i) => i !== existingIndex) }
      } else {
        return { ...prev, agents: [...agents, agent] }
      }
    })
  }

  const handleToolSelection = (toolId: string) => {
    setFormData((prev) => {
      const tools = [...prev.tools]
      const tool = mockDataStore.getToolById(toolId)

      if (!tool) return prev

      const existingIndex = tools.findIndex((t) => t.id === toolId)
      if (existingIndex >= 0) {
        return { ...prev, tools: tools.filter((_, i) => i !== existingIndex) }
      } else {
        return { ...prev, tools: [...tools, tool] }
      }
    })
  }

  const handleSettingChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: value,
      },
    }))
  }

  const handleSaveWorkflow = (nodes: Node[], edges: Edge[]) => {
    setFormData((prev) => ({
      ...prev,
      workflow: {
        nodes,
        edges,
      },
    }))
  }

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.description)) {
      alert("请填写公司名称和描述")
      return
    }
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    onComplete(formData)
  }

  const agents = mockDataStore.getAgents()
  const tools = mockDataStore.getTools()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={onCancel} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <h1 className="text-3xl font-bold">创建新公司</h1>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((s, index) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isCompleted = step > s.id

              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={`rounded-full h-10 w-10 flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isActive ? "text-primary font-medium" : isCompleted ? "text-green-500" : "text-gray-500"
                    }`}
                  >
                    {s.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-16 mt-2 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`}
                      style={{ display: "none" }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 步骤内容 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[step - 1].name}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 步骤1：基本信息 */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">公司名称</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="输入公司名称"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">公司描述</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="描述公司的目标和功能"
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>公司类型</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={handleTypeChange}
                      className="grid grid-cols-3 gap-4 mt-2"
                    >
                      <Label
                        htmlFor="software"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                          formData.type === "software" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="software" id="software" className="sr-only" />
                        <Building2 className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <p className="font-medium">软件开发</p>
                          <p className="text-sm text-muted-foreground">开发和维护软件项目</p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="research"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                          formData.type === "research" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="research" id="research" className="sr-only" />
                        <Users className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <p className="font-medium">市场调研</p>
                          <p className="text-sm text-muted-foreground">收集和分析市场数据</p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="content"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                          formData.type === "content" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="content" id="content" className="sr-only" />
                        <Bot className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <p className="font-medium">内容创作</p>
                          <p className="text-sm text-muted-foreground">创建和管理内容</p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="industry">行业</Label>
                    <Select value={formData.industry} onValueChange={handleIndustryChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择行业" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">科技</SelectItem>
                        <SelectItem value="finance">金融</SelectItem>
                        <SelectItem value="healthcare">医疗健康</SelectItem>
                        <SelectItem value="education">教育</SelectItem>
                        <SelectItem value="retail">零售</SelectItem>
                        <SelectItem value="manufacturing">制造业</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 步骤2：选择智能体 */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 className="text-xl font-semibold mb-4">选择智能体</h2>
                <p className="text-muted-foreground mb-6">为您的公司选择合适的智能体，以完成特定任务</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <Card
                      key={agent.id}
                      className={`cursor-pointer transition-all ${
                        formData.agents.some((a) => a.id === agent.id) ? "border-primary border-2" : ""
                      }`}
                      onClick={() => handleAgentSelection(agent.id)}
                    >
                      <CardContent className="p-4 flex items-start">
                        <div
                          className={`rounded-full w-10 h-10 flex items-center justify-center ${
                            formData.agents.some((a) => a.id === agent.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {formData.agents.some((a) => a.id === agent.id) ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-muted px-2 py-1 rounded">{agent.type}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 步骤3：选择工具 */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 className="text-xl font-semibold mb-4">选择工具</h2>
                <p className="text-muted-foreground mb-6">为您的公司选择合适的工具，以增强智能体的能力</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tools.map((tool) => (
                    <Card
                      key={tool.id}
                      className={`cursor-pointer transition-all ${
                        formData.tools.some((t) => t.id === tool.id) ? "border-primary border-2" : ""
                      }`}
                      onClick={() => handleToolSelection(tool.id)}
                    >
                      <CardContent className="p-4 flex items-start">
                        <div
                          className={`rounded-full w-10 h-10 flex items-center justify-center ${
                            formData.tools.some((t) => t.id === tool.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {formData.tools.some((t) => t.id === tool.id) ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Wrench className="h-5 w-5" />
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-muted px-2 py-1 rounded">{tool.type}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 步骤4：工作流配置 */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 className="text-xl font-semibold mb-4">工作流配置</h2>
                <p className="text-muted-foreground mb-6">设计智能体和工具之间的工作流程</p>

                <div className="h-[500px] border rounded-md">
                  <WorkflowEditor
                    initialNodes={formData.workflow.nodes}
                    initialEdges={formData.workflow.edges}
                    onSave={handleSaveWorkflow}
                  />
                </div>
              </motion.div>
            )}

            {/* 步骤5：设置 */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 className="text-xl font-semibold mb-4">公司设置</h2>
                <p className="text-muted-foreground mb-6">配置公司的运行参数和权限</p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoStart" className="text-base font-medium">
                        自动启动
                      </Label>
                      <p className="text-sm text-gray-500">创建后自动启动公司</p>
                    </div>
                    <Switch
                      id="autoStart"
                      checked={formData.settings.autoStart}
                      onCheckedChange={(checked) => handleSettingChange("autoStart", checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAgents">最大Agent数量</Label>
                      <Input
                        id="maxAgents"
                        type="number"
                        value={formData.settings.maxAgents}
                        onChange={(e) => handleSettingChange("maxAgents", Number.parseInt(e.target.value))}
                        min={1}
                        max={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTools">最大工具数量</Label>
                      <Input
                        id="maxTools"
                        type="number"
                        value={formData.settings.maxTools}
                        onChange={(e) => handleSettingChange("maxTools", Number.parseInt(e.target.value))}
                        min={1}
                        max={20}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API速率限制</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={formData.settings.apiRateLimit}
                      onChange={(e) => handleSettingChange("apiRateLimit", Number.parseInt(e.target.value))}
                      min={10}
                      max={1000}
                    />
                    <p className="text-xs text-gray-500">每分钟最大API调用次数</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visibility">可见性</Label>
                    <Select
                      value={formData.settings.visibility}
                      onValueChange={(value) => handleSettingChange("visibility", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择可见性" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">私有（仅创建者可见）</SelectItem>
                        <SelectItem value="team">团队（团队成员可见）</SelectItem>
                        <SelectItem value="public">公开（所有人可见）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifyOnCompletion" className="text-base font-medium">
                        任务完成通知
                      </Label>
                      <p className="text-sm text-gray-500">任务完成时发送通知</p>
                    </div>
                    <Switch
                      id="notifyOnCompletion"
                      checked={formData.settings.notifyOnCompletion}
                      onCheckedChange={(checked) => handleSettingChange("notifyOnCompletion", checked)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* 导航按钮 */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            上一步
          </Button>
          {step < steps.length ? (
            <Button onClick={nextStep}>
              下一步
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Check className="mr-2 h-4 w-4" />
              创建公司
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
