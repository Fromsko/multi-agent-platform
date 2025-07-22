import { api } from "./base"
import type { Agent } from "@/lib/types"

export interface CreateAgentRequest {
  name: string
  description: string
  type: string
  model: string
  provider: string
  capabilities: string[]
  configuration: any
  companyId: string
  tags: string[]
  isPublic: boolean
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {}

export interface AgentListParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  companyId?: string
  tags?: string[]
  isPublic?: boolean
  provider?: string
  sort?: string
  order?: string
}

export const agentsApi = {
  list: (params?: AgentListParams) => api.get<Agent[]>("/api/v1/agents", params),

  get: (id: string) => api.get<Agent>(`/api/v1/agents/${id}`),

  create: (data: CreateAgentRequest) => api.post<Agent>("/api/v1/agents", data),

  update: (id: string, data: UpdateAgentRequest) => api.put<Agent>(`/api/v1/agents/${id}`, data),

  delete: (id: string) => api.delete(`/api/v1/agents/${id}`),

  test: (id: string, input: string, context?: any, tools?: string[]) =>
    api.post(`/api/v1/agents/${id}/test`, { input, context, tools }),

  getPerformance: (id: string, period?: string, metrics?: string[]) =>
    api.get(`/api/v1/agents/${id}/performance`, { period, metrics }),

  clone: (id: string, name: string, companyId: string) => api.post(`/api/v1/agents/${id}/clone`, { name, companyId }),

  publish: (id: string, category: string, pricing: any, documentation: string) =>
    api.post(`/api/v1/agents/${id}/publish`, { category, pricing, documentation }),

  addReview: (id: string, rating: number, comment: string) =>
    api.post(`/api/v1/agents/${id}/review`, { rating, comment }),

  getReviews: (id: string, page?: number, limit?: number) => api.get(`/api/v1/agents/${id}/reviews`, { page, limit }),

  train: (id: string, trainingData: any[], epochs?: number, learningRate?: number) =>
    api.post(`/api/v1/agents/${id}/train`, { trainingData, epochs, learningRate }),
}
