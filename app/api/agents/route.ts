import { type NextRequest, NextResponse } from "next/server"
import type { Agent } from "@/lib/types"

// Mock Agent数据
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "产品经理AI",
    description: "负责产品需求分析和项目规划",
    type: "manager",
    model: "gpt-4",
    status: "active",
    companyId: "1",
    capabilities: ["需求分析", "项目规划", "团队协调"],
    configuration: {
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: "你是一个专业的产品经理，负责分析需求和制定项目计划。",
    },
    performance: {
      tasksCompleted: 45,
      successRate: 92.5,
      averageResponseTime: 1200,
      lastActive: "2024-01-20T10:30:00Z",
    },
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "2",
    name: "前端开发AI",
    description: "专注于React和TypeScript开发",
    type: "developer",
    model: "gpt-4",
    status: "active",
    companyId: "1",
    capabilities: ["React开发", "TypeScript", "UI/UX设计"],
    configuration: {
      temperature: 0.3,
      maxTokens: 3000,
      systemPrompt: "你是一个专业的前端开发工程师，精通React和TypeScript。",
    },
    performance: {
      tasksCompleted: 78,
      successRate: 95.2,
      averageResponseTime: 800,
      lastActive: "2024-01-20T11:15:00Z",
    },
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-20T11:15:00Z",
  },
  {
    id: "3",
    name: "数据分析AI",
    description: "专业的数据分析和可视化专家",
    type: "analyst",
    model: "gpt-4",
    status: "idle",
    companyId: "2",
    capabilities: ["数据分析", "统计建模", "可视化"],
    configuration: {
      temperature: 0.2,
      maxTokens: 2500,
      systemPrompt: "你是一个专业的数据分析师，擅长统计分析和数据可视化。",
    },
    performance: {
      tasksCompleted: 32,
      successRate: 88.7,
      averageResponseTime: 1500,
      lastActive: "2024-01-19T16:45:00Z",
    },
    createdAt: "2024-01-12T11:30:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
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
    const companyId = searchParams.get("companyId") || ""

    let filteredAgents = [...mockAgents]

    // 搜索过滤
    if (search) {
      filteredAgents = filteredAgents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(search.toLowerCase()) ||
          agent.description?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // 类型过滤
    if (type) {
      filteredAgents = filteredAgents.filter((agent) => agent.type === type)
    }

    // 状态过滤
    if (status) {
      filteredAgents = filteredAgents.filter((agent) => agent.status === status)
    }

    // 公司过滤
    if (companyId) {
      filteredAgents = filteredAgents.filter((agent) => agent.companyId === companyId)
    }

    // 分页
    const total = filteredAgents.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedAgents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get agents error:", error)
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
    const { name, description, type, model, capabilities, configuration, companyId } = data

    // 验证必填字段
    if (!name || !type || !model || !companyId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Agent名称、类型、模型和公司ID是必填的",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // 创建新Agent
    const newAgent: Agent = {
      id: Date.now().toString(),
      name,
      description,
      type,
      model,
      status: "idle",
      companyId,
      capabilities: capabilities || [],
      configuration: {
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: "",
        ...configuration,
      },
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        lastActive: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 添加到mock数据
    mockAgents.push(newAgent)

    return NextResponse.json({
      success: true,
      data: newAgent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Create agent error:", error)
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
