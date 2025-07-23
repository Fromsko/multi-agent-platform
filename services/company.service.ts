import { api, type ApiResponse } from './api/client'
import { API_ENDPOINTS } from './api/config'
import type {
  Company,
  CompanySettings,
  CompanyMetrics,
  ListParams,
} from './types'

export interface CreateCompanyRequest {
  name: string
  description?: string
  type: Company['type']
  industry: Company['industry']
  settings?: Partial<CompanySettings>
}

export interface UpdateCompanyRequest {
  name?: string
  description?: string
  type?: Company['type']
  industry?: Company['industry']
  settings?: Partial<CompanySettings>
  status?: Company['status']
}

export interface CompanyExportData {
  company: Company
  agents: any[]
  tools: any[]
  workflows: any[]
  settings: CompanySettings
}

export class CompanyService {
  /**
   * 获取公司列表
   */
  async getCompanies(params?: ListParams): Promise<ApiResponse<Company[]>> {
    return api.get<Company[]>(API_ENDPOINTS.COMPANIES.LIST, params)
  }

  /**
   * 创建公司
   */
  async createCompany(data: CreateCompanyRequest): Promise<ApiResponse<Company>> {
    return api.post<Company>(API_ENDPOINTS.COMPANIES.CREATE, data)
  }

  /**
   * 获取公司详情
   */
  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return api.get<Company>(API_ENDPOINTS.COMPANIES.DETAIL(id))
  }

  /**
   * 更新公司
   */
  async updateCompany(
    id: string,
    data: UpdateCompanyRequest
  ): Promise<ApiResponse<Company>> {
    return api.put<Company>(API_ENDPOINTS.COMPANIES.UPDATE(id), data)
  }

  /**
   * 删除公司
   */
  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(API_ENDPOINTS.COMPANIES.DELETE(id))
  }

  /**
   * 启动公司
   */
  async startCompany(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.COMPANIES.START(id))
  }

  /**
   * 停止公司
   */
  async stopCompany(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.COMPANIES.STOP(id))
  }

  /**
   * 获取公司指标
   */
  async getCompanyMetrics(
    id: string,
    timeRange?: '24h' | '7d' | '30d' | '90d'
  ): Promise<ApiResponse<CompanyMetrics>> {
    const params = timeRange ? { time_range: timeRange } : undefined
    return api.get<CompanyMetrics>(API_ENDPOINTS.COMPANIES.METRICS(id), params)
  }

  /**
   * 复制公司
   */
  async duplicateCompany(
    id: string,
    name?: string
  ): Promise<ApiResponse<Company>> {
    return api.post<Company>(API_ENDPOINTS.COMPANIES.DUPLICATE(id), {
      name: name || undefined,
    })
  }

  /**
   * 导出公司配置
   */
  async exportCompany(id: string): Promise<ApiResponse<CompanyExportData>> {
    return api.get<CompanyExportData>(API_ENDPOINTS.COMPANIES.EXPORT(id))
  }

  /**
   * 导入公司配置
   */
  async importCompany(
    id: string,
    data: CompanyExportData
  ): Promise<ApiResponse<Company>> {
    return api.post<Company>(API_ENDPOINTS.COMPANIES.IMPORT(id), data)
  }

  /**
   * 批量操作公司
   */
  async batchOperation(
    operation: 'start' | 'stop' | 'delete',
    companyIds: string[]
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    const promises = companyIds.map(async (id) => {
      try {
        switch (operation) {
          case 'start':
            await this.startCompany(id)
            break
          case 'stop':
            await this.stopCompany(id)
            break
          case 'delete':
            await this.deleteCompany(id)
            break
        }
        return { id, success: true }
      } catch {
        return { id, success: false }
      }
    })

    const results = await Promise.all(promises)
    const success = results.filter(r => r.success).map(r => r.id)
    const failed = results.filter(r => !r.success).map(r => r.id)

    return {
      success: true,
      data: { success, failed },
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 获取公司状态统计
   */
  async getCompanyStats(): Promise<ApiResponse<{
    total: number
    active: number
    idle: number
    error: number
    maintenance: number
  }>> {
    const response = await this.getCompanies()
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch company stats',
        },
        timestamp: new Date().toISOString(),
      }
    }

    const companies = response.data
    const stats = {
      total: companies.length,
      active: companies.filter(c => c.status === 'active').length,
      idle: companies.filter(c => c.status === 'idle').length,
      error: companies.filter(c => c.status === 'error').length,
      maintenance: companies.filter(c => c.status === 'maintenance').length,
    }

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 搜索公司
   */
  async searchCompanies(
    query: string,
    filters?: {
      type?: Company['type']
      industry?: Company['industry']
      status?: Company['status']
    }
  ): Promise<ApiResponse<Company[]>> {
    const params = {
      search: query,
      ...filters,
    }
    return this.getCompanies(params)
  }

  /**
   * 获取公司类型选项
   */
  getCompanyTypes(): Array<{ value: Company['type']; label: string }> {
    return [
      { value: 'software', label: '软件开发' },
      { value: 'research', label: '研究机构' },
      { value: 'content', label: '内容创作' },
      { value: 'consulting', label: '咨询服务' },
      { value: 'other', label: '其他' },
    ]
  }

  /**
   * 获取行业选项
   */
  getIndustryOptions(): Array<{ value: Company['industry']; label: string }> {
    return [
      { value: 'technology', label: '科技' },
      { value: 'finance', label: '金融' },
      { value: 'healthcare', label: '医疗' },
      { value: 'education', label: '教育' },
      { value: 'retail', label: '零售' },
      { value: 'manufacturing', label: '制造业' },
      { value: 'other', label: '其他' },
    ]
  }

  /**
   * 获取默认公司设置
   */
  getDefaultSettings(): CompanySettings {
    return {
      auto_start: false,
      max_agents: 10,
      max_tools: 20,
      max_concurrency: 5,
      notify_on_completion: true,
      api_rate_limit: 1000,
      memory_size: 1024,
      visibility: 'private',
      email_notifications: true,
      sms_notifications: false,
      retry_policy: {
        max_retries: 3,
        backoff_strategy: 'exponential',
        initial_delay: 1000,
      },
    }
  }

  /**
   * 验证公司设置
   */
  validateSettings(settings: Partial<CompanySettings>): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (settings.max_agents !== undefined && settings.max_agents < 1) {
      errors.push('最大Agent数量必须大于0')
    }

    if (settings.max_tools !== undefined && settings.max_tools < 1) {
      errors.push('最大工具数量必须大于0')
    }

    if (settings.max_concurrency !== undefined && settings.max_concurrency < 1) {
      errors.push('最大并发数必须大于0')
    }

    if (settings.api_rate_limit !== undefined && settings.api_rate_limit < 1) {
      errors.push('API限流必须大于0')
    }

    if (settings.memory_size !== undefined && settings.memory_size < 64) {
      errors.push('内存大小必须至少64MB')
    }

    if (settings.retry_policy?.max_retries !== undefined && settings.retry_policy.max_retries < 0) {
      errors.push('最大重试次数不能为负数')
    }

    if (settings.retry_policy?.initial_delay !== undefined && settings.retry_policy.initial_delay < 100) {
      errors.push('初始延迟必须至少100ms')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 获取公司仪表板数据
   */
  async getCompanyDashboard(id: string): Promise<ApiResponse<{
    company: Company
    metrics: CompanyMetrics
    recentActivity: any[]
    agentStats: any
    taskStats: any
  }>> {
    try {
      const [companyResponse, metricsResponse] = await Promise.all([
        this.getCompany(id),
        this.getCompanyMetrics(id),
      ])

      if (!companyResponse.success || !metricsResponse.success) {
        return {
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: 'Failed to fetch company dashboard data',
          },
          timestamp: new Date().toISOString(),
        }
      }

      return {
        success: true,
        data: {
          company: companyResponse.data!,
          metrics: metricsResponse.data!,
          recentActivity: [], // TODO: 实现活动数据获取
          agentStats: {}, // TODO: 实现Agent统计
          taskStats: {}, // TODO: 实现任务统计
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch company dashboard data',
          details: error,
        },
        timestamp: new Date().toISOString(),
      }
    }
  }
}

// 创建单例实例
export const companyService = new CompanyService()