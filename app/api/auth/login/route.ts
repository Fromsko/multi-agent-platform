import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Mock用户数据
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    username: "admin",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "user@example.com",
    username: "user",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    firstName: "Regular",
    lastName: "User",
    role: "user",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 查找用户
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "邮箱或密码错误",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      )
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "邮箱或密码错误",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      )
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions: [],
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

    // 返回用户信息和token
    const { password: _, ...userWithoutPassword } = user

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
    console.error("Login error:", error)
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
