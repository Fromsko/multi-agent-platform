import { useEffect, useCallback } from 'react'
import { useAgentStore, useAgentSelectors } from '@/stores/agent.store'
import { useUIStore } from '@/stores/ui.store'
import type { CreateAgentRequest, UpdateAgentRequest } from '@/services/types'
import toast from 'react-hot-toast'

/**
 * Agent相关的hooks
 */

// 基础Agent hook
export const useAgent = () => {
  const agentStore = useAgentStore()
  const selectors = useAgentSelectors()
  const { setLoading } = useUIStore()
  
  return {
    // 状态
    agents: selectors.filteredAgents,
    currentAgent: agentStore.currentAgent,
    isLoading: agentStore.isLoading,
    error: agentStore.error,
    pagination: agentStore.pagination,
    selectedAgents: agentStore.selectedAgents,
    searchQuery: agentStore.searchQuery,
    filters: agentStore.filters,
    
    // 统计
    selectedCount: selectors.selectedCount,
    runningCount: selectors.runningCount,
    stoppedCount: selectors.stoppedCount,
    errorCount: selectors.errorCount,
    isAllSelected: selectors.isAllSelected,
    isPartiallySelected: selectors.isPartiallySelected,
    
    // 操作
    fetchAgents: agentStore.fetchAgents,
    fetchAgent: agentStore.fetchAgent,
    createAgent: agentStore.createAgent,
    updateAgent: agentStore.updateAgent,
    deleteAgent: agentStore.deleteAgent,
    deleteAgents: agentStore.deleteAgents,
    startAgent: agentStore.startAgent,
    stopAgent: agentStore.stopAgent,
    duplicateAgent: agentStore.duplicateAgent,
    batchOperation: agentStore.batchOperation,
    
    // 搜索和过滤
    setSearchQuery: agentStore.setSearchQuery,
    setFilters: agentStore.setFilters,
    
    // 选择
    setSelectedAgents: agentStore.setSelectedAgents,
    toggleAgentSelection: agentStore.toggleAgentSelection,
    selectAllAgents: agentStore.selectAllAgents,
    clearSelection: agentStore.clearSelection,
    
    // 其他
    clearError: agentStore.clearError,
    setCurrentAgent: agentStore.setCurrentAgent,
  }
}

// Agent列表hook
export const useAgentList = (options: {
  autoFetch?: boolean
  filters?: any
  searchQuery?: string
} = {}) => {
  const { autoFetch = true, filters, searchQuery } = options
  const {
    agents,
    isLoading,
    error,
    pagination,
    fetchAgents,
    setFilters,
    setSearchQuery,
  } = useAgent()
  
  // 初始化时获取数据
  useEffect(() => {
    if (autoFetch) {
      fetchAgents()
    }
  }, [autoFetch, fetchAgents])
  
  // 设置初始过滤器
  useEffect(() => {
    if (filters) {
      setFilters(filters)
    }
  }, [filters, setFilters])
  
  // 设置初始搜索查询
  useEffect(() => {
    if (searchQuery) {
      setSearchQuery(searchQuery)
    }
  }, [searchQuery, setSearchQuery])
  
  const refresh = useCallback(() => {
    fetchAgents()
  }, [fetchAgents])
  
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchAgents({ page: pagination.page + 1 })
    }
  }, [fetchAgents, pagination])
  
  return {
    agents,
    isLoading,
    error,
    pagination,
    refresh,
    loadMore,
    hasMore: pagination.page < pagination.totalPages,
  }
}

// Agent详情hook
export const useAgentDetail = (agentId: string | null) => {
  const { currentAgent, isLoading, error, fetchAgent, setCurrentAgent } = useAgent()
  
  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId)
    } else {
      setCurrentAgent(null)
    }
  }, [agentId, fetchAgent, setCurrentAgent])
  
  const refresh = useCallback(() => {
    if (agentId) {
      fetchAgent(agentId)
    }
  }, [agentId, fetchAgent])
  
  return {
    agent: currentAgent,
    isLoading,
    error,
    refresh,
  }
}

// Agent表单hook
export const useAgentForm = (options: {
  mode: 'create' | 'edit'
  agentId?: string
  onSuccess?: (agent: any) => void
  onError?: (error: string) => void
} = { mode: 'create' }) => {
  const { mode, agentId, onSuccess, onError } = options
  const { createAgent, updateAgent, fetchAgent, currentAgent, isLoading } = useAgent()
  const { setLoading } = useUIStore()
  
  // 编辑模式时获取Agent数据
  useEffect(() => {
    if (mode === 'edit' && agentId) {
      fetchAgent(agentId)
    }
  }, [mode, agentId, fetchAgent])
  
  const submit = async (data: CreateAgentRequest | UpdateAgentRequest) => {
    setLoading('agent-form', true)
    
    try {
      let success = false
      let result = null
      
      if (mode === 'create') {
        success = await createAgent(data as CreateAgentRequest)
      } else if (mode === 'edit' && agentId) {
        success = await updateAgent(agentId, data as UpdateAgentRequest)
        result = currentAgent
      }
      
      if (success) {
        onSuccess?.(result)
        return true
      } else {
        onError?.('操作失败')
        return false
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败'
      onError?.(message)
      return false
    } finally {
      setLoading('agent-form', false)
    }
  }
  
  return {
    submit,
    isLoading: isLoading || false,
    initialData: mode === 'edit' ? currentAgent : null,
  }
}

// Agent批量操作hook
export const useAgentBatch = () => {
  const {
    selectedAgents,
    selectedCount,
    isAllSelected,
    isPartiallySelected,
    selectAllAgents,
    clearSelection,
    toggleAgentSelection,
    batchOperation,
    deleteAgents,
  } = useAgent()
  
  const { setLoading } = useUIStore()
  
  const performBatchOperation = async (operation: string) => {
    if (selectedAgents.length === 0) {
      toast.error('请先选择要操作的Agent')
      return false
    }
    
    setLoading('batch-operation', true)
    
    try {
      let success = false
      
      switch (operation) {
        case 'delete':
          success = await deleteAgents(selectedAgents)
          break
        case 'start':
        case 'stop':
        case 'restart':
          success = await batchOperation(selectedAgents, operation)
          break
        default:
          success = await batchOperation(selectedAgents, operation)
      }
      
      if (success) {
        clearSelection()
      }
      
      return success
    } finally {
      setLoading('batch-operation', false)
    }
  }
  
  return {
    selectedAgents,
    selectedCount,
    isAllSelected,
    isPartiallySelected,
    selectAll: selectAllAgents,
    clearSelection,
    toggleSelection: toggleAgentSelection,
    performBatchOperation,
    canPerformBatch: selectedCount > 0,
  }
}

// Agent搜索hook
export const useAgentSearch = () => {
  const { searchQuery, filters, setSearchQuery, setFilters, fetchAgents } = useAgent()
  
  const search = useCallback((query: string) => {
    setSearchQuery(query)
    // 重置到第一页并搜索
    fetchAgents({ page: 1 })
  }, [setSearchQuery, fetchAgents])
  
  const filter = useCallback((newFilters: any) => {
    setFilters(newFilters)
    // 重置到第一页并过滤
    fetchAgents({ page: 1 })
  }, [setFilters, fetchAgents])
  
  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchQuery('')
    fetchAgents({ page: 1 })
  }, [setFilters, setSearchQuery, fetchAgents])
  
  return {
    searchQuery,
    filters,
    search,
    filter,
    clearFilters,
    hasActiveFilters: Object.keys(filters).length > 0 || searchQuery.length > 0,
  }
}

// Agent状态监控hook
export const useAgentMonitor = (agentId: string | null, options: {
  interval?: number
  enabled?: boolean
} = {}) => {
  const { interval = 5000, enabled = true } = options
  const { fetchAgent, currentAgent } = useAgent()
  
  useEffect(() => {
    if (!enabled || !agentId) return
    
    const intervalId = setInterval(() => {
      fetchAgent(agentId)
    }, interval)
    
    return () => clearInterval(intervalId)
  }, [enabled, agentId, interval, fetchAgent])
  
  return {
    agent: currentAgent,
    isRunning: currentAgent?.status === 'running',
    isStopped: currentAgent?.status === 'stopped',
    hasError: currentAgent?.status === 'error',
  }
}

// Agent性能统计hook
export const useAgentStats = () => {
  const { agents } = useAgent()
  
  const stats = {
    total: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    stopped: agents.filter(a => a.status === 'stopped').length,
    error: agents.filter(a => a.status === 'error').length,
    byType: agents.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    avgSuccessRate: agents.length > 0 
      ? agents.reduce((sum, agent) => sum + (agent.performance?.successRate || 0), 0) / agents.length
      : 0,
  }
  
  return stats
}