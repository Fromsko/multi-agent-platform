// 统一的数据类型定义，与后端API保持一致

// 基础类型
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// 用户相关类型
export interface User extends BaseEntity {
  email: string
  username: string
  first_name: string
  last_name: string
  full_name?: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  profile?: UserProfile
  preferences?: UserPreferences
  email_verified?: boolean
  last_login_at?: string
}

export interface UserProfile {
  bio?: string
  company?: string
  location?: string
  website?: string
  timezone: string
  language: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  slack: boolean
  webhook?: string
}

// 认证相关类型
export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
  device_info?: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  invite_code?: string
}

export interface AuthResponse {
  user: User
  token: string
  refresh_token: string
  expires_in: number
}

// 公司相关类型
export interface Company extends BaseEntity {
  name: string
  description?: string
  type: 'software' | 'research' | 'content' | 'consulting' | 'other'
  industry: 'technology' | 'finance' | 'healthcare' | 'education' | 'retail' | 'manufacturing' | 'other'
  status: 'active' | 'idle' | 'error' | 'maintenance'
  owner_id: string
  settings: CompanySettings
  metrics?: CompanyMetrics
}

export interface CompanySettings {
  auto_start: boolean
  max_agents: number
  max_tools: number
  max_concurrency: number
  notify_on_completion: boolean
  api_rate_limit: number
  memory_size: number
  visibility: 'private' | 'team' | 'public'
  webhook_url?: string
  slack_channel?: string
  email_notifications: boolean
  sms_notifications: boolean
  retry_policy: {
    max_retries: number
    backoff_strategy: 'linear' | 'exponential'
    initial_delay: number
  }
}

export interface CompanyMetrics {
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  average_execution_time: number
  success_rate: number
  last_execution_at?: string
  resource_usage: {
    cpu: number
    memory: number
    storage: number
  }
}

// Agent相关类型
export interface Agent extends BaseEntity {
  name: string
  description: string
  type: 'conversational' | 'analytical' | 'creative' | 'technical' | 'custom'
  model: string
  status: 'active' | 'idle' | 'error' | 'training'
  capabilities: string[]
  configuration: AgentConfiguration
  performance?: AgentPerformance
  company_id?: string
  created_by: string
}

export interface AgentConfiguration {
  system_prompt: string
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  stop_sequences: string[]
  tools: string[]
  memory_size: number
  context_window: number
  response_format: 'text' | 'json' | 'structured'
  safety: {
    content_filter: boolean
    toxicity_threshold: number
    bias_detection: boolean
  }
}

export interface AgentPerformance {
  total_requests: number
  successful_requests: number
  failed_requests: number
  average_response_time: number
  average_tokens_used: number
  last_used_at?: string
  error_rate: number
  satisfaction_score?: number
}

// 工具相关类型
export interface Tool extends BaseEntity {
  name: string
  description: string
  type: 'api' | 'database' | 'file' | 'code' | 'webhook' | 'custom'
  version: string
  status: 'active' | 'inactive' | 'deprecated' | 'error'
  configuration: ToolConfiguration
  schema: ToolSchema
  usage?: ToolUsage
  created_by: string
}

export interface ToolConfiguration {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  authentication: {
    type: 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth2'
    credentials?: Record<string, string>
  }
  timeout: number
  retries: number
  rate_limit: {
    requests: number
    window: number
  }
  validation: {
    input_schema?: object
    output_schema?: object
  }
}

export interface ToolSchema {
  input: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
  output: {
    type: 'object'
    properties: Record<string, any>
  }
}

export interface ToolUsage {
  total_calls: number
  successful_calls: number
  failed_calls: number
  average_response_time: number
  last_used_at?: string
  error_rate: number
}

// 工作流相关类型
export interface Workflow extends BaseEntity {
  name: string
  description?: string
  version: string
  company_id: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  configuration: WorkflowConfiguration
  status: 'draft' | 'active' | 'paused' | 'error'
  created_by: string
}

export interface WorkflowNode {
  id: string
  type: 'input' | 'agent' | 'tool' | 'output' | 'condition' | 'loop'
  position: { x: number; y: number }
  data: {
    label: string
    agent_id?: string
    tool_id?: string
    configuration?: Record<string, any>
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: 'default' | 'conditional'
  condition?: string
  animated?: boolean
}

export interface WorkflowConfiguration {
  strategy: 'sequential' | 'parallel' | 'conditional'
  timeout: number
  retry_policy: {
    max_retries: number
    backoff_strategy: 'linear' | 'exponential'
  }
  error_handling: 'stop' | 'continue' | 'retry'
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    include_inputs: boolean
    include_outputs: boolean
  }
}

// 任务相关类型
export interface Task extends BaseEntity {
  name: string
  description?: string
  type: 'workflow' | 'single_agent' | 'batch'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  company_id: string
  workflow_id?: string
  agent_id?: string
  input: any
  output?: any
  error?: string
  progress: number
  started_at?: string
  completed_at?: string
  execution_time?: number
  created_by: string
}

// 文件相关类型
export interface File extends BaseEntity {
  name: string
  original_name: string
  size: number
  mime_type: string
  path: string
  url?: string
  metadata?: Record<string, any>
  uploaded_by: string
  company_id?: string
}

// 日志相关类型
export interface Log extends BaseEntity {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  source: string
  source_id?: string
  user_id?: string
  company_id?: string
  agent_id?: string
  task_id?: string
  metadata?: Record<string, any>
  timestamp: string
}

// 通知相关类型
export interface Notification extends BaseEntity {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  user_id: string
  metadata?: Record<string, any>
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
  timestamp: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// 筛选参数
export interface FilterParams {
  search?: string
  status?: string
  type?: string
  created_after?: string
  created_before?: string
  [key: string]: any
}

// 列表查询参数
export interface ListParams extends PaginationParams, FilterParams {}

// WebSocket消息类型
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export interface AgentStatusUpdate {
  agent_id: string
  status: Agent['status']
  message?: string
}

export interface TaskProgress {
  task_id: string
  progress: number
  status: Task['status']
  message?: string
}

export interface CompanyActivity {
  company_id: string
  type: string
  message: string
  metadata?: Record<string, any>
}