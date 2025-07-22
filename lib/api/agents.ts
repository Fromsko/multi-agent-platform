import { api } from "./base"
import type { Agent } from "@/lib/types"

export interface CreateAgentRequest {
  name: string
  description: string
  type: string
  model: string
  capabilities: string[]
  configuration: any
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {}

export interface AgentListParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  companyId?: string
}

export const agentsApi = {
  list: (params?: AgentListParams) => api.get<Agent[]>("/agents", params),

  get: (id: string) => api.get<Agent>(`/agents/${id}`),

  create: (data: CreateAgentRequest) => api.post<Agent>("/agents", data),

  update: (id: string, data: UpdateAgentRequest) => api.put<Agent>(`/agents/${id}`, data),

  delete: (id: string) => api.delete(`/agents/${id}`),

  test: (id: string, input: string, context?: any) => api.post(`/agents/${id}/test`, { input, context }),

  getPerformance: (id: string) => api.get(`/agents/${id}/performance`),

  start: (id: string) => api.post(`/agents/${id}/start`),

  stop: (id: string) => api.post(`/agents/${id}/stop`),
}
