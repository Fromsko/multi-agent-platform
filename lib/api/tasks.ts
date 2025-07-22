import { api } from "./base"
import type { Task } from "@/lib/types"

export interface CreateTaskRequest {
  name: string
  description?: string
  type: string
  priority?: string
  companyId: string
  workflowId?: string
  agentId?: string
  input?: any
  assignedTo?: string
  tags?: string[]
  scheduledAt?: string
}

export interface UpdateTaskRequest {
  name?: string
  description?: string
  priority?: string
  assignedTo?: string
  tags?: string[]
  status?: string
}

export interface TaskListParams {
  page?: number
  limit?: number
  status?: string
  type?: string
  priority?: string
  companyId?: string
  assignedTo?: string
  createdBy?: string
  startDate?: string
  endDate?: string
  search?: string
  tags?: string[]
  sort?: string
  order?: string
}

export const tasksApi = {
  list: (params?: TaskListParams) => api.get<Task[]>("/api/v1/tasks", params),

  create: (data: CreateTaskRequest) => api.post<Task>("/api/v1/tasks", data),

  get: (id: string) => api.get<Task>(`/api/v1/tasks/${id}`),

  update: (id: string, data: UpdateTaskRequest) => api.put<Task>(`/api/v1/tasks/${id}`, data),

  delete: (id: string) => api.delete(`/api/v1/tasks/${id}`),

  execute: (id: string, priority?: string, variables?: any) =>
    api.post(`/api/v1/tasks/${id}/execute`, { priority, variables }),

  cancel: (id: string, reason?: string) => api.post(`/api/v1/tasks/${id}/cancel`, { reason }),

  pause: (id: string) => api.post(`/api/v1/tasks/${id}/pause`),

  resume: (id: string) => api.post(`/api/v1/tasks/${id}/resume`),

  retry: (id: string, fromStep?: string, resetProgress?: boolean) =>
    api.post(`/api/v1/tasks/${id}/retry`, { fromStep, resetProgress }),

  getExecutions: (id: string, page?: number, limit?: number, status?: string) =>
    api.get(`/api/v1/tasks/${id}/executions`, { page, limit, status }),

  getLogs: (
    id: string,
    page?: number,
    limit?: number,
    level?: string,
    startDate?: string,
    endDate?: string,
    nodeId?: string,
  ) => api.get(`/api/v1/tasks/${id}/logs`, { page, limit, level, startDate, endDate, nodeId }),

  createBatch: (tasks: any[]) => api.post("/api/v1/tasks/batch", { tasks }),

  getQueueStatus: () => api.get("/api/v1/tasks/queue"),
}
