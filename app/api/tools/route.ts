import { type NextRequest, NextResponse } from "next/server"
import type { Tool } from "@/lib/types"

// Mock Tool数据
const mockTools: Tool[] = [
  {
    id: "1",
    name: "代码生成器",
    description: "自动生成高质量的代码模板",
    type: "code_generator",
    status: "active",
    configuration: {
      language: "typescript",
      framework: "react",
      template: "component",
    },
    schema: {
      input: {
        type: "object",
        properties: {
          componentName: { type: "string" },
          props: { type: "array" },
        },
      },
      output: {
        type: "object",
        properties: {
          code: { type: "string" },
          tests: { type: "string" },
        },
      },
    },
    usage: {
      totalCalls: 245,
      successfulCalls: 238,
      failedCalls: 7,
      averageResponseTime: 850,
    },
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-20T12:30:00Z",
  },
  {
    id: "2",
    name: "API测试工具",
    description: "自动化API接口测试和验证",
    type: "api_tester",
    status: "active",
    configuration: {
      baseUrl: "https://api.example.com",
      timeout: 5000,
      retries: 3,
    },
    schema: {
      input: {
        type: "object",
        properties: {
          endpoint: { type: "string" },
          method: { type: "string" },
          headers: { type: "object" },
          body: { type: "object" },
        },
      },
      output: {
        type: "object",
        properties: {
          status: { type: "number" },
          response: { type: "object" },
          duration: { type: "number" },
        },
      },
    },
    usage: {
      totalCalls: 156,
      successfulCalls: 149,
      failedCalls: 7,
      averageResponseTime: 1200,
    },
    createdAt: "2024-01-12T10:15:00Z",
    updatedAt: "2024-01-19T15:20:00Z",
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

    let filteredTools = [...mockTools]

    // 搜索过滤
    if (search) {
      filteredTools = filteredTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(search.toLowerCase()) ||
          tool.description?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // 类型过滤
    if (type) {
      filteredTools = filteredTools.filter((tool) => tool.type === type)
    }

    // 状态过滤
    if (status) {
      filteredTools = filteredTools.filter((tool) => tool.status === status)
    }

    // 分页
    const total = filteredTools.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTools = filteredTools.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedTools,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get tools error:", error)
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
    const { name, description, type, configuration, schema } = data

    // 验证必填字段
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "工具名称和类型是必填的",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // 创建新工具
    const newTool: Tool = {
      id: Date.now().toString(),
      name,
      description,
      type,
      status: "active",
      configuration: configuration || {},
      schema: schema || {
        input: { type: "object", properties: {} },
        output: { type: "object", properties: {} },
      },
      usage: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 添加到mock数据
    mockTools.push(newTool)

    return NextResponse.json({
      success: true,
      data: newTool,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Create tool error:", error)
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
