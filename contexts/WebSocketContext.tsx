"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"

interface WebSocketContextType {
  socket: Socket | null
  connected: boolean
  sendMessage: (event: string, data: any) => void
  onMessage: (event: string, callback: (data: any) => void) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // 连接WebSocket服务器
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      if (!wsUrl) {
        console.error("WebSocket URL not configured")
        return
      }

      // 确保URL格式正确
      const socketUrl = new URL(wsUrl)
      const newSocket = io(socketUrl.toString(), {
        auth: {
          token: localStorage.getItem("token"),
          userId: user.id,
        },
        transports: ["websocket"], // 强制使用WebSocket传输
        path: "/socket.io/", // 显式指定Socket.IO路径
        reconnection: true, // 启用重连
        reconnectionAttempts: 5, // 最大重连次数
        reconnectionDelay: 1000, // 重连延迟
      })

      newSocket.on("connect", () => {
        setConnected(true)
        console.log("WebSocket connected")
      })

      newSocket.on("disconnect", () => {
        setConnected(false)
        console.log("WebSocket disconnected")
      })

      newSocket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error)
        toast.error(`连接错误: ${error.message}`)
      })

      // 监听Agent状态更新
      newSocket.on("agent_status_update", (data) => {
        console.log("Agent status update:", data)
      })

      // 监听任务进度更新
      newSocket.on("task_progress", (data) => {
        console.log("Task progress:", data)
      })

      // 监听公司活动
      newSocket.on("company_activity", (data) => {
        console.log("Company activity:", data)
      })

      setSocket(newSocket)

      return () => {
        if (newSocket) {
          newSocket.removeAllListeners()
          newSocket.close()
        }
      }
    }
  }, [user])

  const sendMessage = (event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data)
    } else {
      console.warn("WebSocket not connected")
    }
  }

  const onMessage = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
      // 返回清理函数
      return () => socket.off(event, callback)
    }
  }

  return (
    <WebSocketContext.Provider
      value={{ socket, connected, sendMessage, onMessage }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
