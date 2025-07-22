import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 模拟实时统计数据
    const stats = {
      totalCompanies: Math.floor(Math.random() * 5) + 8,
      totalAgents: Math.floor(Math.random() * 10) + 25,
      activeProjects: Math.floor(Math.random() * 3) + 12,
      completedTasks: Math.floor(Math.random() * 20) + 180,
      todayTasks: Math.floor(Math.random() * 15) + 45,
      weeklyGrowth: {
        companies: Math.floor(Math.random() * 3) + 1,
        agents: Math.floor(Math.random() * 5) + 2,
        projects: Math.floor(Math.random() * 2) + 1,
        tasks: Math.floor(Math.random() * 25) + 15,
      },
    }

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
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
