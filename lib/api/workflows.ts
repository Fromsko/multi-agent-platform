import { api } from "./base"
import type { Workflow } from "@/lib/types"

export interface CreateWorkflowRequest {
  name: string
  description?: string
  companyId: string
  nodes: any[]
  edges: any[]
  configuration?: any
  triggers?: any[]
  schedule?: any
  tags?: string[]
  isTemplate?: boolean
  templateCategory?: string
}

export interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {}

export interface WorkflowListParams {
  page?: number
  limit?: number
  companyId?: string
  status?: string
  isTemplate?: boolean
  category?: string
  search?: string
  tags?: string[]
  sort?: string
  order?: string
}

export const workflowsApi = {
  list: (params?: WorkflowListParams) => api.get<Workflow[]>("/api/v1/workflows", params),

  create: (data: CreateWorkflowRequest) => api.post<Workflow>("/api/v1/workflows", data),

  get: (id: string) => api.get<Workflow>(`/api/v1/workflows/${id}`),

  update: (id: string, data: UpdateWorkflowRequest) => api.put<Workflow>(`/api/v1/workflows/${id}`, data),

  delete: (id: string) => api.delete(`/api/v1/workflows/${id}`),

  validate: (id: string) => api.post(`/api/v1/workflows/${id}/validate`),

  execute: (id: string, input?: any, variables?: any, priority?: string) =>
    api.post(`/api/v1/workflows/${id}/execute`, { input, variables, priority }),

  exportWorkflow: (id: string) => api.post(`/api/v1/workflows/${id}/export`),

  importWorkflow: (id: string, data: any, overwrite?: boolean, createDependencies?: boolean) =>
    api.post(`/api/v1/workflows/${id}/import`, { data, overwrite, createDependencies }),

  getExecutions: (id: string, page?: number, limit?: number, status?: string) =>
    api.get(`/api/v1/workflows/${id}/executions`, { page, limit, status }),

  schedule: (id: string, enabled: boolean, cron: string, timezone: string, variables?: any) =>
    api.post(`/api/v1/workflows/${id}/schedule`, { enabled, cron, timezone, variables }),

  getTemplates: (
    page?: number,
    limit?: number,
    category?: string,
    industry?: string,
    complexity?: string,
    search?: string,
  ) => api.get("/api/v1/workflows/templates", { page, limit, category, industry, complexity, search }),
}
