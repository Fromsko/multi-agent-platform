import { api } from "./base"

export interface LogListParams {
  page?: number
  limit?: number
  level?: string
  source?: string
  startDate?: string
  endDate?: string
  search?: string
  userId?: string
  companyId?: string
  taskId?: string
}

export const logsApi = {
  list: (params?: LogListParams) => api.get("/api/v1/logs", params),

  getSystemMetrics: () => api.get("/api/v1/logs/metrics/system"),

  getPerformanceMetrics: (startDate?: string, endDate?: string, granularity?: string, metrics?: string[]) =>
    api.get("/api/v1/logs/metrics/performance", { startDate, endDate, granularity, metrics }),

  getBusinessMetrics: (period?: string, companyId?: string) =>
    api.get("/api/v1/logs/metrics/business", { period, companyId }),
}
