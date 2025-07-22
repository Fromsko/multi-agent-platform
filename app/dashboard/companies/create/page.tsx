"use client"

import { CompanyWizard } from "@/components/common/CompanyWizard"
import { mockDataStore } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function CreateCompanyPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleComplete = async (companyData: any) => {
    setIsCreating(true)

    try {
      // 创建新公司
      const newCompany = {
        id: `company-${Date.now()}`,
        name: companyData.name,
        description: companyData.description,
        type: companyData.type,
        industry: companyData.industry,
        status: companyData.settings.autoStart ? "active" : "idle",
        agents: companyData.agents.length,
        lastActivity: "刚刚",
        revenue: 0,
        progress: 0,
        currentProject: "初始化中...",
        tasks: {
          completed: 0,
          inProgress: 0,
          pending: 1,
        },
        createdAt: new Date().toISOString(),
        agentDetails: companyData.agents,
        workflow: companyData.workflow,
        settings: companyData.settings,
      }

      // 保存到mock数据
      const companies = mockDataStore.getCompanies()
      companies.push({
        ...newCompany,
        status: newCompany.status as "active" | "idle" | "maintenance",
      })

      toast.success("公司创建成功！")

      // 如果设置了自动启动，跳转到公司详情页
      if (companyData.settings.autoStart) {
        router.push(`/dashboard/companies/${newCompany.id}`)
      } else {
        router.push("/dashboard/companies")
      }
    } catch (error) {
      toast.error("创建公司失败，请重试")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/companies")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyWizard onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  )
}
