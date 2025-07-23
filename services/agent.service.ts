import { api, type ApiResponse } from './api/client'
import { API_ENDPOINTS } from './api/config'
import type {
  Agent,
  AgentConfiguration,
  ListParams
} from './types'

export interface CreateAgentRequest {
  name: string
  description: string
  type: Agent['type']
  model: string
  configuration: Partial<AgentConfiguration>
  company_id?: string
}

export interface UpdateAgentRequest {
  name?: string
  description?: string
  type?: Agent['type']
  model?: string
  configuration?: Partial<AgentConfiguration>
  status?: Agent['status']
}

export interface AgentChatRequest {
  message: string
  conversation_id?: string
  context?: Record<string, any>
}

export interface AgentChatResponse {
  message: string
  conversation_id: string
  tokens_used: number
  response_time: number
  metadata?: Record<string, any>
}

export interface AgentMetrics {
  total_requests: number
  successful_requests: number
  failed_requests: number
  average_response_time: number
  average_tokens_used: number
  error_rate: number
  last_24h_requests: number
  last_7d_requests: number
  last_30d_requests: number
  performance_trend: {
    date: string
    requests: number
    success_rate: number
    avg_response_time: number
  }[]
}

export interface AgentLog {
  id: string
  timestamp: string
  type: 'request' | 'response' | 'error' | 'system'
  message: string
  metadata?: Record<string, any>
  tokens_used?: number
  response_time?: number
}

export class AgentService {
  /**
   * 获取Agent列表
   */
  async getAgents(params?: ListParams): Promise<ApiResponse<Agent[]>> {
    return api.get<Agent[]>(API_ENDPOINTS.AGENTS.LIST, params)
  }

  /**
   * 创建Agent
   */
  async createAgent(data: CreateAgentRequest): Promise<ApiResponse<Agent>> {
    return api.post<Agent>(API_ENDPOINTS.AGENTS.CREATE, data)
  }

  /**
   * 获取Agent详情
   */
  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    return api.get<Agent>(API_ENDPOINTS.AGENTS.DETAIL(id))
  }

  /**
   * 更新Agent
   */
  async updateAgent(
    id: string,
    data: UpdateAgentRequest
  ): Promise<ApiResponse<Agent>> {
    return api.put<Agent>(API_ENDPOINTS.AGENTS.UPDATE(id), data)
  }

  /**
   * 删除Agent
   */
  async deleteAgent(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(API_ENDPOINTS.AGENTS.DELETE(id))
  }

  /**
   * 启动Agent
   */
  async startAgent(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.AGENTS.START(id))
  }

  /**
   * 停止Agent
   */
  async stopAgent(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.AGENTS.STOP(id))
  }

  /**
   * 与Agent聊天
   */
  async chatWithAgent(
    id: string,
    data: AgentChatRequest
  ): Promise<ApiResponse<AgentChatResponse>> {
    return api.post<AgentChatResponse>(API_ENDPOINTS.AGENTS.CHAT(id), data)
  }

  /**
   * 获取Agent指标
   */
  async getAgentMetrics(
    id: string,
    timeRange?: '24h' | '7d' | '30d' | '90d'
  ): Promise<ApiResponse<AgentMetrics>> {
    const params = timeRange ? { time_range: timeRange } : undefined
    return api.get<AgentMetrics>(API_ENDPOINTS.AGENTS.METRICS(id), params)
  }

  /**
   * 获取Agent日志
   */
  async getAgentLogs(
    id: string,
    params?: {
      page?: number
      limit?: number
      level?: string
      start_time?: string
      end_time?: string
    }
  ): Promise<ApiResponse<AgentLog[]>> {
    return api.get<AgentLog[]>(API_ENDPOINTS.AGENTS.LOGS(id), params)
  }

  /**
   * 复制Agent
   */
  async duplicateAgent(
    id: string,
    name?: string
  ): Promise<ApiResponse<Agent>> {
    return api.post<Agent>(API_ENDPOINTS.AGENTS.DUPLICATE(id), {
      name: name || undefined,
    })
  }

  /**
   * 导出Agent配置
   */
  async exportAgent(id: string): Promise<ApiResponse<any>> {
    return api.get<any>(API_ENDPOINTS.AGENTS.EXPORT(id))
  }

  /**
   * 导入Agent配置
   */
  async importAgent(
    id: string,
    config: any
  ): Promise<ApiResponse<Agent>> {
    return api.post<Agent>(API_ENDPOINTS.AGENTS.IMPORT(id), config)
  }

  /**
   * 批量操作Agent
   */
  async batchOperation(
    operation: 'start' | 'stop' | 'delete',
    agentIds: string[]
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    const promises = agentIds.map(async (id) => {
      try {
        switch (operation) {
          case 'start':
            await this.startAgent(id)
            break
          case 'stop':
            await this.stopAgent(id)
            break
          case 'delete':
            await this.deleteAgent(id)
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
   * 获取Agent状态统计
   */
  async getAgentStats(): Promise<ApiResponse<{
    total: number
    active: number
    idle: number
    error: number
    training: number
  }>> {
    const response = await this.getAgents()
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch agent stats',
        },
        timestamp: new Date().toISOString(),
      }
    }

    const agents = response.data
    const stats = {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      idle: agents.filter(a => a.status === 'idle').length,
      error: agents.filter(a => a.status === 'error').length,
      training: agents.filter(a => a.status === 'training').length,
    }

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 搜索Agent
   */
  async searchAgents(
    query: string,
    filters?: {
      type?: Agent['type']
      status?: Agent['status']
      company_id?: string
    }
  ): Promise<ApiResponse<Agent[]>> {
    const params = {
      search: query,
      ...filters,
    }
    return this.getAgents(params)
  }

  /**
   * 获取推荐的Agent配置
   */
  async getRecommendedConfigurations(
    type: Agent['type']
  ): Promise<ApiResponse<AgentConfiguration[]>> {
    // 这里可以根据Agent类型返回推荐配置
    // 暂时返回默认配置
    const defaultConfigs: Record<Agent['type'], AgentConfiguration> = {
      conversational: {
        system_prompt: '你是一个友好的对话助手，请用简洁明了的方式回答用户问题。',
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop_sequences: [],
        tools: [],
        memory_size: 10,
        context_window: 4096,
        response_format: 'text',
        safety: {
          content_filter: true,
          toxicity_threshold: 0.8,
          bias_detection: true,
        },
      },
      analytical: {
        system_prompt: '你是一个数据分析专家，请提供准确的分析和洞察。',
        temperature: 0.3,
        max_tokens: 4096,
        top_p: 0.8,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop_sequences: [],
        tools: ['calculator', 'data_analyzer'],
        memory_size: 20,
        context_window: 8192,
        response_format: 'structured',
        safety: {
          content_filter: true,
          toxicity_threshold: 0.9,
          bias_detection: true,
        },
      },
      creative: {
        system_prompt: '你是一个创意助手，请发挥想象力提供创新的想法和解决方案。',
        temperature: 0.9,
        max_tokens: 3072,
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        stop_sequences: [],
        tools: ['image_generator', 'text_generator'],
        memory_size: 15,
        context_window: 6144,
        response_format: 'text',
        safety: {
          content_filter: true,
          toxicity_threshold: 0.7,
          bias_detection: true,
        },
      },
      technical: {
        system_prompt: '你是一个技术专家，请提供准确的技术指导和解决方案。',
        temperature: 0.2,
        max_tokens: 4096,
        top_p: 0.8,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop_sequences: [],
        tools: ['code_analyzer', 'documentation_search'],
        memory_size: 25,
        context_window: 8192,
        response_format: 'structured',
        safety: {
          content_filter: true,
          toxicity_threshold: 0.9,
          bias_detection: true,
        },
      },
      custom: {
        system_prompt: '请根据具体需求自定义你的行为。',
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop_sequences: [],
        tools: [],
        memory_size: 10,
        context_window: 4096,
        response_format: 'text',
        safety: {
          content_filter: true,
          toxicity_threshold: 0.8,
          bias_detection: true,
        },
      },
    }

    return {
      success: true,
      data: [defaultConfigs[type]],
      timestamp: new Date().toISOString(),
    }
  }
}

// 创建单例实例
export const agentService = new AgentService()