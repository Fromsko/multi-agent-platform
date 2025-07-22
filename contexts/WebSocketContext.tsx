"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"
import toast from "react-hot-toast"

interface WebSocketContextType {
  socket: Socket | null
  connected: boolean
  sendMessage: (event: string, data: any) => void
  onMessage: (event: string, callback: (data: any) => void) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // 连接WebSocket服务器
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000", {
        auth: {
          token: localStorage.getItem("token"),
          userId: user.id,
        },
      })

      newSocket.on("connect", () => {
        setConnected(true)
        console.log("WebSocket connected")
      })

      newSocket.on("disconnect", () => {
        setConnected(false)
        console.log("WebSocket disconnected")
      })

      newSocket.on("error", (error) => {
        console.error("WebSocket error:", error)
        toast.error("连接错误")
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
        newSocket.close()
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
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, connected, sendMessage, onMessage }}>
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
