"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Bot, ArrowLeft, ArrowRight, Check, Settings, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, name: "基础信息", icon: Bot },
  { id: 2, name: "能力配置", icon: Zap },
  { id: 3, name: "参数设置", icon: Settings },
  { id: 4, name: "权限设置", icon: Shield },
]

const skillModules = [
  { id: "nlp", name: "自然语言处理", description: "文本理解和生成能力" },
  { id: "data", name: "数据计算", description: "数据分析和计算能力" },
  { id: "api", name: "外部工具调用", description: "调用外部API和服务" },
  { id: "memory", name: "记忆管理", description: "上下文记忆和检索" },
  { id: "reasoning", name: "逻辑推理", description: "复杂问题推理能力" },
  { id: "multimodal", name: "多模态处理", description: "图像、音频等多媒体处理" },
]

export default function CreateAgentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // 基础信息
    name: "",
    description: "",
    type: "",
    avatar: "🤖",

    // 能力配置
    skills: [] as string[],
    apiKey: "",

    // 参数设置
    temperature: [0.7],
    maxTokens: [2048],
    memoryLength: [10],

    // 权限设置
    allowedUsers: [] as string[],
    allowedAgents: [] as string[],
    isPublic: false,
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkillToggle = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId) ? prev.skills.filter((id) => id !== skillId) : [...prev.skills, skillId],
    }))
  }

  const handleSubmit = () => {
    // 这里应该调用API创建智能体
    console.log("Creating agent:", formData)
    router.push("/agents")
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.type
      case 2:
        return formData.skills.length > 0
      case 3:
        return true // 参数有默认值
      case 4:
        return true // 权限可以为空
      default:
        return false
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
              <h1 className="text-2xl font-bold text-gray-900">创建智能体</h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/agents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const isValid = isStepValid(step.id)

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 mr-2" })}
              {steps[currentStep - 1].name}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "设置智能体的基本信息"}
              {currentStep === 2 && "选择智能体的技能模块"}
              {currentStep === 3 && "调整智能体的运行参数"}
              {currentStep === 4 && "配置智能体的访问权限"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: 基础信息 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">智能体名称 *</Label>
                    <Input
                      id="name"
                      placeholder="输入智能体名称"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">角色类型 *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择角色类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="对话型">对话型</SelectItem>
                        <SelectItem value="分析型">分析型</SelectItem>
                        <SelectItem value="生成型">生成型</SelectItem>
                        <SelectItem value="协调型">协调型</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="描述智能体的功能和用途"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>选择图标</Label>
                  <div className="flex space-x-2">
                    {["🤖", "👨‍💼", "👩‍💻", "🧠", "⚡", "🔧", "📊", "🎯"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`w-12 h-12 text-2xl border-2 rounded-lg hover:border-blue-500 ${
                          formData.avatar === emoji ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: emoji }))}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: 能力配置 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">技能模块选择</Label>
                  <p className="text-sm text-gray-600 mb-4">选择智能体需要的技能模块</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillModules.map((skill) => (
                      <div
                        key={skill.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.skills.includes(skill.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleSkillToggle(skill.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{skill.name}</h3>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              formData.skills.includes(skill.id) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                            }`}
                          >
                            {formData.skills.includes(skill.id) && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.skills.includes("api") && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API 密钥</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="输入外部服务的API密钥"
                      value={formData.apiKey}
                      onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                    />
                    <p className="text-sm text-gray-600">用于调用外部工具和服务</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: 参数设置 */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">温度值 (随机性)</Label>
                    <p className="text-sm text-gray-600 mb-4">控制输出的随机性，值越高越随机</p>
                    <div className="px-4">
                      <Slider
                        value={formData.temperature}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, temperature: value }))}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>0 (确定性)</span>
                        <span className="font-medium">{formData.temperature[0]}</span>
                        <span>2 (随机性)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">最大 Tokens</Label>
                    <p className="text-sm text-gray-600 mb-4">单次响应的最大长度</p>
                    <div className="px-4">
                      <Slider
                        value={formData.maxTokens}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, maxTokens: value }))}
                        max={4096}
                        min={256}
                        step={256}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>256</span>
                        <span className="font-medium">{formData.maxTokens[0]}</span>
                        <span>4096</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">记忆长度</Label>
                    <p className="text-sm text-gray-600 mb-4">保持上下文的对话轮数</p>
                    <div className="px-4">
                      <Slider
                        value={formData.memoryLength}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, memoryLength: value }))}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>1</span>
                        <span className="font-medium">{formData.memoryLength[0]} 轮</span>
                        <span>50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: 权限设置 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">公开访问</Label>
                    <p className="text-sm text-gray-600">允许所有用户访问此智能体</p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                  />
                </div>

                {!formData.isPublic && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="allowedUsers">允许的用户</Label>
                      <Input
                        id="allowedUsers"
                        placeholder="输入用户邮箱，用逗号分隔"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            allowedUsers: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                      <p className="text-sm text-gray-600">指定可以调用此智能体的用户</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allowedAgents">允许的智能体</Label>
                      <Input
                        id="allowedAgents"
                        placeholder="输入智能体名称，用逗号分隔"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            allowedAgents: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                      <p className="text-sm text-gray-600">指定可以调用此智能体的其他智能体</p>
                    </div>
                  </>
                )}

                {/* Preview */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">配置预览</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">名称</span>
                      <span className="text-sm font-medium">{formData.name || "未设置"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">类型</span>
                      <span className="text-sm font-medium">{formData.type || "未设置"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">技能模块</span>
                      <div className="flex space-x-1">
                        {formData.skills.map((skillId) => {
                          const skill = skillModules.find((s) => s.id === skillId)
                          return (
                            <Badge key={skillId} variant="secondary" className="text-xs">
                              {skill?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">温度值</span>
                      <span className="text-sm font-medium">{formData.temperature[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">访问权限</span>
                      <span className="text-sm font-medium">{formData.isPublic ? "公开" : "受限"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            上一步
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
              下一步
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!isStepValid(currentStep)}>
              <Check className="h-4 w-4 mr-2" />
              创建智能体
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
