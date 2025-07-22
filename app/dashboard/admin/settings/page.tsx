"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, RefreshCw, Server, Mail, Shield, Database, HardDrive } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast"

export default function AdminSettingsPage() {
  const { systemSettings, loadSystemSettings, updateSystemSettings } = useAppStore()
  const [settings, setSettings] = useState(systemSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    const success = await updateSystemSettings(settings)
    if (success) {
      setHasChanges(false)
    }
  }

  const handleReset = () => {
    loadSystemSettings()
    setSettings(systemSettings)
    setHasChanges(false)
    toast.success("设置已重置")
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
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="mt-2 text-gray-600">管理系统配置和参数</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">常规设置</TabsTrigger>
            <TabsTrigger value="security">安全设置</TabsTrigger>
            <TabsTrigger value="email">邮件设置</TabsTrigger>
            <TabsTrigger value="api">API设置</TabsTrigger>
            <TabsTrigger value="storage">存储设置</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">站点名称</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">语言</Label>
                    <Select
                      value={settings.general.language}
                      onValueChange={(value) => handleSettingChange("general", "language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">中文</SelectItem>
                        <SelectItem value="en-US">English</SelectItem>
                        <SelectItem value="ja-JP">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="siteDescription">站点描述</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">时区</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => handleSettingChange("general", "timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  安全配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">会话超时 (秒)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        handleSettingChange("security", "sessionTimeout", Number.parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">最大登录尝试次数</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        handleSettingChange("security", "maxLoginAttempts", Number.parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passwordMinLength">密码最小长度</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) =>
                        handleSettingChange("security", "passwordMinLength", Number.parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>启用两步验证</Label>
                      <p className="text-sm text-gray-600">要求用户启用两步验证</p>
                    </div>
                    <Switch
                      checked={settings.security.requireTwoFactor}
                      onCheckedChange={(checked) => handleSettingChange("security", "requireTwoFactor", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  SMTP配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP主机</Label>
                    <Input
                      id="smtpHost"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleSettingChange("email", "smtpHost", e.target.value)}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP端口</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleSettingChange("email", "smtpPort", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUser">SMTP用户名</Label>
                    <Input
                      id="smtpUser"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleSettingChange("email", "smtpUser", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP密码</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleSettingChange("email", "smtpPassword", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fromEmail">发件人邮箱</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleSettingChange("email", "fromEmail", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  API配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rateLimit">速率限制 (请求/小时)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      value={settings.api.rateLimit}
                      onChange={(e) => handleSettingChange("api", "rateLimit", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxRequestSize">最大请求大小 (字节)</Label>
                    <Input
                      id="maxRequestSize"
                      type="number"
                      value={settings.api.maxRequestSize}
                      onChange={(e) => handleSettingChange("api", "maxRequestSize", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>启用CORS</Label>
                    <p className="text-sm text-gray-600">允许跨域请求</p>
                  </div>
                  <Switch
                    checked={settings.api.enableCors}
                    onCheckedChange={(checked) => handleSettingChange("api", "enableCors", checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="allowedOrigins">允许的源 (每行一个)</Label>
                  <Textarea
                    id="allowedOrigins"
                    value={settings.api.allowedOrigins.join("\n")}
                    onChange={(e) =>
                      handleSettingChange("api", "allowedOrigins", e.target.value.split("\n").filter(Boolean))
                    }
                    rows={4}
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  存储配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider">存储提供商</Label>
                    <Select
                      value={settings.storage.provider}
                      onValueChange={(value) => handleSettingChange("storage", "provider", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">本地存储</SelectItem>
                        <SelectItem value="aws">AWS S3</SelectItem>
                        <SelectItem value="azure">Azure Blob</SelectItem>
                        <SelectItem value="gcp">Google Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxFileSize">最大文件大小 (字节)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={settings.storage.maxFileSize}
                      onChange={(e) => handleSettingChange("storage", "maxFileSize", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retentionDays">数据保留天数</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      value={settings.storage.retentionDays}
                      onChange={(e) => handleSettingChange("storage", "retentionDays", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="allowedFileTypes">允许的文件类型 (逗号分隔)</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.storage.allowedFileTypes.join(", ")}
                    onChange={(e) =>
                      handleSettingChange(
                        "storage",
                        "allowedFileTypes",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="jpg, png, pdf, doc"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
