import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 生成过去24小时的性能数据
    const now = new Date()
    const performance = []

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      performance.push({
        timestamp: timestamp.toISOString(),
        tasks: Math.floor(Math.random() * 30) + 10,
        efficiency: Math.floor(Math.random() * 15) + 85,
        responseTime: Math.random() * 1.5 + 0.5,
        errorRate: Math.random() * 3,
        activeAgents: Math.floor(Math.random() * 8) + 5,
      })
    }

    return NextResponse.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get performance data error:", error)
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
