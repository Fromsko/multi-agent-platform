import { create } from 'zustand'
import { companyService } from '@/services/company.service'
import type { Company, CreateCompanyRequest, UpdateCompanyRequest, CompanyMetrics } from '@/services/types'
import toast from 'react-hot-toast'

interface CompanyState {
  // 状态
  companies: Company[]
  currentCompany: Company | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  filters: {
    status?: string
    type?: string
    industry?: string
  }
  selectedCompanies: string[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  metrics: CompanyMetrics | null

  // 操作
  fetchCompanies: (params?: any) => Promise<void>
  fetchCompany: (id: string) => Promise<void>
  createCompany: (data: CreateCompanyRequest) => Promise<boolean>
  updateCompany: (id: string, data: UpdateCompanyRequest) => Promise<boolean>
  deleteCompany: (id: string) => Promise<boolean>
  deleteCompanies: (ids: string[]) => Promise<boolean>
  duplicateCompany: (id: string) => Promise<boolean>
  fetchMetrics: (id: string) => Promise<void>
  batchOperation: (ids: string[], operation: string) => Promise<boolean>
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<CompanyState['filters']>) => void
  setSelectedCompanies: (ids: string[]) => void
  toggleCompanySelection: (id: string) => void
  selectAllCompanies: () => void
  clearSelection: () => void
  clearError: () => void
  setCurrentCompany: (company: Company | null) => void
}

export const useCompanyStore = create<CompanyState>()((set, get) => ({
  // 初始状态
  companies: [],
  currentCompany: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
  selectedCompanies: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  metrics: null,

  // 获取Company列表
  fetchCompanies: async (params = {}) => {
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
      
      const response = await companyService.getCompanies(queryParams)
      
      if (response.success && response.data) {
        set({
          companies: response.data.items || [],
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
        const errorMessage = response.error?.message || '获取公司列表失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取公司列表失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // 获取单个Company
  fetchCompany: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await companyService.getCompany(id)
      
      if (response.success && response.data) {
        set({
          currentCompany: response.data,
          isLoading: false,
          error: null,
        })
      } else {
        const errorMessage = response.error?.message || '获取公司详情失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取公司详情失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // 创建Company
  createCompany: async (data: CreateCompanyRequest) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await companyService.createCompany(data)
      
      if (response.success && response.data) {
        // 重新获取列表
        await get().fetchCompanies()
        
        set({ isLoading: false, error: null })
        toast.success('公司创建成功')
        return true
      } else {
        const errorMessage = response.error?.message || '公司创建失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '公司创建失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 更新Company
  updateCompany: async (id: string, data: UpdateCompanyRequest) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await companyService.updateCompany(id, data)
      
      if (response.success && response.data) {
        // 更新本地状态
        const { companies, currentCompany } = get()
        const updatedCompanies = companies.map(company => 
          company.id === id ? response.data! : company
        )
        
        set({
          companies: updatedCompanies,
          currentCompany: currentCompany?.id === id ? response.data : currentCompany,
          isLoading: false,
          error: null,
        })
        
        toast.success('公司更新成功')
        return true
      } else {
        const errorMessage = response.error?.message || '公司更新失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '公司更新失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 删除Company
  deleteCompany: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await companyService.deleteCompany(id)
      
      if (response.success) {
        // 从本地状态中移除
        const { companies, currentCompany, selectedCompanies } = get()
        const updatedCompanies = companies.filter(company => company.id !== id)
        const updatedSelectedCompanies = selectedCompanies.filter(companyId => companyId !== id)
        
        set({
          companies: updatedCompanies,
          currentCompany: currentCompany?.id === id ? null : currentCompany,
          selectedCompanies: updatedSelectedCompanies,
          isLoading: false,
          error: null,
        })
        
        toast.success('公司删除成功')
        return true
      } else {
        const errorMessage = response.error?.message || '公司删除失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '公司删除失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 批量删除Company
  deleteCompanies: async (ids: string[]) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await companyService.batchOperation(ids, 'delete')
      
      if (response.success) {
        // 从本地状态中移除
        const { companies, currentCompany, selectedCompanies } = get()
        const updatedCompanies = companies.filter(company => !ids.includes(company.id))
        const updatedSelectedCompanies = selectedCompanies.filter(companyId => !ids.includes(companyId))
        
        set({
          companies: updatedCompanies,
          currentCompany: ids.includes(currentCompany?.id || '') ? null : currentCompany,
          selectedCompanies: updatedSelectedCompanies,
          isLoading: false,
          error: null,
        })
        
        toast.success(`成功删除${ids.length}个公司`)
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

  // 复制Company
  duplicateCompany: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await companyService.duplicateCompany(id)
      
      if (response.success && response.data) {
        // 重新获取列表
        await get().fetchCompanies()
        
        set({ isLoading: false, error: null })
        toast.success('公司复制成功')
        return true
      } else {
        const errorMessage = response.error?.message || '公司复制失败'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '公司复制失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 获取公司指标
  fetchMetrics: async (id: string) => {
    try {
      const response = await companyService.getMetrics(id)
      
      if (response.success && response.data) {
        set({ metrics: response.data })
      } else {
        const errorMessage = response.error?.message || '获取公司指标失败'
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取公司指标失败'
      toast.error(errorMessage)
    }
  },

  // 批量操作
  batchOperation: async (ids: string[], operation: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await companyService.batchOperation(ids, operation)
      
      if (response.success) {
        // 重新获取列表
        await get().fetchCompanies()
        
        set({ isLoading: false, error: null, selectedCompanies: [] })
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
  setFilters: (filters: Partial<CompanyState['filters']>) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  // 设置选中的Company
  setSelectedCompanies: (ids: string[]) => {
    set({ selectedCompanies: ids })
  },

  // 切换Company选中状态
  toggleCompanySelection: (id: string) => {
    const { selectedCompanies } = get()
    const isSelected = selectedCompanies.includes(id)
    
    if (isSelected) {
      set({ selectedCompanies: selectedCompanies.filter(companyId => companyId !== id) })
    } else {
      set({ selectedCompanies: [...selectedCompanies, id] })
    }
  },

  // 全选Company
  selectAllCompanies: () => {
    const { companies } = get()
    set({ selectedCompanies: companies.map(company => company.id) })
  },

  // 清除选择
  clearSelection: () => {
    set({ selectedCompanies: [] })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },

  // 设置当前Company
  setCurrentCompany: (company: Company | null) => {
    set({ currentCompany: company })
  },
}))

// Company状态选择器
export const useCompanySelectors = () => {
  const store = useCompanyStore()
  
  return {
    // 过滤后的Company列表
    filteredCompanies: store.companies.filter(company => {
      const matchesSearch = !store.searchQuery || 
        company.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        company.description?.toLowerCase().includes(store.searchQuery.toLowerCase())
      
      const matchesStatus = !store.filters.status || company.status === store.filters.status
      const matchesType = !store.filters.type || company.type === store.filters.type
      const matchesIndustry = !store.filters.industry || company.industry === store.filters.industry
      
      return matchesSearch && matchesStatus && matchesType && matchesIndustry
    }),
    
    // 选中的Company数量
    selectedCount: store.selectedCompanies.length,
    
    // 是否全选
    isAllSelected: store.companies.length > 0 && store.selectedCompanies.length === store.companies.length,
    
    // 是否部分选中
    isPartiallySelected: store.selectedCompanies.length > 0 && store.selectedCompanies.length < store.companies.length,
    
    // 活跃的Company数量
    activeCount: store.companies.filter(company => company.status === 'active').length,
    
    // 暂停的Company数量
    pausedCount: store.companies.filter(company => company.status === 'paused').length,
    
    // 总Agent数量
    totalAgents: store.companies.reduce((total, company) => total + (company.agentCount || 0), 0),
    
    // 总工具数量
    totalTools: store.companies.reduce((total, company) => total + (company.toolCount || 0), 0),
  }
}