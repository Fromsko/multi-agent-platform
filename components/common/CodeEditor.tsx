"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Copy, Download, Eye, Code, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface CodeEditorProps {
  defaultValue?: string
  language?: "html" | "css" | "javascript" | "typescript" | "markdown"
  theme?: "light" | "dark"
  onChange?: (value: string) => void
  onRun?: (code: string) => void
  readOnly?: boolean
  showPreview?: boolean
  showLineNumbers?: boolean
  className?: string
}

export function CodeEditor({
  defaultValue = "",
  language = "html",
  theme = "light",
  onChange,
  onRun,
  readOnly = false,
  showPreview = true,
  showLineNumbers = true,
  className = "",
}: CodeEditorProps) {
  const [code, setCode] = useState(defaultValue)
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState("14")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (onChange) {
      onChange(code)
    }
  }, [code, onChange])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("代码已复制到剪贴板")
    } catch (error) {
      toast.error("复制失败")
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${language}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("文件已下载")
  }

  const handleRun = () => {
    if (onRun) {
      onRun(code)
    }
    updatePreview()
  }

  const updatePreview = () => {
    if (!previewRef.current) return

    let previewContent = ""

    if (language === "html") {
      previewContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body>
          ${code}
        </body>
        </html>
      `
    } else if (language === "markdown") {
      // 简单的 Markdown 渲染
      const htmlContent = code
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2">$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
        .replace(/\n\n/gim, '</p><p class="mb-4">')
        .replace(/\n/gim, "<br>")

      previewContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Markdown Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-6 max-w-4xl mx-auto">
          <div class="prose prose-lg max-w-none">
            <p class="mb-4">${htmlContent}</p>
          </div>
        </body>
        </html>
      `
    }

    const blob = new Blob([previewContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    previewRef.current.src = url
  }

  useEffect(() => {
    if (showPreview && (language === "html" || language === "markdown")) {
      updatePreview()
    }
  }, [code, language, showPreview])

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case "html":
        return "bg-orange-100 text-orange-800"
      case "css":
        return "bg-blue-100 text-blue-800"
      case "javascript":
        return "bg-yellow-100 text-yellow-800"
      case "typescript":
        return "bg-blue-100 text-blue-800"
      case "markdown":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      className={`
        ${isFullscreen ? "fixed inset-0 z-50 bg-white" : ""}
        ${className}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
        {/* 工具栏 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Badge className={getLanguageColor(language)}>{language.toUpperCase()}</Badge>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            {(language === "html" || language === "markdown") && onRun && (
              <Button size="sm" onClick={handleRun}>
                <Play className="h-4 w-4 mr-1" />
                运行
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* 编辑器内容 */}
        <div className="flex-1 flex flex-col">
          {showPreview && (language === "html" || language === "markdown") ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as any)}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor" className="flex items-center">
                  <Code className="h-4 w-4 mr-2" />
                  编辑器
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  预览
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 m-0">
                <div className="h-full relative">
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={handleCodeChange}
                    readOnly={readOnly}
                    className={`
                      w-full h-full p-4 font-mono resize-none border-none outline-none
                      ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}
                    `}
                    style={{ fontSize: `${fontSize}px` }}
                    placeholder={`输入${language.toUpperCase()}代码...`}
                    spellCheck={false}
                  />
                  {showLineNumbers && (
                    <div className="absolute left-0 top-0 p-4 text-gray-400 text-sm font-mono pointer-events-none">
                      {code.split("\n").map((_, index) => (
                        <div key={index} style={{ height: `${Number.parseInt(fontSize) * 1.5}px` }}>
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0">
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-none"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                readOnly={readOnly}
                className={`
                  w-full h-full p-4 font-mono resize-none border-none outline-none
                  ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}
                  ${showLineNumbers ? "pl-12" : ""}
                `}
                style={{ fontSize: `${fontSize}px` }}
                placeholder={`输入${language.toUpperCase()}代码...`}
                spellCheck={false}
              />
              {showLineNumbers && (
                <div className="absolute left-0 top-0 p-4 text-gray-400 text-sm font-mono pointer-events-none">
                  {code.split("\n").map((_, index) => (
                    <div key={index} style={{ height: `${Number.parseInt(fontSize) * 1.5}px` }}>
                      {index + 1}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
