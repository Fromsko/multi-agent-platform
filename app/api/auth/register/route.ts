import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, firstName, lastName } = await request.json()

    // 验证必填字段
    if (!email || !username || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "所有字段都是必填的",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_EMAIL",
            message: "邮箱格式不正确",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // 检查密码强度
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WEAK_PASSWORD",
            message: "密码至少需要6个字符",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role: "user" as const,
      status: "active" as const,
      avatar: "/placeholder.svg?height=40&width=40",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        permissions: [],
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    const refreshToken = jwt.sign({ sub: newUser.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

    // 返回用户信息和token
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Register error:", error)
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
