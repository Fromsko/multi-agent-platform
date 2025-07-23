'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  className?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 可以在这里发送错误到监控服务
    // reportError(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <div className={cn('flex items-center justify-center min-h-[400px] p-4', this.props.className)}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">出现了一些问题</CardTitle>
              <CardDescription>
                抱歉，页面遇到了意外错误。请尝试刷新页面或返回首页。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="rounded border p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-destructive">
                    错误详情 (开发模式)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>错误信息:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error.message}
                      </pre>
                    </div>
                    <div>
                      <strong>错误堆栈:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>组件堆栈:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重试
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  返回首页
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// 简单的错误显示组件
export const ErrorDisplay: React.FC<{
  error: string | Error
  onRetry?: () => void
  className?: string
}> = ({ error, onRetry, className }) => {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">出现错误</h3>
      <p className="mb-4 text-sm text-muted-foreground">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          重试
        </Button>
      )}
    </div>
  )
}

// 网络错误组件
export const NetworkError: React.FC<{
  onRetry?: () => void
  className?: string
}> = ({ onRetry, className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">网络连接错误</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        无法连接到服务器，请检查您的网络连接。
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          重试
        </Button>
      )}
    </div>
  )
}

// 404错误组件
export const NotFoundError: React.FC<{
  title?: string
  description?: string
  onGoBack?: () => void
  className?: string
}> = ({ 
  title = '页面未找到',
  description = '抱歉，您访问的页面不存在。',
  onGoBack,
  className 
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className="mb-4 text-6xl font-bold text-muted-foreground">404</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <Button 
        onClick={onGoBack || (() => window.history.back())} 
        variant="outline" 
        size="sm"
      >
        <Home className="mr-2 h-4 w-4" />
        返回
      </Button>
    </div>
  )
}

// 权限错误组件
export const PermissionError: React.FC<{
  onGoBack?: () => void
  className?: string
}> = ({ onGoBack, className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">权限不足</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        您没有权限访问此页面，请联系管理员。
      </p>
      <Button 
        onClick={onGoBack || (() => window.history.back())} 
        variant="outline" 
        size="sm"
      >
        <Home className="mr-2 h-4 w-4" />
        返回
      </Button>
    </div>
  )
}