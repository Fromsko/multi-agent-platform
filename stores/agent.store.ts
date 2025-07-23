import { create } from 'zustand'
import { agentService } from '@/services/agent.service'
import type { Agent, CreateAgentRequest, UpdateAgentRequest, AgentMetrics, AgentLog } from '@/services/types'
import toast from 'react-hot-toast'

interface AgentState {
  // 状态
  agents: Agent[]
  currentAgent: Agent | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  filters: {
    status?: string
    type?: string
    companyId?: string
  }
  selectedAgents: string[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }

  // 操作
  fetchAgents: (params?: any) => Promise<void>
  fetchAgent: (id: string) => Promise<void>
  createAgent: (data: CreateAgentRequest) => Promise<boolean>
  updateAgent: (id: string, data: UpdateAgentRequest) => Promise<boolean>
  deleteAgent: (id: string) => Promise<boolean>
  deleteAgents: (ids: string[]) => Promise<boolean>
  startAgent: (id: string) => Promise<boolean>
  stopAgent: (id: string) => Promise<boolean>
  duplicateAgent: (id: string) => Promise<boolean>
  batchOperation: (ids: string[], operation: string) => Promise<boolean>
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<AgentState['filters']>) => void
  setSelectedAgents: (ids: string[]) => void
  toggleAgentSelection: (id: string) => void
  selectAllAgents: () => void
  clearSelection: () => void
  clearError: () => void
  setCurrentAgent: (agent: Agent | null) => void
}

export const useAgentStore = create<AgentState>()((set, get) => ({
  // 初始状态
  agents: [],
  currentAgent: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
  selectedAgents: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  // 获取Agent列表
  fetchAgents: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const { searchQuery, filters, pagination } = get()
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        ...filters,
        ...params,
      }
      
      const response = await agentService.getAgents(queryParams)
      
      if (response.success && response.data) {
        set({
          agents: response.data.items || [],
          pagination: {
            page: response.data.page || 1,
            limit: response.data.limit || 20,
            total: response.data.total || 0,
            totalPages: response.data.totalPages || 0,
          },
          isLoading: false,
          error: null,
        })
      } else {
        const errorMessage = response.error?.message || '获取Agent列表失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取Agent列表失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // 获取单个Agent
  fetchAgent: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await agentService.getAgent(id)
      
      if (response.success && response.data) {
        set({
          currentAgent: response.data,
          isLoading: false,
          error: null,
        })
      } else {
        const errorMessage = response.error?.message || '获取Agent详情失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取Agent详情失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // 创建Agent
  createAgent: async (data: CreateAgentRequest) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await agentService.createAgent(data)
      
      if (response.success && response.data) {
        // 重新获取列表
        await get().fetchAgents()
        
        set({ isLoading: false, error: null })
        toast.success('Agent创建成功')
        return true
      } else {
        const errorMessage = response.error?.message || 'Agent创建失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent创建失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 更新Agent
  updateAgent: async (id: string, data: UpdateAgentRequest) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await agentService.updateAgent(id, data)
      
      if (response.success && response.data) {
        // 更新本地状态
        const { agents, currentAgent } = get()
        const updatedAgents = agents.map(agent => 
          agent.id === id ? response.data! : agent
        )
        
        set({
          agents: updatedAgents,
          currentAgent: currentAgent?.id === id ? response.data : currentAgent,
          isLoading: false,
          error: null,
        })
        
        toast.success('Agent更新成功')
        return true
      } else {
        const errorMessage = response.error?.message || 'Agent更新失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent更新失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 删除Agent
  deleteAgent: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await agentService.deleteAgent(id)
      
      if (response.success) {
        // 从本地状态中移除
        const { agents, currentAgent, selectedAgents } = get()
        const updatedAgents = agents.filter(agent => agent.id !== id)
        const updatedSelectedAgents = selectedAgents.filter(agentId => agentId !== id)
        
        set({
          agents: updatedAgents,
          currentAgent: currentAgent?.id === id ? null : currentAgent,
          selectedAgents: updatedSelectedAgents,
          isLoading: false,
          error: null,
        })
        
        toast.success('Agent删除成功')
        return true
      } else {
        const errorMessage = response.error?.message || 'Agent删除失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent删除失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 批量删除Agent
  deleteAgents: async (ids: string[]) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await agentService.batchOperation(ids, 'delete')
      
      if (response.success) {
        // 从本地状态中移除
        const { agents, currentAgent, selectedAgents } = get()
        const updatedAgents = agents.filter(agent => !ids.includes(agent.id))
        const updatedSelectedAgents = selectedAgents.filter(agentId => !ids.includes(agentId))
        
        set({
          agents: updatedAgents,
          currentAgent: ids.includes(currentAgent?.id || '') ? null : currentAgent,
          selectedAgents: updatedSelectedAgents,
          isLoading: false,
          error: null,
        })
        
        toast.success(`成功删除${ids.length}个Agent`)
        return true
      } else {
        const errorMessage = response.error?.message || '批量删除失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量删除失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 启动Agent
  startAgent: async (id: string) => {
    try {
      const response = await agentService.startAgent(id)
      
      if (response.success && response.data) {
        // 更新本地状态
        const { agents, currentAgent } = get()
        const updatedAgents = agents.map(agent => 
          agent.id === id ? { ...agent, status: 'running' } : agent
        )
        
        set({
          agents: updatedAgents,
          currentAgent: currentAgent?.id === id ? { ...currentAgent, status: 'running' } : currentAgent,
        })
        
        toast.success('Agent启动成功')
        return true
      } else {
        const errorMessage = response.error?.message || 'Agent启动失败'
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent启动失败'
      toast.error(errorMessage)
      return false
    }
  },

  // 停止Agent
  stopAgent: async (id: string) => {
    try {
      const response = await agentService.stopAgent(id)
      
      if (response.success && response.data) {
        // 更新本地状态
        const { agents, currentAgent } = get()
        const updatedAgents = agents.map(agent => 
          agent.id === id ? { ...agent, status: 'stopped' } : agent
        )
        
        set({
          agents: updatedAgents,
          currentAgent: currentAgent?.id === id ? { ...currentAgent, status: 'stopped' } : currentAgent,
        })
        
        toast.success('Agent停止成功')
        return true
      } else {
        const errorMessage = response.error?.message || 'Agent停止失败'
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent停止失败'
      toast.error(errorMessage)
      return false
    }
  },

  // 复制Agent
  duplicateAgent: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await agentService.duplicateAgent(id)
      
      if (response.success && response.data) {
        // 重新获取列表
        await get().fetchAgents()
        
        set({ isLoading: false, error: null })
        toast.success('Agent复制成功')
        return true
      } else {
        const errorMessage = response.error?.message || 'Agent复制失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent复制失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 批量操作
  batchOperation: async (ids: string[], operation: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await agentService.batchOperation(ids, operation)
      
      if (response.success) {
        // 重新获取列表
        await get().fetchAgents()
        
        set({ isLoading: false, error: null, selectedAgents: [] })
        toast.success(`批量${operation}操作成功`)
        return true
      } else {
        const errorMessage = response.error?.message || `批量${operation}操作失败`
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `批量${operation}操作失败`
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 设置搜索查询
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  // 设置过滤器
  setFilters: (filters: Partial<AgentState['filters']>) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  // 设置选中的Agent
  setSelectedAgents: (ids: string[]) => {
    set({ selectedAgents: ids })
  },

  // 切换Agent选中状态
  toggleAgentSelection: (id: string) => {
    const { selectedAgents } = get()
    const isSelected = selectedAgents.includes(id)
    
    if (isSelected) {
      set({ selectedAgents: selectedAgents.filter(agentId => agentId !== id) })
    } else {
      set({ selectedAgents: [...selectedAgents, id] })
    }
  },

  // 全选Agent
  selectAllAgents: () => {
    const { agents } = get()
    set({ selectedAgents: agents.map(agent => agent.id) })
  },

  // 清除选择
  clearSelection: () => {
    set({ selectedAgents: [] })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },

  // 设置当前Agent
  setCurrentAgent: (agent: Agent | null) => {
    set({ currentAgent: agent })
  },
}))

// Agent状态选择器
export const useAgentSelectors = () => {
  const store = useAgentStore()
  
  return {
    // 过滤后的Agent列表
    filteredAgents: store.agents.filter(agent => {
      const matchesSearch = !store.searchQuery || 
        agent.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(store.searchQuery.toLowerCase())
      
      const matchesStatus = !store.filters.status || agent.status === store.filters.status
      const matchesType = !store.filters.type || agent.type === store.filters.type
      const matchesCompany = !store.filters.companyId || agent.companyId === store.filters.companyId
      
      return matchesSearch && matchesStatus && matchesType && matchesCompany
    }),
    
    // 选中的Agent数量
    selectedCount: store.selectedAgents.length,
    
    // 是否全选
    isAllSelected: store.agents.length > 0 && store.selectedAgents.length === store.agents.length,
    
    // 是否部分选中
    isPartiallySelected: store.selectedAgents.length > 0 && store.selectedAgents.length < store.agents.length,
    
    // 运行中的Agent数量
    runningCount: store.agents.filter(agent => agent.status === 'running').length,
    
    // 停止的Agent数量
    stoppedCount: store.agents.filter(agent => agent.status === 'stopped').length,
    
    // 错误的Agent数量
    errorCount: store.agents.filter(agent => agent.status === 'error').length,
  }
}