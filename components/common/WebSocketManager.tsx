"use client"

import { useEffect, useRef } from "react"
import { useAppStore } from "@/stores/useAppStore"

interface WebSocketManagerProps {
  url?: string
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function WebSocketManager({
  url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080",
  onMessage,
  onError,
  onConnect,
  onDisconnect,
}: WebSocketManagerProps) {
  const wsRef = useRef<WebSocket | null>(null)
  const { setWsConnected, addActivity, addLog, addPerformanceData } = useAppStore()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    try {
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        console.log("WebSocket connected")
        setWsConnected(true)
        reconnectAttempts.current = 0
        onConnect?.()

        // Add connection activity
        addActivity({
          type: "system",
          message: "WebSocket连接已建立",
          timestamp: new Date().toISOString(),
        })
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle different message types
          switch (data.type) {
            case "activity":
              addActivity(data.payload)
              break
            case "log":
              addLog(data.payload)
              break
            case "performance":
              addPerformanceData(data.payload)
              break
            default:
              onMessage?.(data)
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        onError?.(error)

        addActivity({
          type: "error",
          message: "WebSocket连接错误",
          timestamp: new Date().toISOString(),
        })
      }

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected")
        setWsConnected(false)
        onDisconnect?.()

        addActivity({
          type: "system",
          message: "WebSocket连接已断开",
          timestamp: new Date().toISOString(),
        })

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connect()
          }, delay)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket is not connected")
    }
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [url])

  // Expose methods to parent components
  useEffect(() => {
    ;(window as any).wsManager = {
      sendMessage,
      disconnect,
      reconnect: connect,
    }
  }, [])

  return null // This is a utility component, no UI
}
