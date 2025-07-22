"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw, Loader2, Paperclip, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

export interface Message {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  status?: "sending" | "sent" | "error"
  metadata?: {
    model?: string
    tokens?: number
    cost?: number
  }
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string, attachments?: File[]) => void
  onRegenerateResponse?: (messageId: string) => void
  onRateMessage?: (messageId: string, rating: "up" | "down") => void
  loading?: boolean
  placeholder?: string
  showAttachments?: boolean
  showVoiceInput?: boolean
  maxLength?: number
  className?: string
}

export function ChatInterface({
  messages,
  onSendMessage,
  onRegenerateResponse,
  onRateMessage,
  loading = false,
  placeholder = "输入消息...",
  showAttachments = false,
  showVoiceInput = false,
  maxLength = 2000,
  className = "",
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return

    onSendMessage(input.trim(), attachments)
    setInput("")
    setAttachments([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("消息已复制")
    } catch (error) {
      toast.error("复制失败")
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />
      case "assistant":
        return <Bot className="h-4 w-4" />
      case "system":
        return <Bot className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getMessageBgColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-primary-500 text-white"
      case "assistant":
        return "bg-gray-100 text-gray-900"
      case "system":
        return "bg-yellow-100 text-yellow-900"
      default:
        return "bg-gray-100 text-gray-900"
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"} gap-3`}>
                {/* 头像 */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={getMessageBgColor(message.type)}>
                    {getMessageIcon(message.type)}
                  </AvatarFallback>
                </Avatar>

                {/* 消息内容 */}
                <div className="flex flex-col space-y-1">
                  <div
                    className={`
                      px-4 py-2 rounded-lg relative group
                      ${
                        message.type === "user"
                          ? "bg-primary-500 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }
                    `}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>

                    {/* 消息状态 */}
                    {message.status === "sending" && (
                      <div className="absolute -bottom-6 right-0">
                        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                      </div>
                    )}

                    {message.status === "error" && (
                      <div className="absolute -bottom-6 right-0">
                        <Badge variant="destructive" className="text-xs">
                          发送失败
                        </Badge>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div
                      className={`
                      absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity
                      ${message.type === "user" ? "-left-20" : "-right-20"}
                      flex space-x-1
                    `}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>

                      {message.type === "assistant" && onRegenerateResponse && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onRegenerateResponse(message.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}

                      {message.type === "assistant" && onRateMessage && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onRateMessage(message.id, "up")}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onRateMessage(message.id, "down")}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 时间戳和元数据 */}
                  <div className={`text-xs text-gray-500 ${message.type === "user" ? "text-right" : "text-left"}`}>
                    {formatTimestamp(message.timestamp)}
                    {message.metadata && (
                      <span className="ml-2">
                        {message.metadata.model && (
                          <Badge variant="outline" className="text-xs mr-1">
                            {message.metadata.model}
                          </Badge>
                        )}
                        {message.metadata.tokens && (
                          <span className="text-gray-400">{message.metadata.tokens} tokens</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 加载指示器 */}
        {loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-100">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 p-4">
        {/* 附件预览 */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {file.name}
                <button onClick={() => removeAttachment(index)} className="ml-1 text-gray-500 hover:text-gray-700">
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-2">
          {/* 附件按钮 */}
          {showAttachments && (
            <>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
            </>
          )}

          {/* 语音输入按钮 */}
          {showVoiceInput && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              disabled={loading}
              className={isRecording ? "bg-red-100 text-red-600" : ""}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}

          {/* 输入框 */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={loading}
              maxLength={maxLength}
              className="min-h-[40px] max-h-32 resize-none pr-12"
              rows={1}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {input.length}/{maxLength}
            </div>
          </div>

          {/* 发送按钮 */}
          <Button onClick={handleSend} disabled={loading || (!input.trim() && attachments.length === 0)} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
