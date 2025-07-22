"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Camera, Save, Edit, Shield, Key, Bell } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    avatar: user?.avatar || "/placeholder.svg?height=100&width=100",
  })
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
  })

  const handleProfileSave = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsEditing(false)
    toast.success("个人信息已更新")
  }

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("新密码和确认密码不匹配")
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    toast.success("密码已更新")
  }

  const handleNotificationSave = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("通知设置已更新")
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          avatar: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
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
          <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
          <p className="mt-2 text-gray-600">管理您的个人信息和账户设置</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">个人信息</TabsTrigger>
            <TabsTrigger value="security">安全设置</TabsTrigger>
            <TabsTrigger value="notifications">通知设置</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="h-4 w-4" />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profileData.name}</h3>
                    <p className="text-gray-600">{profileData.email}</p>
                    <p className="text-sm text-gray-500">加入时间: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">电话</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="输入电话号码"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">位置</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="输入所在位置"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="介绍一下自己..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        取消
                      </Button>
                      <Button onClick={handleProfileSave}>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  密码设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">当前密码</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="输入当前密码"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="输入新密码"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="再次输入新密码"
                  />
                </div>
                <Button onClick={handlePasswordChange} className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  更新密码
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>两步验证</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">启用两步验证</h4>
                    <p className="text-sm text-gray-600">为您的账户添加额外的安全保护</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>登录历史</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { device: "Chrome on Windows", location: "北京, 中国", time: "2024-01-15 10:30", current: true },
                    { device: "Safari on iPhone", location: "上海, 中国", time: "2024-01-14 15:20", current: false },
                    { device: "Firefox on Mac", location: "深圳, 中国", time: "2024-01-13 09:15", current: false },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{session.device}</div>
                        <div className="text-sm text-gray-600">
                          {session.location} • {session.time}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.current && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">当前会话</span>
                        )}
                        {!session.current && (
                          <Button variant="outline" size="sm">
                            终止
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  通知偏好
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">邮件通知</h4>
                      <p className="text-sm text-gray-600">接收重要更新和活动通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">推送通知</h4>
                      <p className="text-sm text-gray-600">在浏览器中接收实时通知</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">短信通知</h4>
                      <p className="text-sm text-gray-600">接收重要安全提醒</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, smsNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">营销邮件</h4>
                      <p className="text-sm text-gray-600">接收产品更新和优惠信息</p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, marketingEmails: checked }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleNotificationSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
