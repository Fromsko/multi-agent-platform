'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Upload,
  X,
  Plus,
  Bot,
  Settings,
  Zap,
  Brain,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent, AgentConfiguration } from '@/services/types'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const agentFormSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(50, '名称不能超过50个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  type: z.enum(['chat', 'task', 'analysis', 'workflow', 'custom']),
  avatar: z.string().optional(),
  configuration: z.object({
    model: z.string().min(1, '请选择模型'),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(1).max(8000),
    systemPrompt: z.string().optional(),
    skills: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    enableMemory: z.boolean().default(false),
    memorySize: z.number().min(0).max(1000).default(100),
    enableLearning: z.boolean().default(false),
    maxConcurrentTasks: z.number().min(1).max(10).default(1),
    timeout: z.number().min(1000).max(300000).default(30000),
    retryAttempts: z.number().min(0).max(5).default(3),
  }),
})

type AgentFormData = z.infer<typeof agentFormSchema>

interface AgentFormProps {
  agent?: Agent
  onSubmit: (data: AgentFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  className?: string
}

const agentTypes = [
  { value: 'chat', label: '对话助手', icon: MessageSquare, description: '专注于对话交互的智能助手' },
  { value: 'task', label: '任务执行', icon: Zap, description: '执行特定任务和工作流程' },
  { value: 'analysis', label: '数据分析', icon: Brain, description: '分析数据并提供洞察' },
  { value: 'workflow', label: '工作流', icon: Settings, description: '管理复杂的业务流程' },
  { value: 'custom', label: '自定义', icon: Bot, description: '自定义功能的智能助手' },
]

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4', description: '最强大的语言模型' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: '更快的GPT-4版本' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: '快速且经济的选择' },
  { value: 'claude-3', label: 'Claude 3', description: 'Anthropic的先进模型' },
  { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google的多模态模型' },
]

const availableSkills = [
  '自然语言处理', '数据分析', '代码生成', '文档处理', '图像识别',
  '语音识别', '翻译', '摘要生成', '问答系统', '推荐系统',
  '情感分析', '实体识别', '关键词提取', '文本分类', '对话管理'
]

const availableTools = [
  'web_search', 'calculator', 'code_interpreter', 'file_manager',
  'email_sender', 'calendar', 'weather', 'translator', 'image_generator',
  'pdf_reader', 'excel_processor', 'database_query', 'api_caller'
]

export const AgentForm: React.FC<AgentFormProps> = ({
  agent,
  onSubmit,
  onCancel,
  loading = false,
  className,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: agent?.name || '',
      description: agent?.description || '',
      type: agent?.type || 'chat',
      avatar: agent?.avatar || '',
      configuration: {
        model: agent?.configuration?.model || 'gpt-4',
        temperature: agent?.configuration?.temperature || 0.7,
        maxTokens: agent?.configuration?.maxTokens || 2000,
        systemPrompt: agent?.configuration?.systemPrompt || '',
        skills: agent?.configuration?.skills || [],
        tools: agent?.configuration?.tools || [],
        enableMemory: agent?.configuration?.enableMemory || false,
        memorySize: agent?.configuration?.memorySize || 100,
        enableLearning: agent?.configuration?.enableLearning || false,
        maxConcurrentTasks: agent?.configuration?.maxConcurrentTasks || 1,
        timeout: agent?.configuration?.timeout || 30000,
        retryAttempts: agent?.configuration?.retryAttempts || 3,
      },
    },
  })

  useEffect(() => {
    if (agent) {
      setSelectedSkills(agent.configuration?.skills || [])
      setSelectedTools(agent.configuration?.tools || [])
      setAvatarPreview(agent.avatar || null)
    }
  }, [agent])

  const handleSubmit = async (data: AgentFormData) => {
    const formData = {
      ...data,
      configuration: {
        ...data.configuration,
        skills: selectedSkills,
        tools: selectedTools,
      },
    }
    await onSubmit(formData)
  }

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill))
  }

  const addCustomSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill.trim())
      setNewSkill('')
    }
  }

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool))
    } else {
      setSelectedTools([...selectedTools, tool])
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        form.setValue('avatar', result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 头像上传 */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview || ''} />
                  <AvatarFallback>
                    {form.watch('name')?.slice(0, 2).toUpperCase() || 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      上传头像
                    </div>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 JPG、PNG 格式，建议尺寸 200x200
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="输入Agent名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>类型 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择Agent类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {agentTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div>
                                    <div>{type.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {type.description}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="描述Agent的功能和用途"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      简要描述这个Agent的功能和使用场景
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 模型配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                模型配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="configuration.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>语言模型 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择语言模型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modelOptions.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            <div>
                              <div>{model.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {model.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="configuration.temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>创造性 ({field.value})</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        0 = 保守，2 = 创造性
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.maxTokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最大令牌数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={8000}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        控制回复的最大长度
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="configuration.systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>系统提示词</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="定义Agent的角色和行为规则"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      设置Agent的角色、性格和回复风格
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 技能配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                技能配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>已选技能</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                  {selectedSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground">暂未选择技能</p>
                  )}
                </div>
              </div>

              <div>
                <Label>可选技能</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableSkills
                    .filter(skill => !selectedSkills.includes(skill))
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addSkill(skill)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="添加自定义技能"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                />
                <Button type="button" variant="outline" onClick={addCustomSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 工具配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                工具配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTools.map((tool) => (
                  <div
                    key={tool}
                    className={cn(
                      'flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedTools.includes(tool)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => toggleTool(tool)}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center',
                      selectedTools.includes(tool)
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    )}>
                      {selectedTools.includes(tool) && (
                        <div className="w-2 h-2 bg-white rounded-sm" />
                      )}
                    </div>
                    <span className="text-sm">{tool}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 高级配置 */}
          <Card>
            <CardHeader>
              <CardTitle>高级配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="configuration.enableMemory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>启用记忆</FormLabel>
                        <FormDescription>
                          Agent可以记住之前的对话
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.enableLearning"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>启用学习</FormLabel>
                        <FormDescription>
                          Agent可以从交互中学习
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('configuration.enableMemory') && (
                <FormField
                  control={form.control}
                  name="configuration.memorySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>记忆容量</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1000}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Agent可以记住的对话轮数
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="configuration.maxConcurrentTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最大并发任务</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>超时时间 (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1000}
                          max={300000}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuration.retryAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>重试次数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {agent ? '更新Agent' : '创建Agent'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}