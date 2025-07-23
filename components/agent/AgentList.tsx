'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Play,
  Square,
  Trash2,
  Download,
  Upload,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/services/types'
import { AgentCard, AgentCardSkeleton } from './AgentCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface AgentListProps {
  agents: Agent[]
  loading?: boolean
  selectedAgents?: string[]
  onSelectAgent?: (agentId: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onCreateAgent?: () => void
  onEditAgent?: (agent: Agent) => void
  onDeleteAgent?: (agent: Agent) => void
  onDuplicateAgent?: (agent: Agent) => void
  onStartAgent?: (agent: Agent) => void
  onStopAgent?: (agent: Agent) => void
  onViewAgent?: (agent: Agent) => void
  onBatchStart?: (agentIds: string[]) => void
  onBatchStop?: (agentIds: string[]) => void
  onBatchDelete?: (agentIds: string[]) => void
  onExport?: () => void
  onImport?: () => void
  onRefresh?: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  typeFilter?: string
  onTypeFilterChange?: (type: string) => void
  sortBy?: string
  onSortChange?: (sort: string) => void
  sortOrder?: 'asc' | 'desc'
  onSortOrderChange?: (order: 'asc' | 'desc') => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  className?: string
}

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'running', label: '运行中' },
  { value: 'stopped', label: '已停止' },
  { value: 'error', label: '错误' },
  { value: 'pending', label: '等待中' },
]

const typeOptions = [
  { value: 'all', label: '全部类型' },
  { value: 'chat', label: '对话助手' },
  { value: 'task', label: '任务执行' },
  { value: 'analysis', label: '数据分析' },
  { value: 'workflow', label: '工作流' },
  { value: 'custom', label: '自定义' },
]

const sortOptions = [
  { value: 'name', label: '名称' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'lastActivity', label: '最后活动' },
  { value: 'status', label: '状态' },
  { value: 'type', label: '类型' },
]

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  loading = false,
  selectedAgents = [],
  onSelectAgent,
  onSelectAll,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onDuplicateAgent,
  onStartAgent,
  onStopAgent,
  onViewAgent,
  onBatchStart,
  onBatchStop,
  onBatchDelete,
  onExport,
  onImport,
  onRefresh,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  typeFilter = 'all',
  onTypeFilterChange,
  sortBy = 'createdAt',
  onSortChange,
  sortOrder = 'desc',
  onSortOrderChange,
  viewMode = 'grid',
  onViewModeChange,
  className,
}) => {
  const [showFilters, setShowFilters] = useState(false)

  // 过滤和排序逻辑
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.configuration?.capabilities?.some(capability => 
          capability.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter)
    }

    // 类型过滤
    if (typeFilter !== 'all') {
      filtered = filtered.filter(agent => agent.type === typeFilter)
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'lastActivity':
          aValue = a.last_activity ? new Date(a.last_activity) : new Date(0)
          bValue = b.last_activity ? new Date(b.last_activity) : new Date(0)
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [agents, searchQuery, statusFilter, typeFilter, sortBy, sortOrder])

  // 统计信息
  const stats = useMemo(() => {
    const total = agents.length
    const running = agents.filter(a => a.status === 'active').length
    const stopped = agents.filter(a => a.status === 'idle').length
    const error = agents.filter(a => a.status === 'error').length
    const selected = selectedAgents.length

    return { total, running, stopped, error, selected }
  }, [agents, selectedAgents])

  const isAllSelected = selectedAgents.length === filteredAndSortedAgents.length && filteredAndSortedAgents.length > 0
  const isPartiallySelected = selectedAgents.length > 0 && selectedAgents.length < filteredAndSortedAgents.length

  const handleSelectAll = () => {
    onSelectAll?.(!isAllSelected)
  }

  const handleBatchAction = (action: 'start' | 'stop' | 'delete') => {
    if (selectedAgents.length === 0) return

    switch (action) {
      case 'start':
        onBatchStart?.(selectedAgents)
        break
      case 'stop':
        onBatchStop?.(selectedAgents)
        break
      case 'delete':
        onBatchDelete?.(selectedAgents)
        break
    }
  }

  const toggleSortOrder = () => {
    onSortOrderChange?.(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 头部工具栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Agent 管理</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{stats.total} 总计</Badge>
                <Badge variant="default">{stats.running} 运行中</Badge>
                <Badge variant="secondary">{stats.stopped} 已停止</Badge>
                {stats.error > 0 && (
                  <Badge variant="destructive">{stats.error} 错误</Badge>
                )}
                {stats.selected > 0 && (
                  <Badge variant="outline">{stats.selected} 已选择</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              
              {onImport && (
                <Button variant="outline" size="sm" onClick={onImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  导入
                </Button>
              )}
              
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
              )}
              
              {onCreateAgent && (
                <Button onClick={onCreateAgent}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建 Agent
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 搜索和过滤 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索 Agent 名称、描述或技能..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              过滤器
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange?.('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange?.('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 过滤器面板 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="状态过滤" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="类型过滤" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="排序字段" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={toggleSortOrder}>
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                {sortOrder === 'asc' ? '升序' : '降序'}
              </Button>
            </div>
          )}
          
          {/* 批量操作 */}
          {selectedAgents.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) (el as any).indeterminate = isPartiallySelected
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  已选择 {selectedAgents.length} 个 Agent
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchAction('start')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  批量启动
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchAction('stop')}
                >
                  <Square className="h-4 w-4 mr-2" />
                  批量停止
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchAction('delete')}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Agent 列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSortedAgents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">暂无 Agent</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? '没有找到符合条件的 Agent'
                    : '还没有创建任何 Agent'}
                </p>
                {onCreateAgent && (
                  <Button onClick={onCreateAgent} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一个 Agent
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          )}>
            {filteredAndSortedAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={selectedAgents.includes(agent.id)}
                onSelect={(selected) => onSelectAgent?.(agent.id, selected)}
                onStart={() => onStartAgent?.(agent)}
                onStop={() => onStopAgent?.(agent)}
                onEdit={() => onEditAgent?.(agent)}
                onDuplicate={() => onDuplicateAgent?.(agent)}
                onDelete={() => onDeleteAgent?.(agent)}
                onView={() => onViewAgent?.(agent)}
                showCheckbox={selectedAgents.length > 0 || filteredAndSortedAgents.length > 1}
                className={viewMode === 'list' ? 'w-full' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}