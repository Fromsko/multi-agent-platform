import { type NextRequest, NextResponse } from "next/server"

// 这里应该从数据库获取，现在用mock数据
const mockCompanies = [
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
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const company = mockCompanies.find((c) => c.id === params.id)

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COMPANY_NOT_FOUND",
            message: "公司不存在",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: company,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get company error:", error)
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const companyIndex = mockCompanies.findIndex((c) => c.id === params.id)

    if (companyIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COMPANY_NOT_FOUND",
            message: "公司不存在",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // 更新公司信息
    mockCompanies[companyIndex] = {
      ...mockCompanies[companyIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: mockCompanies[companyIndex],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Update company error:", error)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyIndex = mockCompanies.findIndex((c) => c.id === params.id)

    if (companyIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COMPANY_NOT_FOUND",
            message: "公司不存在",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // 删除公司
    mockCompanies.splice(companyIndex, 1)

    return NextResponse.json({
      success: true,
      data: { message: "公司已删除" },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Delete company error:", error)
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
