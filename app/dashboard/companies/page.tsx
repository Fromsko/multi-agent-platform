"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Building2, Plus, Search, MoreHorizontal, Edit, Trash2, Play, Eye } from "lucide-react"
import { mockDataStore, type Company } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    setCompanies(mockDataStore.getCompanies())
  }, [])

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || company.status === statusFilter
    const matchesType = typeFilter === "all" || company.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "idle":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "活跃"
      case "idle":
        return "空闲"
      case "maintenance":
        return "维护中"
      default:
        return "未知"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "software":
        return "软件开发"
      case "research":
        return "市场调研"
      case "content":
        return "内容创作"
      default:
        return type
    }
  }

  const handleCreateCompany = () => {
    router.push("/dashboard/companies/create")
  }

  const handleViewCompany = (company: Company) => {
    router.push(`/dashboard/companies/${company.id}`)
  }

  const handleStartCompany = (company: Company) => {
    const updatedCompany = { ...company, status: "active" as const }
    const updatedCompanies = companies.map((c) => (c.id === company.id ? updatedCompany : c))
    setCompanies(updatedCompanies)
    toast.success(`${company.name} 已启动`)
  }

  const handleDeleteCompany = (company: Company) => {
    const updatedCompanies = companies.filter((c) => c.id !== company.id)
    setCompanies(updatedCompanies)
    toast.success(`${company.name} 已删除`)
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
          <h1 className="text-3xl font-bold text-gray-900">我的公司</h1>
          <p className="mt-2 text-gray-600">管理和监控您的AI公司</p>
        </div>
        <Button className="flex items-center space-x-2" onClick={handleCreateCompany}>
          <Plus className="h-4 w-4" />
          <span>创建公司</span>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索公司名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="active">活跃</SelectItem>
              <SelectItem value="idle">空闲</SelectItem>
              <SelectItem value="maintenance">维护中</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="类型筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有类型</SelectItem>
              <SelectItem value="software">软件开发</SelectItem>
              <SelectItem value="research">市场调研</SelectItem>
              <SelectItem value="content">内容创作</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Companies Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredCompanies.map((company, index) => (
          <motion.div
            key={company.id}
            className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            onClick={() => handleViewCompany(company)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {getTypeText(company.type)}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewCompany(company)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    查看详情
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartCompany(company)
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    启动
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      // 编辑功能
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCompany(company)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-gray-600 mb-4">{company.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">状态</span>
                <Badge className={getStatusColor(company.status)}>{getStatusText(company.status)}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agent数量</span>
                <span className="text-sm font-medium">{company.agents}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">最近活动</span>
                <span className="text-sm font-medium">{company.lastActivity}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">营收</span>
                <span className="text-sm font-medium">¥{company.revenue.toLocaleString()}</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">当前项目进度</span>
                  <span className="font-medium">{company.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${company.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{company.currentProject}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">{company.tasks.completed}</p>
                  <p className="text-xs text-gray-600">已完成</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-600">{company.tasks.inProgress}</p>
                  <p className="text-xs text-gray-600">进行中</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600">{company.tasks.pending}</p>
                  <p className="text-xs text-gray-600">待处理</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewCompany(company)
                }}
              >
                查看详情
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredCompanies.length === 0 && (
        <motion.div
          className="card text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到公司</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或创建新的公司</p>
          <Button onClick={handleCreateCompany}>
            <Plus className="h-4 w-4 mr-2" />
            创建公司
          </Button>
        </motion.div>
      )}
    </div>
  )
}
