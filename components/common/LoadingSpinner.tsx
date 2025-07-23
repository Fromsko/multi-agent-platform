import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'white'
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-muted-foreground',
  white: 'text-white',
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
  text,
}) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <svg
          className={cn(
            'animate-spin',
            sizeClasses[size],
            colorClasses[color]
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <span className={cn('text-sm', colorClasses[color])}>
            {text}
          </span>
        )}
      </div>
    </div>
  )
}

// 页面级加载组件
export const PageLoading: React.FC<{ text?: string }> = ({ text = '加载中...' }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// 按钮加载组件
export const ButtonLoading: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <LoadingSpinner
      size="sm"
      className={cn('mr-2', className)}
    />
  )
}

// 卡片加载组件
export const CardLoading: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <LoadingSpinner size="md" text="加载中..." />
    </div>
  )
}

// 表格加载组件
export const TableLoading: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// 骨架屏组件
export const SkeletonLoader: React.FC<{
  className?: string
  lines?: number
  avatar?: boolean
}> = ({ className, lines = 3, avatar = false }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {avatar && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 bg-muted rounded animate-pulse',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}