"use client"

import { useState, useEffect, useRef } from "react"
import { useAppStore } from "@/stores/useAppStore"

interface QueueTask {
  id: string
  type: string
  payload: any
  priority: number
  retries: number
  maxRetries: number
  createdAt: Date
  status: "pending" | "processing" | "completed" | "failed"
}

interface QueueManagerProps {
  maxConcurrent?: number
  retryDelay?: number
  onTaskComplete?: (task: QueueTask) => void
  onTaskFailed?: (task: QueueTask) => void
}

export function QueueManager({
  maxConcurrent = 3,
  retryDelay = 1000,
  onTaskComplete,
  onTaskFailed,
}: QueueManagerProps) {
  const [queue, setQueue] = useState<QueueTask[]>([])
  const [processing, setProcessing] = useState<QueueTask[]>([])
  const { addActivity } = useAppStore()
  const processingRef = useRef<Set<string>>(new Set())

  const addTask = (type: string, payload: any, priority = 0, maxRetries = 3) => {
    const task: QueueTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      payload,
      priority,
      retries: 0,
      maxRetries,
      createdAt: new Date(),
      status: "pending",
    }

    setQueue((prev) => [...prev, task].sort((a, b) => b.priority - a.priority))

    addActivity({
      type: "system",
      message: `任务已添加到队列: ${type}`,
      timestamp: new Date().toISOString(),
      metadata: { taskId: task.id },
    })

    return task.id
  }

  const processTask = async (task: QueueTask) => {
    if (processingRef.current.has(task.id)) {
      return
    }

    processingRef.current.add(task.id)

    setQueue((prev) => prev.filter((t) => t.id !== task.id))
    setProcessing((prev) => [...prev, { ...task, status: "processing" }])

    try {
      // Simulate task processing based on type
      await simulateTaskProcessing(task)

      // Task completed successfully
      setProcessing((prev) => prev.filter((t) => t.id !== task.id))
      processingRef.current.delete(task.id)

      addActivity({
        type: "success",
        message: `任务完成: ${task.type}`,
        timestamp: new Date().toISOString(),
        metadata: { taskId: task.id },
      })

      onTaskComplete?.(task)
    } catch (error) {
      // Task failed
      task.retries++

      if (task.retries < task.maxRetries) {
        // Retry the task
        setTimeout(() => {
          setQueue((prev) => [...prev, { ...task, status: "pending" }].sort((a, b) => b.priority - a.priority))
          setProcessing((prev) => prev.filter((t) => t.id !== task.id))
          processingRef.current.delete(task.id)

          addActivity({
            type: "warning",
            message: `任务重试: ${task.type} (${task.retries}/${task.maxRetries})`,
            timestamp: new Date().toISOString(),
            metadata: { taskId: task.id, error: error instanceof Error ? error.message : "Unknown error" },
          })
        }, retryDelay * task.retries)
      } else {
        // Task failed permanently
        setProcessing((prev) => prev.filter((t) => t.id !== task.id))
        processingRef.current.delete(task.id)

        addActivity({
          type: "error",
          message: `任务失败: ${task.type}`,
          timestamp: new Date().toISOString(),
          metadata: { taskId: task.id, error: error instanceof Error ? error.message : "Unknown error" },
        })

        onTaskFailed?.(task)
      }
    }
  }

  const simulateTaskProcessing = async (task: QueueTask): Promise<void> => {
    const { type, payload } = task

    switch (type) {
      case "agent_create":
        await new Promise((resolve) => setTimeout(resolve, 2000))
        break
      case "agent_update":
        await new Promise((resolve) => setTimeout(resolve, 1500))
        break
      case "company_create":
        await new Promise((resolve) => setTimeout(resolve, 3000))
        break
      case "prompt_optimize":
        await new Promise((resolve) => setTimeout(resolve, 5000))
        break
      case "log_analysis":
        await new Promise((resolve) => setTimeout(resolve, 4000))
        break
      default:
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Simulate random failures for testing
    if (Math.random() < 0.1) {
      throw new Error(`Simulated failure for task ${type}`)
    }
  }

  // Process queue
  useEffect(() => {
    const interval = setInterval(() => {
      if (queue.length > 0 && processing.length < maxConcurrent) {
        const nextTask = queue[0]
        if (nextTask && !processingRef.current.has(nextTask.id)) {
          processTask(nextTask)
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [queue, processing, maxConcurrent])

  // Expose methods to parent components
  useEffect(() => {
    ;(window as any).queueManager = {
      addTask,
      getQueue: () => queue,
      getProcessing: () => processing,
      getStats: () => ({
        pending: queue.length,
        processing: processing.length,
        total: queue.length + processing.length,
      }),
    }
  }, [queue, processing])

  return null // This is a utility component, no UI
}
