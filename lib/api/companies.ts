import { api } from "./base"
import type { Company } from "@/lib/types"

export interface CreateCompanyRequest {
  name: string
  description?: string
  type: string
  industry: string
  settings?: any
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CompanyListParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
}

export const companiesApi = {
  list: (params?: CompanyListParams) => api.get<Company[]>("/companies", params),

  get: (id: string) => api.get<Company>(`/companies/${id}`),

  create: (data: CreateCompanyRequest) => api.post<Company>("/companies", data),

  update: (id: string, data: UpdateCompanyRequest) => api.put<Company>(`/companies/${id}`, data),

  delete: (id: string) => api.delete(`/companies/${id}`),

  start: (id: string) => api.post(`/companies/${id}/start`),

  stop: (id: string) => api.post(`/companies/${id}/stop`),

  getMetrics: (id: string) => api.get(`/companies/${id}/metrics`),

  getLogs: (id: string, params?: { level?: string; startDate?: string; endDate?: string; limit?: number }) =>
    api.get(`/companies/${id}/logs`, params),
}
