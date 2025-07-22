import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { WebSocketProvider } from "@/contexts/WebSocketContext"
import { Toaster } from "react-hot-toast"
import { WebSocketManager } from "@/components/common/WebSocketManager"
import { QueueManager } from "@/components/common/QueueManager"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Multi-Agent Platform",
  description: "AI-powered multi-agent collaboration platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <WebSocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#4ade80",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
            <WebSocketManager />
            <QueueManager />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
