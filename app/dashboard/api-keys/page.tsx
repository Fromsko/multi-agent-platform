"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Key, Eye, EyeOff, Copy, Trash2, Edit, MoreHorizontal } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

export default function ApiKeysPage() {
  const { apiKeys, loadApiKeys, createApiKey, updateApiKey, deleteApiKey } = useAppStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingKey, setEditingKey] = useState<any>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    key: "",
    status: "active" as "active" | "inactive" | "expired",
    usage: { current: 0, limit: 1000 },
  })

  useEffect(() => {
    loadApiKeys()
  }, [loadApiKeys])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const keyData = {
      ...formData,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    }

    let success = false
    if (editingKey) {
      success = await updateApiKey(editingKey.id, keyData)
    } else {
      success = await createApiKey(keyData)
    }

    if (success) {
      setShowCreateDialog(false)
      setEditingKey(null)
      setFormData({
        name: "",
        provider: "",
        key: "",
        status: "active",
        usage: { current: 0, limit: 1000 },
      })
    }
  }

  const handleEdit = (key: any) => {
    setEditingKey(key)
    setFormData({
      name: key.name,
      provider: key.provider,
      key: key.key,
      status: key.status,
      usage: key.usage,
    })
    setShowCreateDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个API密钥吗？")) {
      await deleteApiKey(id)
    }
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("已复制到剪贴板")
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return key
    return key.substring(0, 4) + "•".repeat(key.length - 8) + key.substring(key.length - 4)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "openai":
        return "bg-blue-100 text-blue-800"
      case "anthropic":
        return "bg-purple-100 text-purple-800"
      case "google":
        return "bg-yellow-100 text-yellow-800"
      case "azure":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
          <h1 className="text-3xl font-bold text-gray-900">API密钥管理</h1>
          <p className="mt-2 text-gray-600">管理和配置各种AI服务的API密钥</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加API密钥
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingKey ? "编辑API密钥" : "添加API密钥"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="输入API密钥名称"
                  required
                />
              </div>
              <div>
                <Label htmlFor="provider">提供商</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择提供商" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OpenAI">OpenAI</SelectItem>
                    <SelectItem value="Anthropic">Anthropic</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Azure">Azure</SelectItem>
                    <SelectItem value="Other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="key">API密钥</Label>
                <Input
                  id="key"
                  type="password"
                  value={formData.key}
                  onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="输入API密钥"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">激活</SelectItem>
                    <SelectItem value="inactive">未激活</SelectItem>
                    <SelectItem value="expired">已过期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limit">使用限制</Label>
                <Input
                  id="limit"
                  type="number"
                  value={formData.usage.limit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usage: { ...prev.usage, limit: Number.parseInt(e.target.value) || 0 },
                    }))
                  }
                  placeholder="输入使用限制"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button type="submit">{editingKey ? "更新" : "创建"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* API Keys Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {(apiKeys || [])?.map((apiKey, index) => (
          <motion.div
            key={apiKey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Key className="h-5 w-5 mr-2 text-blue-600" />
                  {apiKey.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(apiKey)}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(apiKey.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getProviderColor(apiKey.provider)}>{apiKey.provider}</Badge>
                  <Badge className={getStatusColor(apiKey.status)}>
                    {apiKey.status === "active" ? "激活" : apiKey.status === "inactive" ? "未激活" : "已过期"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API密钥</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">使用量</span>
                    <span>
                      {apiKey.usage.current} / {apiKey.usage.limit}
                    </span>
                  </div>
                  <Progress value={(apiKey.usage.current / apiKey.usage.limit) * 100} className="h-2" />
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>创建时间: {new Date(apiKey.createdAt).toLocaleString()}</div>
                  <div>最后使用: {new Date(apiKey.lastUsed).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {(apiKeys || []).length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无API密钥</h3>
          <p className="text-gray-600 mb-4">开始添加您的第一个API密钥来使用AI服务</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加API密钥
          </Button>
        </motion.div>
      )}
    </div>
  )
}
