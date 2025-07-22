"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, Users, Settings, Shield, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { mockDataStore, type Company } from "@/lib/mock-data"
import { toast } from "react-hot-toast"

export default function CompanySettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [settings, setSettings] = useState({
    name: "",
    description: "",
    type: "",
    industry: "",
    autoStart: false,
    maxAgents: 5,
    maxTools: 10,
    notifyOnCompletion: true,
    apiRateLimit: 100,
    memorySize: 10,
    visibility: "private",
    webhookUrl: "",
    slackChannel: "",
    emailNotifications: true,
    smsNotifications: false,
  })

  useEffect(() => {
    const companies = mockDataStore.getCompanies()
    const foundCompany = companies.find((c) => c.id === params.id)
    if (foundCompany) {
      setCompany(foundCompany)
      setSettings({
        name: foundCompany.name,
        description: foundCompany.description || "",
        type: foundCompany.type || "",
        industry: foundCompany.industry || "",
        autoStart: foundCompany.settings?.autoStart || false,
        maxAgents: foundCompany.settings?.maxAgents || 5,
        maxTools: foundCompany.settings?.maxTools || 10,
        notifyOnCompletion: foundCompany.settings?.notifyOnCompletion || true,
        apiRateLimit: foundCompany.settings?.apiRateLimit || 100,
        memorySize: foundCompany.settings?.memorySize || 10,
        visibility: foundCompany.settings?.visibility || "private",
        webhookUrl: foundCompany.settings?.webhookUrl || "",
        slackChannel: foundCompany.settings?.slackChannel || "",
        emailNotifications: foundCompany.settings?.emailNotifications || true,
        smsNotifications: foundCompany.settings?.smsNotifications || false,
      })
    }
  }, [params.id])

  const handleSave = () => {
    if (!company) return

    const updatedCompany = {
      ...company,
      name: settings.name,
      description: settings.description,
      type: settings.type,
      industry: settings.industry,
      settings: {
        autoStart: settings.autoStart,
        maxAgents: settings.maxAgents,
        maxTools: settings.maxTools,
        notifyOnCompletion: settings.notifyOnCompletion,
        apiRateLimit: settings.apiRateLimit,
        memorySize: settings.memorySize,
        visibility: settings.visibility,
        webhookUrl: settings.webhookUrl,
        slackChannel: settings.slackChannel,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
      },
    }

    // 更新mock数据
    const companies = mockDataStore.getCompanies()
    const index = companies.findIndex((c) => c.id === company.id)
    if (index !== -1) {
      companies[index] = updatedCompany
    }

    setCompany(updatedCompany)
    toast.success("设置已保存")
  }

  const handleDelete = () => {
    if (!company) return

    if (confirm(`确定要删除公司 "${company.name}" 吗？此操作不可撤销。`)) {
      // 这里应该调用删除API
      toast.success("公司已删除")
      router.push("/dashboard/companies")
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push(`/dashboard/companies/${company.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">公司设置</h1>
            <p className="text-gray-600">{company.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            删除公司
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </Button>
        </div>
      </div>

      {/* 设置标签页 */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            基本设置
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Agent设置
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            安全设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            通知设置
          </TabsTrigger>
        </TabsList>

        {/* 基本设置 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>配置公司的基本信息和描述</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">公司名称</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">公司类型</Label>
                  <Select value={settings.type} onValueChange={(value) => setSettings({ ...settings, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">软件开发</SelectItem>
                      <SelectItem value="research">市场调研</SelectItem>
                      <SelectItem value="content">内容创作</SelectItem>
                      <SelectItem value="consulting">咨询服务</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">公司描述</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">所属行业</Label>
                <Select
                  value={settings.industry}
                  onValueChange={(value) => setSettings({ ...settings, industry: value })}
                >
                  <SelectTrigger>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>运行设置</CardTitle>
              <CardDescription>配置公司的运行参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动启动</Label>
                  <p className="text-sm text-gray-500">创建后自动启动公司运营</p>
                </div>
                <Switch
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoStart: checked })}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memorySize">内存大小 (GB)</Label>
                  <Input
                    id="memorySize"
                    type="number"
                    value={settings.memorySize}
                    onChange={(e) => setSettings({ ...settings, memorySize: Number(e.target.value) })}
                    min={1}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API速率限制 (次/分钟)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({ ...settings, apiRateLimit: Number(e.target.value) })}
                    min={10}
                    max={1000}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">可见性</Label>
                <Select
                  value={settings.visibility}
                  onValueChange={(value) => setSettings({ ...settings, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">私有（仅创建者可见）</SelectItem>
                    <SelectItem value="team">团队（团队成员可见）</SelectItem>
                    <SelectItem value="public">公开（所有人可见）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent设置 */}
        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent配置</CardTitle>
              <CardDescription>管理公司中的Agent数量和配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxAgents">最大Agent数量</Label>
                  <Input
                    id="maxAgents"
                    type="number"
                    value={settings.maxAgents}
                    onChange={(e) => setSettings({ ...settings, maxAgents: Number(e.target.value) })}
                    min={1}
                    max={20}
                  />
                  <p className="text-xs text-gray-500">
                    当前使用: {company.agents} / {settings.maxAgents}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTools">最大工具数量</Label>
                  <Input
                    id="maxTools"
                    type="number"
                    value={settings.maxTools}
                    onChange={(e) => setSettings({ ...settings, maxTools: Number(e.target.value) })}
                    min={1}
                    max={50}
                  />
                  <p className="text-xs text-gray-500">
                    当前使用: {company.tools || 0} / {settings.maxTools}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>访问控制</CardTitle>
              <CardDescription>管理公司的访问权限和安全设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                  placeholder="https://your-webhook-url.com"
                />
                <p className="text-xs text-gray-500">用于接收公司状态变更通知</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知配置</CardTitle>
              <CardDescription>配置各种通知方式和触发条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>任务完成通知</Label>
                  <p className="text-sm text-gray-500">任务完成时发送通知</p>
                </div>
                <Switch
                  checked={settings.notifyOnCompletion}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifyOnCompletion: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>邮件通知</Label>
                  <p className="text-sm text-gray-500">通过邮件接收通知</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>短信通知</Label>
                  <p className="text-sm text-gray-500">通过短信接收重要通知</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="slackChannel">Slack频道</Label>
                <Input
                  id="slackChannel"
                  value={settings.slackChannel}
                  onChange={(e) => setSettings({ ...settings, slackChannel: e.target.value })}
                  placeholder="#general"
                />
                <p className="text-xs text-gray-500">发送通知到指定的Slack频道</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
