'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Play,
  Square,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/services/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface AgentCardProps {
  agent: Agent
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onStart?: () => void
  onStop?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onView?: () => void
  className?: string
  showCheckbox?: boolean
}

const statusConfig = {
  running: {
    label: '运行中',
    color: 'bg-green-500',
    variant: 'default' as const,
    icon: Activity,
  },
  stopped: {
    label: '已停止',
    color: 'bg-gray-500',
    variant: 'secondary' as const,
    icon: Square,
  },
  error: {
    label: '错误',
    color: 'bg-red-500',
    variant: 'destructive' as const,
    icon: Activity,
  },
  pending: {
    label: '等待中',
    color: 'bg-yellow-500',
    variant: 'outline' as const,
    icon: Clock,
  },
}

const typeConfig = {
  chat: { label: '对话助手', color: 'bg-blue-100 text-blue-800' },
  task: { label: '任务执行', color: 'bg-green-100 text-green-800' },
  analysis: { label: '数据分析', color: 'bg-purple-100 text-purple-800' },
  workflow: { label: '工作流', color: 'bg-orange-100 text-orange-800' },
  custom: { label: '自定义', color: 'bg-gray-100 text-gray-800' },
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  selected = false,
  onSelect,
  onStart,
  onStop,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  className,
  showCheckbox = false,
}) => {
  const status = statusConfig[agent.status] || statusConfig.stopped
  const type = typeConfig[agent.type as keyof typeof typeConfig] || typeConfig.custom
  const StatusIcon = status.icon

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStart?.()
  }

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStop?.()
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.()
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  const handleView = () => {
    onView?.()
  }

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(checked)
  }

  return (
    <Card
      className={cn(
        'group relative cursor-pointer transition-all duration-200 hover:shadow-md',
        selected && 'ring-2 ring-primary',
        className
      )}
      onClick={handleView}
    >
      {showCheckbox && (
        <div className="absolute left-3 top-3 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <CardHeader className={cn('pb-3', showCheckbox && 'pl-10')}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>
                {agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {agent.description || '暂无描述'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={status.variant} className="text-xs">
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  查看详情
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  复制
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {agent.status === 'running' ? (
                  <DropdownMenuItem onClick={handleStop}>
                    <Square className="mr-2 h-4 w-4" />
                    停止
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleStart}>
                    <Play className="mr-2 h-4 w-4" />
                    启动
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 类型和模型 */}
          <div className="flex items-center justify-between text-xs">
            <span className={cn('px-2 py-1 rounded-full', type.color)}>
              {type.label}
            </span>
            <span className="text-muted-foreground">
              {agent.configuration?.model || 'GPT-4'}
            </span>
          </div>

          {/* 性能指标 */}
          {agent.performance && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">
                  {agent.performance.totalInteractions || 0}
                </div>
                <div className="text-muted-foreground">交互次数</div>
              </div>
              <div className="text-center">
                <div className="font-medium flex items-center justify-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {Math.round((agent.performance.successRate || 0) * 100)}%
                </div>
                <div className="text-muted-foreground">成功率</div>
              </div>
              <div className="text-center">
                <div className="font-medium">
                  {agent.performance.avgResponseTime || 0}ms
                </div>
                <div className="text-muted-foreground">响应时间</div>
              </div>
            </div>
          )}

          {/* 最后活动时间 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>最后活动:</span>
            <span>
              {agent.lastActivity
                ? formatDistanceToNow(new Date(agent.lastActivity), {
                    addSuffix: true,
                    locale: zhCN,
                  })
                : '从未活动'}
            </span>
          </div>

          {/* 技能标签 */}
          {agent.configuration?.skills && agent.configuration.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.configuration.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {skill}
                </Badge>
              ))}
              {agent.configuration.skills.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{agent.configuration.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Agent卡片骨架屏
export const AgentCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-4 w-12 bg-muted rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-4 w-8 bg-muted rounded mx-auto" />
                <div className="h-3 w-12 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-5 w-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}