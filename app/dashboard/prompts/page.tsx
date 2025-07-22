"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/stores/useAppStore"
import { motion } from "framer-motion"
import {
  Copy,
  Edit,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Star,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function PromptsPage() {
  const { prompts, loadPrompts, createPrompt, updatePrompt, deletePrompt } =
    useAppStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<any>(null)
  const [testingPrompt, setTestingPrompt] = useState<any>(null)
  const [testResult, setTestResult] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    content: "",
    variables: [] as string[],
    rating: 0,
  })

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const promptData = {
      ...formData,
      usage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let success = false
    if (editingPrompt) {
      success = await updatePrompt(editingPrompt.id, promptData)
    } else {
      success = await createPrompt(promptData)
    }

    if (success) {
      setShowCreateDialog(false)
      setEditingPrompt(null)
      setFormData({
        name: "",
        description: "",
        category: "",
        content: "",
        variables: [],
        rating: 0,
      })
    }
  }

  const handleEdit = (prompt: any) => {
    setEditingPrompt(prompt)
    setFormData({
      name: prompt.name,
      description: prompt.description,
      category: prompt.category,
      content: prompt.content,
      variables: prompt.variables,
      rating: prompt.rating,
    })
    setShowCreateDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个提示词吗？")) {
      await deletePrompt(id)
    }
  }

  const handleTest = async (prompt: any) => {
    setTestingPrompt(prompt)
    // Simulate prompt testing
    setTimeout(() => {
      setTestResult(
        `测试结果：提示词 "${prompt.name}" 执行成功！\n\n生成的内容示例：\n这是一个基于您的提示词生成的示例响应。提示词的质量很好，建议的改进点包括：\n1. 可以增加更多的上下文信息\n2. 考虑添加输出格式的约束\n3. 可以优化变量的使用方式`
      )
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("已复制到剪贴板")
  }

  const extractVariables = (content: string) => {
    const matches = content.match(/\{([^}]+)\}/g)
    return matches ? matches.map((match) => match.slice(1, -1)) : []
  }

  const handleContentChange = (content: string) => {
    const variables = extractVariables(content)
    setFormData((prev) => ({ ...prev, content, variables }))
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "writing":
        return "bg-blue-100 text-blue-800"
      case "analysis":
        return "bg-green-100 text-green-800"
      case "creative":
        return "bg-purple-100 text-purple-800"
      case "technical":
        return "bg-orange-100 text-orange-800"
      case "business":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ))
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
          <h1 className="text-3xl font-bold text-gray-900">提示词优化</h1>
          <p className="mt-2 text-gray-600">管理和优化AI提示词模板</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建提示词
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                {editingPrompt ? "编辑提示词" : "创建提示词"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="输入提示词名称"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">分类</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="writing">写作</SelectItem>
                      <SelectItem value="analysis">分析</SelectItem>
                      <SelectItem value="creative">创意</SelectItem>
                      <SelectItem value="technical">技术</SelectItem>
                      <SelectItem value="business">商务</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="输入提示词描述"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">提示词内容</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="输入提示词内容，使用 {变量名} 来定义变量"
                  rows={8}
                  required
                />
                {formData.variables.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-600">
                      检测到的变量:
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.variables.map((variable, index) => (
                        <Badge key={index} variant="outline">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  取消
                </Button>
                <Button type="submit">{editingPrompt ? "更新" : "创建"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Prompts Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {prompts.map((prompt, index) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  {prompt.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTest(prompt)}>
                      <Play className="h-4 w-4 mr-2" />
                      测试
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => copyToClipboard(prompt.content)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      复制
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(prompt)}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(prompt.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(prompt.category)}>
                    {prompt.category}
                  </Badge>
                  <div className="flex items-center">
                    {renderStars(prompt.rating)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {prompt.description}
                </p>

                <div className="bg-gray-50 p-3 rounded text-sm font-mono line-clamp-4">
                  {prompt.content}
                </div>

                {prompt.variables.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-500">变量:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prompt.variables.map((variable, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>使用次数: {prompt.usage}</span>
                  <span>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {prompts.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无提示词</h3>
          <p className="text-gray-600 mb-4">开始创建您的第一个AI提示词模板</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建提示词
          </Button>
        </motion.div>
      )}

      {/* Test Dialog */}
      <Dialog
        open={!!testingPrompt}
        onOpenChange={() => setTestingPrompt(null)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>测试提示词: {testingPrompt?.name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="test">测试</TabsTrigger>
              <TabsTrigger value="result">结果</TabsTrigger>
            </TabsList>
            <TabsContent value="test" className="space-y-4">
              <div>
                <Label>原始提示词</Label>
                <Textarea
                  value={testingPrompt?.content || ""}
                  readOnly
                  rows={6}
                  className="bg-gray-50"
                />
              </div>
              {testingPrompt?.variables.length > 0 && (
                <div>
                  <Label>变量值</Label>
                  <div className="space-y-2">
                    {testingPrompt.variables.map(
                      (variable: string, index: number) => (
                        <div key={index}>
                          <Label className="text-sm">{variable}</Label>
                          <Input placeholder={`输入 ${variable} 的值`} />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={() => handleTest(testingPrompt)}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                运行测试
              </Button>
            </TabsContent>
            <TabsContent value="result" className="space-y-4">
              <div>
                <Label>测试结果</Label>
                <Textarea
                  value={testResult}
                  readOnly
                  rows={12}
                  className="bg-gray-50"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(testResult)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制结果
                </Button>
                <Button onClick={() => setTestingPrompt(null)}>关闭</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
