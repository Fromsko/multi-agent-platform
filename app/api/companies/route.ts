import { type NextRequest, NextResponse } from "next/server"
import type { Company } from "@/lib/types"

// Mock公司数据
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "AI软件开发公司",
    description: "专注于AI驱动的软件开发解决方案",
    type: "software",
    industry: "technology",
    status: "active",
    ownerId: "1",
    agents: [],
    tools: [],
    settings: {
      autoStart: true,
      maxAgents: 5,
      maxTools: 10,
      maxConcurrency: 3,
      notifyOnCompletion: true,
      apiRateLimit: 100,
      memorySize: 4,
      visibility: "private",
      emailNotifications: true,
      smsNotifications: false,
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: "exponential",
        initialDelay: 1000,
      },
    },
    metrics: {
      totalTasks: 156,
      completedTasks: 142,
      failedTasks: 8,
      averageExecutionTime: 2340,
      successRate: 91.0,
      resourceUsage: {
        cpu: 45,
        memory: 62,
        storage: 23,
      },
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z",
  },
  {
    id: "2",
    name: "市场调研分析公司",
    description: "基于AI的市场调研和数据分析服务",
    type: "research",
    industry: "consulting",
    status: "idle",
    ownerId: "1",
    agents: [],
    tools: [],
    settings: {
      autoStart: false,
      maxAgents: 3,
      maxTools: 8,
      maxConcurrency: 2,
      notifyOnCompletion: true,
      apiRateLimit: 50,
      memorySize: 2,
      visibility: "team",
      emailNotifications: true,
      smsNotifications: true,
      retryPolicy: {
        maxRetries: 2,
        backoffStrategy: "linear",
        initialDelay: 500,
      },
    },
    metrics: {
      totalTasks: 89,
      completedTasks: 82,
      failedTasks: 3,
      averageExecutionTime: 1890,
      successRate: 92.1,
      resourceUsage: {
        cpu: 28,
        memory: 41,
        storage: 15,
      },
    },
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""

    let filteredCompanies = [...mockCompanies]

    // 搜索过滤
    if (search) {
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(search.toLowerCase()) ||
          company.description?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // 类型过滤
    if (type) {
      filteredCompanies = filteredCompanies.filter((company) => company.type === type)
    }

    // 状态过滤
    if (status) {
      filteredCompanies = filteredCompanies.filter((company) => company.status === status)
    }

    // 分页
    const total = filteredCompanies.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedCompanies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get companies error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "服务器内部错误",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, description, type, industry, settings } = data

    // 验证必填字段
    if (!name || !type || !industry) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "公司名称、类型和行业是必填的",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // 创建新公司
    const newCompany: Company = {
      id: Date.now().toString(),
      name,
      description,
      type,
      industry,
      status: "idle",
      ownerId: "1", // 从JWT token中获取
      agents: [],
      tools: [],
      settings: {
        autoStart: false,
        maxAgents: 5,
        maxTools: 10,
        maxConcurrency: 3,
        notifyOnCompletion: true,
        apiRateLimit: 100,
        memorySize: 4,
        visibility: "private",
        emailNotifications: true,
        smsNotifications: false,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: "exponential",
          initialDelay: 1000,
        },
        ...settings,
      },
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageExecutionTime: 0,
        successRate: 0,
        resourceUsage: {
          cpu: 0,
          memory: 0,
          storage: 0,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 添加到mock数据
    mockCompanies.push(newCompany)

    return NextResponse.json({
      success: true,
      data: newCompany,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Create company error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "服务器内部错误",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
