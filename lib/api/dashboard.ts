import { api } from "./base"

// 后端响应格式
export interface DashboardResponse<T = any> {
  success: boolean
  data: T
  meta?: Record<string, any> | null
}

export interface DashboardStats {
  totalCompanies: number
  totalAgents: number
  activeProjects: number
  completedTasks: number
  todayTasks: number
  weeklyGrowth: {
    companies: number
    agents: number
    projects: number
    tasks: number
  }
}

export interface PerformanceData {
  timestamp: string
  tasks: number
  efficiency: number
  responseTime: number
  errorRate: number
  activeAgents: number
}

export interface AlertData {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'acknowledged'
  message: string
  timestamp: string
  source?: string
}

export interface DashboardStatsParams {
  period?: 'today' | 'week' | 'month' | 'year'
  companyId?: string
}

export interface PerformanceParams {
  period?: 'hour' | 'day' | 'week' | 'month'
  metrics?: string
  companyId?: string
}

export interface AlertsParams {
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'active' | 'resolved' | 'acknowledged'
  limit?: number
}

export const dashboardApi = {
  getStats: (params?: DashboardStatsParams) => 
    api.get<DashboardResponse<DashboardStats>>("/api/v1/dashboard/stats", { params }),
  
  getPerformance: (params?: PerformanceParams) => 
    api.get<DashboardResponse<PerformanceData[]>>("/api/v1/dashboard/performance", { params }),
    
  getAlerts: (params?: AlertsParams) => 
    api.get<DashboardResponse<AlertData[]>>("/api/v1/dashboard/alerts", { params }),
}