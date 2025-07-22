import { api } from "./base"
import type { Company } from "@/lib/types"

export interface CreateCompanyRequest {
  name: string
  description?: string
  type: string
  industry: string
  agents?: string[]
  tools?: string[]
  workflow?: any
  settings?: any
  tags?: string[]
  logo?: string
  website?: string
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CompanyListParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  owner_id?: string
  industry?: string
  tags?: string[]
  sort?: string
  order?: string
}

export const companiesApi = {
  list: (params?: CompanyListParams) => api.get<Company[]>("/api/v1/companies", params),

  create: (data: CreateCompanyRequest) => api.post<Company>("/api/v1/companies", data),

  get: (id: string) => api.get<Company>(`/api/v1/companies/${id}`),

  update: (id: string, data: UpdateCompanyRequest) => api.put<Company>(`/api/v1/companies/${id}`, data),

  delete: (id: string) => api.delete(`/api/v1/companies/${id}`),

  start: (id: string) => api.post(`/api/v1/companies/${id}/start`),

  stop: (id: string) => api.post(`/api/v1/companies/${id}/stop`),

  getMetrics: (id: string, period?: string, start_date?: string, end_date?: string) =>
    api.get(`/api/v1/companies/${id}/metrics`, { period, start_date, end_date }),

  duplicate: (id: string, name: string, include_data: boolean) =>
    api.post(`/api/v1/companies/${id}/duplicate`, { name, include_data }),

  exportCompany: (id: string, include_agents: boolean, include_tools: boolean, include_workflows: boolean) =>
    api.post(`/api/v1/companies/${id}/export`, { include_agents, include_tools, include_workflows }),

  importCompany: (id: string, data: any, overwrite: boolean) =>
    api.post(`/api/v1/companies/${id}/import`, { data, overwrite }),
}
