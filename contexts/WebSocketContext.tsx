"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"
import { useAppStore } from "@/stores/useAppStore"

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
  const { addActivity, addLog, addPerformanceData } = useAppStore()

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
          token: typeof window !== 'undefined' ? localStorage.getItem("token") : null,
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
        // 添加连接成功日志
        addLog({
          type: "system",
          status: "success",
          agentId: "",
          agentName: "",
          duration: 0,
          tokens: { input: 0, output: 0 },
          cost: 0,
          request: { event: "connect" },
          response: { message: "WebSocket连接成功" },
          timestamp: new Date().toISOString(),
        })
      })

      newSocket.on("disconnect", () => {
        setConnected(false)
        console.log("WebSocket disconnected")
        // 添加断开连接日志
        addLog({
          type: "system",
          status: "warning",
          agentId: "",
          agentName: "",
          duration: 0,
          tokens: { input: 0, output: 0 },
          cost: 0,
          request: { event: "disconnect" },
          response: { message: "WebSocket断开连接" },
          timestamp: new Date().toISOString(),
        })
      })

      newSocket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error)
        // 添加更详细的错误日志
        addLog({
          type: "system",
          status: "error",
          agentId: "",
          agentName: "",
          duration: 0,
          tokens: { input: 0, output: 0 },
          cost: 0,
          request: { event: "connect_error" },
          response: { message: `WebSocket连接错误: ${error.message}` },
          error: { code: "CONNECTION_ERROR", message: error.message },
          timestamp: new Date().toISOString(),
        })
        toast.error(`WebSocket连接错误: ${error.message}`)
      })

      // 监听Agent状态更新
      newSocket.on("agent_status_update", (data) => {
        console.log("Agent status update:", data)
        addLog({
          type: "agent",
          status: "success",
          agentId: data.agentId || "",
          agentName: data.agentName || "",
          duration: 0,
          tokens: { input: 0, output: 0 },
          cost: 0,
          request: { event: "agent_status_update" },
          response: { status: data.status },
          timestamp: new Date().toISOString(),
        })
      })

      // 监听任务进度更新
      newSocket.on("task_progress", (data) => {
        console.log("Task progress:", data)
        addLog({
          type: "task",
          status: "success",
          agentId: data.agentId || "",
          agentName: data.agentName || "",
          duration: 0,
          tokens: { input: 0, output: 0 },
          cost: 0,
          request: { event: "task_progress", taskId: data.taskId },
          response: { progress: data.progress },
          timestamp: new Date().toISOString(),
        })
        
        // 添加性能数据
        addPerformanceData({
          timestamp: new Date().toISOString(),
          tasks: data.tasks || 0,
          efficiency: data.progress || 0,
          responseTime: data.responseTime || 0,
          errorRate: data.errorRate || 0,
          activeAgents: data.activeAgents || 0,
        })
      })

      // 监听公司活动
      newSocket.on("company_activity", (data) => {
        console.log("Company activity:", data)
        addActivity({
          type: data.type,
          message: data.description || "",
          timestamp: new Date().toISOString(),
          companyId: data.companyId,
          companyName: data.companyName,
          agentId: data.agentId,
          agentName: data.agentName,
          metadata: data.metadata,
        })
      })
      
      // 监听性能数据
      newSocket.on("performance_data", (data) => {
        console.log("Performance data:", data)
        addPerformanceData({
          timestamp: new Date().toISOString(),
          tasks: data.tasks || 0,
          efficiency: data.efficiency || 0,
          responseTime: data.responseTime || 0,
          errorRate: data.errorRate || 0,
          activeAgents: data.activeAgents || 0,
        })
      })
      
      // 监听系统日志
      newSocket.on("system_log", (data) => {
        console.log("System log:", data)
        addLog({
          type: data.type || "system",
          status: data.status || "success",
          agentId: data.agentId || "",
          agentName: data.agentName || "",
          duration: data.duration || 0,
          tokens: data.tokens || { input: 0, output: 0 },
          cost: data.cost || 0,
          request: data.request || {},
          response: { message: data.message },
          error: data.error,
          timestamp: new Date().toISOString(),
        })
      })

      setSocket(newSocket)

      return () => {
        if (newSocket) {
          newSocket.removeAllListeners()
          newSocket.close()
        }
      }
    }
  }, [user, addActivity, addLog, addPerformanceData])

  const sendMessage = (event: string, data: any) => {
    if (socket && connected) {
      try {
        socket.emit(event, data)
        // 可以选择记录发送的消息
        console.debug(`WebSocket message sent: ${event}`, data)
      } catch (error) {
        console.error(`WebSocket message send error: ${event}`, error)
        // 记录发送消息失败的日志
        addLog({
          type: "system",
          status: "error",
          agentId: "",
          agentName: "",
          duration: 0,
          tokens: { input: 0, output: 0 },
          cost: 0,
          request: { event },
          response: {},
          error: { 
            code: "SEND_ERROR", 
            message: `WebSocket消息发送失败: ${error instanceof Error ? error.message : String(error)}` 
          },
          timestamp: new Date().toISOString(),
        })
        toast.error(`消息发送失败: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      console.warn("WebSocket not connected")
      // 记录未连接时尝试发送消息的日志
      addLog({
        type: "system",
        status: "warning",
        agentId: "",
        agentName: "",
        duration: 0,
        tokens: { input: 0, output: 0 },
        cost: 0,
        request: { event },
        response: {},
        error: { 
          code: "NOT_CONNECTED", 
          message: `尝试在未连接状态发送WebSocket消息: ${event}` 
        },
        timestamp: new Date().toISOString(),
      })
    }
  }

  const onMessage = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
      // 返回清理函数
      return () => socket.off(event, callback)
    }
    // 如果 socket 为 null，返回一个空函数
    return () => {}
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
