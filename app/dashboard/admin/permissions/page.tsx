"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Users, Settings, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"

interface Permission {
  id: string
  name: string
  description: string
  resource: string
  actions: string[]
  createdAt: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
}

export default function AdminPermissionsPage() {
  const [activeTab, setActiveTab] = useState("roles")
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false)
  const [showCreatePermissionDialog, setShowCreatePermissionDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)

  // Mock data
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "超级管理员",
      description: "拥有系统所有权限",
      permissions: ["all"],
      userCount: 1,
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "管理员",
      description: "拥有大部分管理权限",
      permissions: ["read", "write", "manage_users", "manage_agents"],
      userCount: 3,
      isSystem: false,
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "3",
      name: "用户",
      description: "基本用户权限",
      permissions: ["read", "write"],
      userCount: 15,
      isSystem: false,
      createdAt: "2024-01-03T00:00:00Z",
    },
    {
      id: "4",
      name: "查看者",
      description: "只读权限",
      permissions: ["read"],
      userCount: 8,
      isSystem: false,
      createdAt: "2024-01-04T00:00:00Z",
    },
  ])

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "1",
      name: "读取",
      description: "查看数据的权限",
      resource: "all",
      actions: ["read"],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "写入",
      description: "创建和修改数据的权限",
      resource: "all",
      actions: ["create", "update"],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      name: "删除",
      description: "删除数据的权限",
      resource: "all",
      actions: ["delete"],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "4",
      name: "用户管理",
      description: "管理系统用户",
      resource: "users",
      actions: ["create", "read", "update", "delete"],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "5",
      name: "智能体管理",
      description: "管理AI智能体",
      resource: "agents",
      actions: ["create", "read", "update", "delete"],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "6",
      name: "公司管理",
      description: "管理公司信息",
      resource: "companies",
      actions: ["create", "read", "update", "delete"],
      createdAt: "2024-01-01T00:00:00Z",
    },
  ])

  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    description: "",
    resource: "",
    actions: [] as string[],
  })

  const availableActions = ["create", "read", "update", "delete", "manage", "execute"]
  const availableResources = ["all", "users", "agents", "companies", "tools", "prompts", "logs"]

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()

    const newRole: Role = {
      id: Date.now().toString(),
      ...roleFormData,
      userCount: 0,
      isSystem: false,
      createdAt: new Date().toISOString(),
    }

    if (editingRole) {
      setRoles((prev) => prev.map((role) => (role.id === editingRole.id ? { ...role, ...roleFormData } : role)))
      toast.success("角色更新成功")
    } else {
      setRoles((prev) => [...prev, newRole])
      toast.success("角色创建成功")
    }

    setShowCreateRoleDialog(false)
    setEditingRole(null)
    setRoleFormData({ name: "", description: "", permissions: [] })
  }

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault()

    const newPermission: Permission = {
      id: Date.now().toString(),
      ...permissionFormData,
      createdAt: new Date().toISOString(),
    }

    if (editingPermission) {
      setPermissions((prev) =>
        prev.map((perm) => (perm.id === editingPermission.id ? { ...perm, ...permissionFormData } : perm)),
      )
      toast.success("权限更新成功")
    } else {
      setPermissions((prev) => [...prev, newPermission])
      toast.success("权限创建成功")
    }

    setShowCreatePermissionDialog(false)
    setEditingPermission(null)
    setPermissionFormData({ name: "", description: "", resource: "", actions: [] })
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })
    setShowCreateRoleDialog(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    setPermissionFormData({
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      actions: permission.actions,
    })
    setShowCreatePermissionDialog(true)
  }

  const handleDeleteRole = (id: string) => {
    const role = roles.find((r) => r.id === id)
    if (role?.isSystem) {
      toast.error("系统角色不能删除")
      return
    }

    if (confirm("确定要删除这个角色吗？")) {
      setRoles((prev) => prev.filter((role) => role.id !== id))
      toast.success("角色删除成功")
    }
  }

  const handleDeletePermission = (id: string) => {
    if (confirm("确定要删除这个权限吗？")) {
      setPermissions((prev) => prev.filter((perm) => perm.id !== id))
      toast.success("权限删除成功")
    }
  }

  const togglePermissionInRole = (permissionId: string) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const toggleActionInPermission = (action: string) => {
    setPermissionFormData((prev) => ({
      ...prev,
      actions: prev.actions.includes(action) ? prev.actions.filter((a) => a !== action) : [...prev.actions, action],
    }))
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
          <h1 className="text-3xl font-bold text-gray-900">权限管理</h1>
          <p className="mt-2 text-gray-600">管理系统角色和权限</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总角色数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总权限数</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统角色</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter((r) => r.isSystem).length}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles">角色管理</TabsTrigger>
            <TabsTrigger value="permissions">权限管理</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">角色列表</h2>
              <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    创建角色
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingRole ? "编辑角色" : "创建角色"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateRole} className="space-y-4">
                    <div>
                      <Label htmlFor="roleName">角色名称</Label>
                      <Input
                        id="roleName"
                        value={roleFormData.name}
                        onChange={(e) => setRoleFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="输入角色名称"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="roleDescription">角色描述</Label>
                      <Textarea
                        id="roleDescription"
                        value={roleFormData.description}
                        onChange={(e) => setRoleFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="输入角色描述"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>权限分配</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={roleFormData.permissions.includes(permission.id)}
                              onCheckedChange={() => togglePermissionInRole(permission.id)}
                            />
                            <Label htmlFor={`perm-${permission.id}`} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
                        取消
                      </Button>
                      <Button type="submit">{editingRole ? "更新" : "创建"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>权限数量</TableHead>
                      <TableHead>用户数量</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>{role.permissions.length}</TableCell>
                        <TableCell>{role.userCount}</TableCell>
                        <TableCell>
                          <Badge variant={role.isSystem ? "destructive" : "default"}>
                            {role.isSystem ? "系统" : "自定义"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                <Edit className="h-4 w-4 mr-2" />
                                编辑
                              </DropdownMenuItem>
                              {!role.isSystem && (
                                <DropdownMenuItem onClick={() => handleDeleteRole(role.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">权限列表</h2>
              <Dialog open={showCreatePermissionDialog} onOpenChange={setShowCreatePermissionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    创建权限
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingPermission ? "编辑权限" : "创建权限"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePermission} className="space-y-4">
                    <div>
                      <Label htmlFor="permissionName">权限名称</Label>
                      <Input
                        id="permissionName"
                        value={permissionFormData.name}
                        onChange={(e) => setPermissionFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="输入权限名称"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="permissionDescription">权限描述</Label>
                      <Textarea
                        id="permissionDescription"
                        value={permissionFormData.description}
                        onChange={(e) => setPermissionFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="输入权限描述"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resource">资源类型</Label>
                      <select
                        id="resource"
                        value={permissionFormData.resource}
                        onChange={(e) => setPermissionFormData((prev) => ({ ...prev, resource: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">选择资源类型</option>
                        {availableResources.map((resource) => (
                          <option key={resource} value={resource}>
                            {resource}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>操作权限</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableActions.map((action) => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              id={`action-${action}`}
                              checked={permissionFormData.actions.includes(action)}
                              onCheckedChange={() => toggleActionInPermission(action)}
                            />
                            <Label htmlFor={`action-${action}`} className="text-sm">
                              {action}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreatePermissionDialog(false)}>
                        取消
                      </Button>
                      <Button type="submit">{editingPermission ? "更新" : "创建"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>权限名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>资源</TableHead>
                      <TableHead>操作</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.resource}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {permission.actions.map((action) => (
                              <Badge key={action} variant="secondary" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(permission.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPermission(permission)}>
                                <Edit className="h-4 w-4 mr-2" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePermission(permission.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
