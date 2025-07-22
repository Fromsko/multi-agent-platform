// 统一的类型定义文件
export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  role: "admin" | "user" | "viewer"
  status: "active" | "inactive" | "suspended"
  profile?: UserProfile
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface UserProfile {
  bio?: string
  company?: string
  location?: string
  website?: string
  timezone: string
  language: string
  preferences: {
    theme: "light" | "dark" | "auto"
    notifications: NotificationSettings
  }
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  slack: boolean
  webhook?: string
}

export interface Company {
  id: string
  name: string
  description?: string
  type: "software" | "research" | "content" | "consulting" | "other"
  industry: "technology" | "finance" | "healthcare" | "education" | "retail" | "manufacturing" | "other"
  status: "active" | "idle" | "error" | "maintenance"
  ownerId: string
  agents: Agent[]
  tools: Tool[]
  workflow?: Workflow
  settings: CompanySettings
  metrics: CompanyMetrics
  createdAt: string
  updatedAt: string
}

export interface CompanySettings {
  autoStart: boolean
  maxAgents: number
  maxTools: number
  maxConcurrency: number
  notifyOnCompletion: boolean
  apiRateLimit: number
  memorySize: number
  visibility: "private" | "team" | "public"
  webhookUrl?: string
  slackChannel?: string
  emailNotifications: boolean
  smsNotifications: boolean
  retryPolicy: {
    maxRetries: number
    backoffStrategy: "linear" | "exponential"
    initialDelay: number
  }
}

export interface CompanyMetrics {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageExecutionTime: number
  successRate: number
  lastExecutionAt?: string
  resourceUsage: {
    cpu: number
    memory: number
    storage: number
  }
}

export interface Agent {
  id: string
  name: string
  description: string
  type: "conversational" | "analytical" | "creative" | "technical" | "custom"
  model: string
  status: "active" | "idle" | "error" | "training"
  capabilities: string[]
  configuration: AgentConfiguration
  performance: AgentPerformance
  companyId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AgentConfiguration {
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  tools: string[]
  memorySize: number
  contextWindow: number
  responseFormat: "text" | "json" | "structured"
  safety: {
    contentFilter: boolean
    toxicityThreshold: number
    biasDetection: boolean
  }
}

export interface AgentPerformance {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  averageTokensUsed: number
  lastUsedAt?: string
  errorRate: number
  satisfactionScore?: number
}

export interface Tool {
  id: string
  name: string
  description: string
  type: "api" | "database" | "file" | "code" | "webhook" | "custom"
  version: string
  status: "active" | "inactive" | "deprecated" | "error"
  configuration: ToolConfiguration
  schema: ToolSchema
  usage: ToolUsage
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ToolConfiguration {
  endpoint?: string
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  authentication: {
    type: "none" | "api_key" | "bearer" | "basic" | "oauth2"
    credentials?: Record<string, string>
  }
  timeout: number
  retries: number
  rateLimit: {
    requests: number
    window: number
  }
  validation: {
    inputSchema?: object
    outputSchema?: object
  }
}

export interface ToolSchema {
  input: {
    type: "object"
    properties: Record<string, any>
    required: string[]
  }
  output: {
    type: "object"
    properties: Record<string, any>
  }
}

export interface ToolUsage {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageResponseTime: number
  lastUsedAt?: string
  errorRate: number
}

export interface Workflow {
  id: string
  name: string
  description?: string
  version: string
  companyId: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  configuration: WorkflowConfiguration
  status: "draft" | "active" | "paused" | "error"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkflowNode {
  id: string
  type: "input" | "agent" | "tool" | "output" | "condition" | "loop"
  position: { x: number; y: number }
  data: {
    label: string
    agentId?: string
    toolId?: string
    configuration?: Record<string, any>
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: "default" | "conditional"
  condition?: string
  animated?: boolean
}

export interface WorkflowConfiguration {
  strategy: "sequential" | "parallel" | "conditional"
  timeout: number
  retryPolicy: {
    maxRetries: number
    backoffStrategy: "linear" | "exponential"
  }
  errorHandling: "stop" | "continue" | "retry"
  logging: {
    level: "debug" | "info" | "warn" | "error"
    includeInputs: boolean
    includeOutputs: boolean
  }
}

export interface Task {
  id: string
  name: string
  description?: string
  type: "workflow" | "single_agent" | "batch"
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  companyId: string
  workflowId?: string
  agentId?: string
  input: any
  output?: any
  error?: string
  progress: number
  startedAt?: string
  completedAt?: string
  executionTime?: number
  createdBy: string
  createdAt: string
  updatedAt: string
}
