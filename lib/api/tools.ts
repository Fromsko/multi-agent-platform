import { api } from "./base"
import type { Tool } from "@/lib/types"

export interface CreateToolRequest {
  name: string
  description: string
  type: string
  configuration: any
  schema: any
}

export interface UpdateToolRequest extends Partial<CreateToolRequest> {}

export interface ToolListParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
}

export const toolsApi = {
  list: (params?: ToolListParams) => api.get<Tool[]>("/tools", params),

  get: (id: string) => api.get<Tool>(`/tools/${id}`),

  create: (data: CreateToolRequest) => api.post<Tool>("/tools", data),

  update: (id: string, data: UpdateToolRequest) => api.put<Tool>(`/tools/${id}`, data),

  delete: (id: string) => api.delete(`/tools/${id}`),

  test: (id: string, input: any) => api.post(`/tools/${id}/test`, { input }),

  getUsage: (id: string) => api.get(`/tools/${id}/usage`),

  activate: (id: string) => api.post(`/tools/${id}/activate`),

  deactivate: (id: string) => api.post(`/tools/${id}/deactivate`),
}
