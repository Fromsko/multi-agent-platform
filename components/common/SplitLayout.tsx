"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { GripVertical, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SplitLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  defaultSplit?: number // 0-100, 默认50
  minLeftWidth?: number // 最小左侧宽度百分比
  minRightWidth?: number // 最小右侧宽度百分比
  resizable?: boolean
  className?: string
}

export function SplitLayout({
  leftPanel,
  rightPanel,
  defaultSplit = 50,
  minLeftWidth = 20,
  minRightWidth = 20,
  resizable = true,
  className = "",
}: SplitLayoutProps) {
  const [splitPosition, setSplitPosition] = useState(defaultSplit)
  const [isDragging, setIsDragging] = useState(false)
  const [isLeftMaximized, setIsLeftMaximized] = useState(false)
  const [isRightMaximized, setIsRightMaximized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100

      // 限制在最小宽度范围内
      const clampedPosition = Math.max(minLeftWidth, Math.min(100 - minRightWidth, newPosition))

      setSplitPosition(clampedPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, minLeftWidth, minRightWidth])

  const handleMouseDown = () => {
    if (resizable) {
      setIsDragging(true)
    }
  }

  const toggleLeftMaximize = () => {
    if (isLeftMaximized) {
      setSplitPosition(defaultSplit)
      setIsLeftMaximized(false)
    } else {
      setSplitPosition(95)
      setIsLeftMaximized(true)
      setIsRightMaximized(false)
    }
  }

  const toggleRightMaximize = () => {
    if (isRightMaximized) {
      setSplitPosition(defaultSplit)
      setIsRightMaximized(false)
    } else {
      setSplitPosition(5)
      setIsRightMaximized(true)
      setIsLeftMaximized(false)
    }
  }

  const leftWidth = isRightMaximized ? 5 : isLeftMaximized ? 95 : splitPosition
  const rightWidth = 100 - leftWidth

  return (
    <div ref={containerRef} className={`flex h-full relative ${className}`}>
      {/* 左侧面板 */}
      <motion.div
        className="relative bg-white border-r border-gray-200 overflow-hidden"
        style={{ width: `${leftWidth}%` }}
        animate={{ width: `${leftWidth}%` }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* 左侧面板控制按钮 */}
        <div className="absolute top-2 right-2 z-10">
          <Button variant="ghost" size="sm" onClick={toggleLeftMaximize} className="h-6 w-6 p-0">
            {isLeftMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>

        <div className="h-full overflow-auto">{leftPanel}</div>
      </motion.div>

      {/* 分割线 */}
      {resizable && !isLeftMaximized && !isRightMaximized && (
        <div
          className={`
            w-1 bg-gray-200 cursor-col-resize hover:bg-primary-500 
            transition-colors duration-200 relative group
            ${isDragging ? "bg-primary-500" : ""}
          `}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
          </div>
        </div>
      )}

      {/* 右侧面板 */}
      <motion.div
        className="relative bg-gray-50 overflow-hidden"
        style={{ width: `${rightWidth}%` }}
        animate={{ width: `${rightWidth}%` }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* 右侧面板控制按钮 */}
        <div className="absolute top-2 left-2 z-10">
          <Button variant="ghost" size="sm" onClick={toggleRightMaximize} className="h-6 w-6 p-0">
            {isRightMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>

        <div className="h-full overflow-auto">{rightPanel}</div>
      </motion.div>
    </div>
  )
}
