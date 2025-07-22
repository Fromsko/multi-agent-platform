# 多智能体平台后端接口文档

## 概述

本文档定义了多智能体平台的完整后端接口规范，包括数据模型、API接口、认证授权、工作流执行等所有功能模块。平台采用Next.js App Router架构，提供RESTful API和WebSocket实时通信。

## 目录

1. [数据模型](#数据模型)
2. [认证授权](#认证授权)
3. [用户管理](#用户管理)
4. [公司管理](#公司管理)
5. [Agent管理](#agent管理)
6. [工具管理](#工具管理)
7. [工作流管理](#工作流管理)
8. [任务执行](#任务执行)
9. [监控日志](#监控日志)
10. [系统设置](#系统设置)
11. [WebSocket实时通信](#websocket实时通信)
12. [文件管理](#文件管理)
13. [仪表盘数据](#仪表盘数据)
14. [性能监控](#性能监控)

---

## 数据模型

### 用户模型 (User)

\`\`\`typescript
interface User {
  id: string
  email: string
  username: string
  password: string // 加密存储
  firstName: string
  lastName: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  permissions: Permission[]
  profile: UserProfile
  companies: string[] // 关联的公司ID
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

interface UserProfile {
  bio?: string
  company?: string
  location?: string
  website?: string
  timezone: string
  language: string
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    sidebarCollapsed: boolean
    notifications: NotificationSettings
    dashboard: DashboardSettings
  }
}

interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  slack: boolean
  webhook?: string
  taskCompletion: boolean
  systemAlerts: boolean
  weeklyReport: boolean
}

interface DashboardSettings {
  defaultView: 'overview' | 'companies' | 'agents' | 'tools'
  chartsEnabled: boolean
  refreshInterval: number // seconds
  compactMode: boolean
}
\`\`\`

### 公司模型 (Company)

\`\`\`typescript
interface Company {
  id: string
  name: string
  description?: string
  type: 'software' | 'research' | 'content' | 'consulting' | 'ecommerce' | 'finance' | 'healthcare' | 'education' | 'other'
  industry: 'technology' | 'finance' | 'healthcare' | 'education' | 'retail' | 'manufacturing' | 'consulting' | 'media' | 'other'
  status: 'active' | 'idle' | 'error' | 'maintenance' | 'paused'
  ownerId: string
  teamMembers: string[] // User IDs
  agents: Agent[]
  tools: Tool[]
  workflow: Workflow
  settings: CompanySettings
  metrics: CompanyMetrics
  tags: string[]
  logo?: string
  website?: string
  createdAt: Date
  updatedAt: Date
  lastActivityAt?: Date
}

interface CompanySettings {
  autoStart: boolean
  maxAgents: number
  maxTools: number
  maxConcurrency: number
  notifyOnCompletion: boolean
  apiRateLimit: number
  memorySize: number // GB
  visibility: 'private' | 'team' | 'public'
  webhookUrl?: string
  slackChannel?: string
  emailNotifications: boolean
  smsNotifications: boolean
  retryPolicy: {
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
    initialDelay: number
    maxDelay: number
  }
  security: {
    ipWhitelist: string[]
    requireMFA: boolean
    sessionTimeout: number
  }
  billing: {
    plan: 'free' | 'pro' | 'enterprise'
    monthlyLimit: number
    currentUsage: number
  }
}

interface CompanyMetrics {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  pendingTasks: number
  averageExecutionTime: number
  successRate: number
  lastExecutionAt?: Date
  resourceUsage: {
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
  costs: {
    monthly: number
    total: number
    breakdown: {
      compute: number
      storage: number
      api: number
    }
  }
  performance: {
    uptime: number
    responseTime: number
    throughput: number
  }
}
\`\`\`

### Agent模型

\`\`\`typescript
interface Agent {
  id: string
  name: string
  description: string
  type: 'conversational' | 'analytical' | 'creative' | 'technical' | 'customer_service' | 'data_processing' | 'custom'
  model: string // GPT-4, Claude, Gemini, etc.
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'custom'
  status: 'active' | 'idle' | 'error' | 'training' | 'updating'
  capabilities: string[]
  configuration: AgentConfiguration
  performance: AgentPerformance
  companyId?: string
  createdBy: string
  tags: string[]
  version: string
  isPublic: boolean
  rating: number
  reviews: AgentReview[]
  createdAt: Date
  updatedAt: Date
  lastUsedAt?: Date
}

interface AgentConfiguration {
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  tools: string[] // Tool IDs
  memorySize: number
  contextWindow: number
  responseFormat: 'text' | 'json' | 'structured'
  safety: {
    contentFilter: boolean
    toxicityThreshold: number
    biasDetection: boolean
    personalDataFilter: boolean
  }
  customInstructions: string[]
  knowledgeBase: {
    enabled: boolean
    sources: string[]
    updateFrequency: 'realtime' | 'daily' | 'weekly'
  }
  integrations: {
    slack: boolean
    discord: boolean
    telegram: boolean
    whatsapp: boolean
  }
}

interface AgentPerformance {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  averageTokensUsed: number
  lastUsedAt?: Date
  errorRate: number
  satisfactionScore?: number
  costPerRequest: number
  popularityScore: number
  trends: {
    daily: PerformanceMetric[]
    weekly: PerformanceMetric[]
    monthly: PerformanceMetric[]
  }
}

interface PerformanceMetric {
  date: string
  requests: number
  responseTime: number
  errorRate: number
  cost: number
}

interface AgentReview {
  id: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
}
\`\`\`

### 工具模型 (Tool)

\`\`\`typescript
interface Tool {
  id: string
  name: string
  description: string
  type: 'api' | 'database' | 'file' | 'code' | 'webhook' | 'scraper' | 'calculator' | 'translator' | 'custom'
  category: 'productivity' | 'data' | 'communication' | 'analysis' | 'automation' | 'integration' | 'utility'
  version: string
  status: 'active' | 'inactive' | 'deprecated' | 'error' | 'maintenance'
  configuration: ToolConfiguration
  schema: ToolSchema
  usage: ToolUsage
  documentation: ToolDocumentation
  pricing: ToolPricing
  createdBy: string
  tags: string[]
  isPublic: boolean
  rating: number
  downloads: number
  createdAt: Date
  updatedAt: Date
  lastUsedAt?: Date
}

interface ToolConfiguration {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  authentication: {
    type: 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth2'
    credentials?: Record<string, string>
  }
  timeout: number
  retries: number
  rateLimit: {
    requests: number
    window: number // seconds
  }
  validation: {
    inputSchema?: object
    outputSchema?: object
  }
  caching: {
    enabled: boolean
    ttl: number // seconds
    strategy: 'memory' | 'redis' | 'database'
  }
  monitoring: {
    enabled: boolean
    alertThreshold: number
    healthCheck: string
  }
}

interface ToolSchema {
  input: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
    examples: any[]
  }
  output: {
    type: 'object'
    properties: Record<string, any>
    examples: any[]
  }
}

interface ToolUsage {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageResponseTime: number
  lastUsedAt?: Date
  errorRate: number
  popularAgents: string[]
  trends: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
}

interface ToolDocumentation {
  readme: string
  examples: ToolExample[]
  changelog: ChangelogEntry[]
  faq: FAQEntry[]
}

interface ToolExample {
  title: string
  description: string
  input: any
  output: any
  code?: string
}

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
  breaking: boolean
}

interface FAQEntry {
  question: string
  answer: string
  category: string
}

interface ToolPricing {
  model: 'free' | 'usage' | 'subscription' | 'one_time'
  price: number
  currency: string
  unit?: string // per request, per month, etc.
  limits: {
    free: number
    paid: number
  }
}
\`\`\`

### 工作流模型 (Workflow)

\`\`\`typescript
interface Workflow {
  id: string
  name: string
  description?: string
  version: string
  companyId: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  configuration: WorkflowConfiguration
  status: 'draft' | 'active' | 'paused' | 'error' | 'archived'
  triggers: WorkflowTrigger[]
  schedule?: WorkflowSchedule
  createdBy: string
  tags: string[]
  isTemplate: boolean
  templateCategory?: string
  createdAt: Date
  updatedAt: Date
  lastExecutedAt?: Date
}

interface WorkflowNode {
  id: string
  type: 'input' | 'agent' | 'tool' | 'output' | 'condition' | 'loop' | 'delay' | 'webhook' | 'email'
  position: { x: number; y: number }
  data: {
    label: string
    agentId?: string
    toolId?: string
    configuration?: Record<string, any>
    conditions?: WorkflowCondition[]
  }
  style?: {
    backgroundColor?: string
    borderColor?: string
    color?: string
  }
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: 'default' | 'conditional' | 'success' | 'error'
  condition?: string
  animated?: boolean
  style?: {
    stroke?: string
    strokeWidth?: number
  }
}

interface WorkflowConfiguration {
  strategy: 'sequential' | 'parallel' | 'conditional' | 'hybrid'
  timeout: number
  retryPolicy: {
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
    retryableErrors: string[]
  }
  errorHandling: 'stop' | 'continue' | 'retry' | 'fallback'
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    includeInputs: boolean
    includeOutputs: boolean
    retention: number // days
  }
  notifications: {
    onStart: boolean
    onComplete: boolean
    onError: boolean
    channels: string[]
  }
  variables: Record<string, any>
  secrets: Record<string, string>
}

interface WorkflowTrigger {
  id: string
  type: 'manual' | 'schedule' | 'webhook' | 'event' | 'file'
  configuration: Record<string, any>
  enabled: boolean
}

interface WorkflowSchedule {
  enabled: boolean
  cron: string
  timezone: string
  nextRun?: Date
  lastRun?: Date
}

interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists'
  value: any
  logic?: 'and' | 'or'
}
\`\`\`

### 任务模型 (Task)

\`\`\`typescript
interface Task {
  id: string
  name: string
  description?: string
  type: 'workflow' | 'single_agent' | 'batch' | 'scheduled'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  companyId: string
  workflowId?: string
  agentId?: string
  input: any
  output?: any
  error?: TaskError
  progress: number // 0-100
  currentStep?: string
  totalSteps?: number
  startedAt?: Date
  completedAt?: Date
  executionTime?: number // milliseconds
  estimatedCompletion?: Date
  createdBy: string
  assignedTo?: string
  tags: string[]
  metadata: TaskMetadata
  createdAt: Date
  updatedAt: Date
}

interface TaskError {
  code: string
  message: string
  details?: any
  stack?: string
  recoverable: boolean
  retryCount: number
}

interface TaskMetadata {
  source: 'manual' | 'api' | 'schedule' | 'webhook'
  triggeredBy?: string
  parentTaskId?: string
  childTasks: string[]
  cost: number
  resourceUsage: {
    cpu: number
    memory: number
    tokens: number
  }
  performance: {
    queueTime: number
    executionTime: number
    totalTime: number
  }
}

interface TaskExecution {
  id: string
  taskId: string
  nodeId: string
  agentId?: string
  toolId?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  input: any
  output?: any
  error?: string
  startedAt: Date
  completedAt?: Date
  executionTime?: number
  retryCount: number
  metadata: {
    tokensUsed?: number
    model?: string
    cost?: number
    cacheHit?: boolean
  }
}
\`\`\`

---

## 认证授权

### JWT Token结构

\`\`\`typescript
interface JWTPayload {
  sub: string // user ID
  email: string
  username: string
  role: string
  permissions: string[]
  companies: string[]
  iat: number
  exp: number
  jti: string // JWT ID for revocation
}

interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastUsedAt?: Date
  deviceInfo?: string
  ipAddress?: string
}
\`\`\`

### 权限模型

\`\`\`typescript
interface Permission {
  id: string
  name: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage'
  conditions?: Record<string, any>
  scope: 'global' | 'company' | 'own'
}

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// 预定义权限
const PERMISSIONS = {
  // 用户管理
  'users:create': '创建用户',
  'users:read': '查看用户',
  'users:update': '更新用户',
  'users:delete': '删除用户',
  'users:manage': '管理用户',
  
  // 公司管理
  'companies:create': '创建公司',
  'companies:read': '查看公司',
  'companies:update': '更新公司',
  'companies:delete': '删除公司',
  'companies:execute': '执行公司任务',
  'companies:manage': '管理公司',
  
  // Agent管理
  'agents:create': '创建Agent',
  'agents:read': '查看Agent',
  'agents:update': '更新Agent',
  'agents:delete': '删除Agent',
  'agents:execute': '执行Agent',
  'agents:publish': '发布Agent',
  
  // 工具管理
  'tools:create': '创建工具',
  'tools:read': '查看工具',
  'tools:update': '更新工具',
  'tools:delete': '删除工具',
  'tools:execute': '执行工具',
  'tools:publish': '发布工具',
  
  // 工作流管理
  'workflows:create': '创建工作流',
  'workflows:read': '查看工作流',
  'workflows:update': '更新工作流',
  'workflows:delete': '删除工作流',
  'workflows:execute': '执行工作流',
  
  // 任务管理
  'tasks:create': '创建任务',
  'tasks:read': '查看任务',
  'tasks:update': '更新任务',
  'tasks:delete': '删除任务',
  'tasks:execute': '执行任务',
  'tasks:cancel': '取消任务',
  
  // 系统管理
  'system:read': '查看系统信息',
  'system:update': '更新系统设置',
  'system:manage': '管理系统',
  'logs:read': '查看日志',
  'metrics:read': '查看指标',
  'billing:read': '查看账单',
  'billing:manage': '管理账单',
}

// 预定义角色
const ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: Object.keys(PERMISSIONS)
  },
  ADMIN: {
    name: 'Admin',
    permissions: [
      'users:read', 'users:update',
      'companies:manage',
      'agents:manage',
      'tools:manage',
      'workflows:manage',
      'tasks:manage',
      'system:read',
      'logs:read',
      'metrics:read'
    ]
  },
  USER: {
    name: 'User',
    permissions: [
      'companies:create', 'companies:read', 'companies:update',
      'agents:create', 'agents:read', 'agents:update', 'agents:execute',
      'tools:create', 'tools:read', 'tools:update', 'tools:execute',
      'workflows:create', 'workflows:read', 'workflows:update', 'workflows:execute',
      'tasks:create', 'tasks:read', 'tasks:update', 'tasks:execute'
    ]
  },
  VIEWER: {
    name: 'Viewer',
    permissions: [
      'companies:read',
      'agents:read',
      'tools:read',
      'workflows:read',
      'tasks:read'
    ]
  }
}
\`\`\`

---

## API接口

### 基础响应格式

\`\`\`typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
    field?: string
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    timestamp: string
    version: string
    requestId: string
    executionTime: number
  }
}

interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}
\`\`\`

### 认证接口

#### POST /api/auth/register
注册新用户

**请求体:**
\`\`\`typescript
{
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  inviteCode?: string
}
\`\`\`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    user: Omit<User, 'password'>,
    token: string,
    refreshToken: string,
    expiresIn: number
  }
}
\`\`\`

#### POST /api/auth/login
用户登录

**请求体:**
\`\`\`typescript
{
  email: string
  password: string
  rememberMe?: boolean
  deviceInfo?: string
}
\`\`\`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    user: Omit<User, 'password'>,
    token: string,
    refreshToken: string,
    expiresIn: number
  }
}
\`\`\`

#### POST /api/auth/refresh
刷新访问令牌

**请求体:**
\`\`\`typescript
{
  refreshToken: string
}
\`\`\`

#### POST /api/auth/logout
用户登出

**请求体:**
\`\`\`typescript
{
  refreshToken?: string
  allDevices?: boolean
}
\`\`\`

#### POST /api/auth/forgot-password
忘记密码

**请求体:**
\`\`\`typescript
{
  email: string
}
\`\`\`

#### POST /api/auth/reset-password
重置密码

**请求体:**
\`\`\`typescript
{
  token: string
  password: string
}
\`\`\`

#### POST /api/auth/change-password
修改密码

**请求体:**
\`\`\`typescript
{
  currentPassword: string
  newPassword: string
}
\`\`\`

#### POST /api/auth/verify-email
验证邮箱

**请求体:**
\`\`\`typescript
{
  token: string
}
\`\`\`

### 用户管理接口

#### GET /api/users
获取用户列表

**查询参数:**
- `page?: number` - 页码
- `limit?: number` - 每页数量
- `search?: string` - 搜索关键词
- `role?: string` - 角色筛选
- `status?: string` - 状态筛选
- `sort?: string` - 排序字段
- `order?: 'asc' | 'desc'` - 排序方向

#### GET /api/users/me
获取当前用户信息

#### GET /api/users/:id
获取用户详情

#### PUT /api/users/:id
更新用户信息

**请求体:**
\`\`\`typescript
{
  firstName?: string
  lastName?: string
  avatar?: string
  profile?: Partial<UserProfile>
}
\`\`\`

#### DELETE /api/users/:id
删除用户

#### PUT /api/users/:id/role
更新用户角色

**请求体:**
\`\`\`typescript
{
  role: 'admin' | 'user' | 'viewer'
}
\`\`\`

#### PUT /api/users/:id/status
更新用户状态

**请求体:**
\`\`\`typescript
{
  status: 'active' | 'inactive' | 'suspended'
  reason?: string
}
\`\`\`

#### GET /api/users/:id/activity
获取用户活动记录

#### POST /api/users/:id/invite
邀请用户加入公司

**请求体:**
\`\`\`typescript
{
  companyId: string
  role: string
  message?: string
}
\`\`\`

### 公司管理接口

#### GET /api/companies
获取公司列表

**查询参数:**
- `page?: number`
- `limit?: number`
- `search?: string`
- `type?: string`
- `status?: string`
- `ownerId?: string`
- `industry?: string`
- `tags?: string[]`

#### POST /api/companies
创建公司

**请求体:**
\`\`\`typescript
{
  name: string
  description?: string
  type: string
  industry: string
  agents?: string[] // Agent IDs
  tools?: string[] // Tool IDs
  workflow?: {
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
  }
  settings?: Partial<CompanySettings>
  tags?: string[]
  logo?: string
  website?: string
}
\`\`\`

#### GET /api/companies/:id
获取公司详情

#### PUT /api/companies/:id
更新公司信息

#### DELETE /api/companies/:id
删除公司

#### POST /api/companies/:id/start
启动公司

#### POST /api/companies/:id/stop
停止公司

#### POST /api/companies/:id/pause
暂停公司

#### POST /api/companies/:id/resume
恢复公司

#### GET /api/companies/:id/metrics
获取公司指标

**查询参数:**
- `period?: 'hour' | 'day' | 'week' | 'month'`
- `startDate?: string`
- `endDate?: string`

#### GET /api/companies/:id/logs
获取公司日志

**查询参数:**
- `level?: string` - 日志级别
- `startDate?: string`
- `endDate?: string`
- `limit?: number`
- `search?: string`

#### GET /api/companies/:id/tasks
获取公司任务列表

#### POST /api/companies/:id/duplicate
复制公司

**请求体:**
\`\`\`typescript
{
  name: string
  includeData?: boolean
}
\`\`\`

#### POST /api/companies/:id/export
导出公司配置

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    company: Company,
    agents: Agent[],
    tools: Tool[],
    workflows: Workflow[]
  }
}
\`\`\`

#### POST /api/companies/:id/import
导入公司配置

**请求体:**
\`\`\`typescript
{
  data: {
    company: Partial<Company>,
    agents?: Agent[],
    tools?: Tool[],
    workflows?: Workflow[]
  }
  overwrite?: boolean
}
\`\`\`

### Agent管理接口

#### GET /api/agents
获取Agent列表

**查询参数:**
- `page?: number`
- `limit?: number`
- `search?: string`
- `type?: string`
- `status?: string`
- `companyId?: string`
- `tags?: string[]`
- `isPublic?: boolean`

#### POST /api/agents
创建Agent

**请求体:**
\`\`\`typescript
{
  name: string
  description: string
  type: string
  model: string
  provider: string
  capabilities: string[]
  configuration: AgentConfiguration
  companyId?: string
  tags?: string[]
  isPublic?: boolean
}
\`\`\`

#### GET /api/agents/:id
获取Agent详情

#### PUT /api/agents/:id
更新Agent

#### DELETE /api/agents/:id
删除Agent

#### POST /api/agents/:id/test
测试Agent

**请求体:**
\`\`\`typescript
{
  input: string
  context?: any
  tools?: string[]
}
\`\`\`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    output: string
    metadata: {
      tokensUsed: number
      responseTime: number
      model: string
      cost: number
    }
  }
}
\`\`\`

#### GET /api/agents/:id/performance
获取Agent性能数据

**查询参数:**
- `period?: 'hour' | 'day' | 'week' | 'month'`
- `metrics?: string[]`

#### POST /api/agents/:id/clone
克隆Agent

**请求体:**
\`\`\`typescript
{
  name: string
  companyId?: string
}
\`\`\`

#### POST /api/agents/:id/publish
发布Agent到市场

**请求体:**
\`\`\`typescript
{
  category: string
  pricing?: ToolPricing
  documentation: string
}
\`\`\`

#### POST /api/agents/:id/review
添加Agent评价

**请求体:**
\`\`\`typescript
{
  rating: number
  comment: string
}
\`\`\`

#### GET /api/agents/:id/reviews
获取Agent评价列表

#### POST /api/agents/:id/train
训练Agent

**请求体:**
\`\`\`typescript
{
  trainingData: any[]
  epochs?: number
  learningRate?: number
}
\`\`\`

### 工具管理接口

#### GET /api/tools
获取工具列表

**查询参数:**
- `page?: number`
- `limit?: number`
- `search?: string`
- `type?: string`
- `category?: string`
- `status?: string`
- `tags?: string[]`
- `isPublic?: boolean`

#### POST /api/tools
创建工具

**请求体:**
\`\`\`typescript
{
  name: string
  description: string
  type: string
  category: string
  configuration: ToolConfiguration
  schema: ToolSchema
  documentation?: Partial<ToolDocumentation>
  pricing?: ToolPricing
  tags?: string[]
  isPublic?: boolean
}
\`\`\`

#### GET /api/tools/:id
获取工具详情

#### PUT /api/tools/:id
更新工具

#### DELETE /api/tools/:id
删除工具

#### POST /api/tools/:id/test
测试工具

**请求体:**
\`\`\`typescript
{
  input: any
  validateSchema?: boolean
}
\`\`\`

#### GET /api/tools/:id/usage
获取工具使用统计

**查询参数:**
- `period?: 'hour' | 'day' | 'week' | 'month'`
- `groupBy?: 'agent' | 'company' | 'user'`

#### POST /api/tools/:id/install
安装工具到公司

**请求体:**
\`\`\`typescript
{
  companyId: string
  configuration?: Record<string, any>
}
\`\`\`

#### POST /api/tools/:id/uninstall
从公司卸载工具

**请求体:**
\`\`\`typescript
{
  companyId: string
}
\`\`\`

#### GET /api/tools/marketplace
获取工具市场列表

**查询参数:**
- `category?: string`
- `pricing?: 'free' | 'paid'`
- `rating?: number`
- `popular?: boolean`

### 工作流管理接口

#### GET /api/workflows
获取工作流列表

**查询参数:**
- `companyId?: string`
- `status?: string`
- `isTemplate?: boolean`
- `category?: string`

#### POST /api/workflows
创建工作流

**请求体:**
\`\`\`typescript
{
  name: string
  description?: string
  companyId: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  configuration: WorkflowConfiguration
  triggers?: WorkflowTrigger[]
  schedule?: WorkflowSchedule
  tags?: string[]
  isTemplate?: boolean
  templateCategory?: string
}
\`\`\`

#### GET /api/workflows/:id
获取工作流详情

#### PUT /api/workflows/:id
更新工作流

#### DELETE /api/workflows/:id
删除工作流

#### POST /api/workflows/:id/validate
验证工作流

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
    suggestions: string[]
  }
}

interface ValidationError {
  nodeId?: string
  edgeId?: string
  type: 'missing_connection' | 'invalid_config' | 'circular_dependency' | 'resource_limit'
  message: string
  severity: 'error' | 'warning'
}
\`\`\`

#### POST /api/workflows/:id/execute
执行工作流

**请求体:**
\`\`\`typescript
{
  input?: any
  variables?: Record<string, any>
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}
\`\`\`

#### POST /api/workflows/:id/export
导出工作流配置

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    version: string
    metadata: {
      exportedAt: string
      exportedBy: string
      platform: string
    }
    workflow: Workflow
    dependencies: {
      agents: Agent[]
      tools: Tool[]
    }
  }
}
\`\`\`

#### POST /api/workflows/:id/import
导入工作流配置

**请求体:**
\`\`\`typescript
{
  data: any
  overwrite?: boolean
  createDependencies?: boolean
}
\`\`\`

#### GET /api/workflows/:id/executions
获取工作流执行历史

#### POST /api/workflows/:id/schedule
设置工作流调度

**请求体:**
\`\`\`typescript
{
  enabled: boolean
  cron: string
  timezone: string
  variables?: Record<string, any>
}
\`\`\`

#### GET /api/workflows/templates
获取工作流模板

**查询参数:**
- `category?: string`
- `industry?: string`
- `complexity?: 'simple' | 'medium' | 'complex'`

### 任务执行接口

#### GET /api/tasks
获取任务列表

**查询参数:**
- `status?: string`
- `type?: string`
- `priority?: string`
- `companyId?: string`
- `assignedTo?: string`
- `createdBy?: string`
- `startDate?: string`
- `endDate?: string`

#### POST /api/tasks
创建任务

**请求体:**
\`\`\`typescript
{
  name: string
  description?: string
  type: 'workflow' | 'single_agent' | 'batch' | 'scheduled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  companyId: string
  workflowId?: string
  agentId?: string
  input: any
  assignedTo?: string
  tags?: string[]
  scheduledAt?: Date
}
\`\`\`

#### GET /api/tasks/:id
获取任务详情

#### PUT /api/tasks/:id
更新任务

#### DELETE /api/tasks/:id
删除任务

#### POST /api/tasks/:id/execute
执行任务

**请求体:**
\`\`\`typescript
{
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  variables?: Record<string, any>
}
\`\`\`

#### POST /api/tasks/:id/cancel
取消任务

**请求体:**
\`\`\`typescript
{
  reason?: string
}
\`\`\`

#### POST /api/tasks/:id/pause
暂停任务

#### POST /api/tasks/:id/resume
恢复任务

#### POST /api/tasks/:id/retry
重试任务

**请求体:**
\`\`\`typescript
{
  fromStep?: string
  resetProgress?: boolean
}
\`\`\`

#### GET /api/tasks/:id/executions
获取任务执行记录

#### GET /api/tasks/:id/logs
获取任务日志

**查询参数:**
- `level?: string`
- `startDate?: string`
- `endDate?: string`
- `nodeId?: string`

#### POST /api/tasks/batch
批量创建任务

**请求体:**
\`\`\`typescript
{
  tasks: Array<{
    name: string
    type: string
    companyId: string
    workflowId?: string
    agentId?: string
    input: any
    priority?: string
  }>
}
\`\`\`

#### GET /api/tasks/queue
获取任务队列状态

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    pending: number
    running: number
    completed: number
    failed: number
    totalCapacity: number
    usedCapacity: number
    estimatedWaitTime: number
  }
}
\`\`\`

### 仪表盘数据接口

#### GET /api/dashboard/stats
获取仪表盘统计数据

**查询参数:**
- `period?: 'today' | 'week' | 'month' | 'year'`
- `companyId?: string`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    overview: {
      totalCompanies: number
      activeCompanies: number
      totalAgents: number
      activeAgents: number
      totalTools: number
      totalTasks: number
      completedTasks: number
      failedTasks: number
      successRate: number
    }
    trends: {
      companies: TrendData[]
      agents: TrendData[]
      tasks: TrendData[]
      performance: TrendData[]
    }
    topPerformers: {
      companies: CompanyPerformance[]
      agents: AgentPerformance[]
      tools: ToolPerformance[]
    }
    recentActivity: Activity[]
  }
}

interface TrendData {
  date: string
  value: number
  change?: number
}

interface CompanyPerformance {
  id: string
  name: string
  successRate: number
  totalTasks: number
  averageTime: number
}

interface Activity {
  id: string
  type: 'task_completed' | 'agent_created' | 'company_started' | 'error_occurred'
  title: string
  description: string
  timestamp: Date
  userId?: string
  companyId?: string
}
\`\`\`

#### GET /api/dashboard/performance
获取性能数据

**查询参数:**
- `period?: 'hour' | 'day' | 'week' | 'month'`
- `metrics?: string[]`
- `companyId?: string`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    system: {
      cpu: number
      memory: number
      disk: number
      network: {
        inbound: number
        outbound: number
      }
    }
    application: {
      responseTime: number
      throughput: number
      errorRate: number
      uptime: number
    }
    business: {
      taskCompletionRate: number
      averageExecutionTime: number
      costPerTask: number
      userSatisfaction: number
    }
    trends: {
      responseTime: TrendData[]
      throughput: TrendData[]
      errorRate: TrendData[]
      costs: TrendData[]
    }
  }
}
\`\`\`

#### GET /api/dashboard/alerts
获取系统告警

**查询参数:**
- `severity?: 'low' | 'medium' | 'high' | 'critical'`
- `status?: 'active' | 'resolved' | 'acknowledged'`
- `limit?: number`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    alerts: Alert[]
    summary: {
      total: number
      critical: number
      high: number
      medium: number
      low: number
    }
  }
}

interface Alert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'acknowledged'
  source: string
  createdAt: Date
  resolvedAt?: Date
  acknowledgedBy?: string
}
\`\`\`

### 监控日志接口

#### GET /api/logs
获取系统日志

**查询参数:**
- `level?: 'debug' | 'info' | 'warn' | 'error'`
- `source?: string`
- `startDate?: string`
- `endDate?: string`
- `search?: string`
- `page?: number`
- `limit?: number`
- `userId?: string`
- `companyId?: string`
- `taskId?: string`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    logs: LogEntry[]
    aggregations: {
      byLevel: Record<string, number>
      bySource: Record<string, number>
      byHour: Array<{ hour: string, count: number }>
    }
  },
  pagination: PaginationInfo
}

interface LogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  source: string
  message: string
  details?: any
  userId?: string
  companyId?: string
  taskId?: string
  requestId?: string
  duration?: number
}
\`\`\`

#### GET /api/metrics/system
获取系统指标

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    timestamp: Date
    system: {
      cpu: {
        usage: number
        cores: number
        loadAverage: number[]
      }
      memory: {
        total: number
        used: number
        free: number
        cached: number
      }
      disk: {
        total: number
        used: number
        free: number
        iops: number
      }
      network: {
        inbound: number
        outbound: number
        connections: number
      }
    }
    application: {
      uptime: number
      version: string
      environment: string
      activeConnections: number
      queueSize: number
      cacheHitRate: number
    }
    database: {
      connections: number
      queryTime: number
      slowQueries: number
      size: number
    }
  }
}
\`\`\`

#### GET /api/metrics/performance
获取性能指标

**查询参数:**
- `startDate?: string`
- `endDate?: string`
- `granularity?: 'minute' | 'hour' | 'day' | 'week'`
- `metrics?: string[]`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    timeSeries: {
      [metric: string]: Array<{
        timestamp: Date
        value: number
      }>
    }
    summary: {
      [metric: string]: {
        min: number
        max: number
        avg: number
        p50: number
        p95: number
        p99: number
      }
    }
  }
}
\`\`\`

#### GET /api/metrics/business
获取业务指标

**查询参数:**
- `period?: 'day' | 'week' | 'month' | 'quarter' | 'year'`
- `companyId?: string`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    revenue: {
      total: number
      recurring: number
      growth: number
    }
    usage: {
      totalTasks: number
      totalAgents: number
      totalCompanies: number
      activeUsers: number
    }
    performance: {
      successRate: number
      averageResponseTime: number
      customerSatisfaction: number
      churnRate: number
    }
    costs: {
      infrastructure: number
      ai: number
      support: number
      total: number
    }
  }
}
\`\`\`

### 系统设置接口

#### GET /api/settings
获取系统设置

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    general: {
      siteName: string
      siteUrl: string
      adminEmail: string
      supportEmail: string
      timezone: string
      language: string
    }
    security: {
      passwordPolicy: {
        minLength: number
        requireUppercase: boolean
        requireLowercase: boolean
        requireNumbers: boolean
        requireSymbols: boolean
        maxAge: number
      }
      sessionTimeout: number
      maxLoginAttempts: number
      lockoutDuration: number
      mfaRequired: boolean
      ipWhitelist: string[]
    }
    notifications: {
      emailEnabled: boolean
      smsEnabled: boolean
      pushEnabled: boolean
      webhookEnabled: boolean
      slackEnabled: boolean
      templates: NotificationTemplate[]
    }
    limits: {
      maxUsersPerCompany: number
      maxAgentsPerCompany: number
      maxToolsPerCompany: number
      maxConcurrentTasks: number
      maxFileSize: number
      maxStoragePerUser: number
    }
    integrations: {
      openai: IntegrationConfig
      anthropic: IntegrationConfig
      google: IntegrationConfig
      aws: IntegrationConfig
      stripe: IntegrationConfig
    }
    features: {
      marketplaceEnabled: boolean
      collaborationEnabled: boolean
      analyticsEnabled: boolean
      auditLogEnabled: boolean
    }
  }
}

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'webhook'
  subject: string
  content: string
  variables: string[]
}

interface IntegrationConfig {
  enabled: boolean
  apiKey?: string
  endpoint?: string
  settings: Record<string, any>
}
\`\`\`

#### PUT /api/settings
更新系统设置

**请求体:**
\`\`\`typescript
{
  general?: Partial<GeneralSettings>
  security?: Partial<SecuritySettings>
  notifications?: Partial<NotificationSettings>
  limits?: Partial<LimitSettings>
  integrations?: Partial<IntegrationSettings>
  features?: Partial<FeatureSettings>
}
\`\`\`

#### GET /api/settings/health
系统健康检查

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    version: string
    uptime: number
    timestamp: Date
    services: {
      database: ServiceStatus
      redis: ServiceStatus
      queue: ServiceStatus
      storage: ServiceStatus
      ai: ServiceStatus
      email: ServiceStatus
    }
    checks: HealthCheck[]
  }
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded'
  responseTime?: number
  lastCheck: Date
  error?: string
}

interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message?: string
  duration: number
  timestamp: Date
}
\`\`\`

#### POST /api/settings/backup
创建系统备份

**请求体:**
\`\`\`typescript
{
  includeData: boolean
  includeFiles: boolean
  compression: boolean
  encryption: boolean
}
\`\`\`

#### GET /api/settings/backups
获取备份列表

#### POST /api/settings/restore
恢复系统备份

**请求体:**
\`\`\`typescript
{
  backupId: string
  restoreData: boolean
  restoreFiles: boolean
}
\`\`\`

---

## WebSocket实时通信

### 连接端点
\`\`\`
ws://localhost:3000/api/ws
wss://yourdomain.com/api/ws (生产环境)
\`\`\`

### 认证
WebSocket连接需要在查询参数中提供JWT token：
\`\`\`
ws://localhost:3000/api/ws?token=<jwt_token>
\`\`\`

### 消息格式

\`\`\`typescript
interface WebSocketMessage {
  id: string
  type: string
  payload: any
  timestamp: string
  userId?: string
  companyId?: string
}

interface WebSocketResponse {
  id?: string // 对应请求消息的ID
  type: string
  payload: any
  timestamp: string
  error?: {
    code: string
    message: string
  }
}
\`\`\`

### 连接管理

\`\`\`typescript
interface ConnectionInfo {
  id: string
  userId: string
  companyId?: string
  connectedAt: Date
  lastActivity: Date
  subscriptions: string[]
  metadata: {
    userAgent: string
    ipAddress: string
    location?: string
  }
}
\`\`\`

### 消息类型

#### 客户端发送

1. **订阅事件**
\`\`\`typescript
{
  type: 'subscribe',
  payload: {
    events: [
      'task:progress',
      'company:status',
      'agent:activity',
      'system:alert',
      'user:notification'
    ]
    filters?: {
      companyId?: string
      agentId?: string
      taskId?: string
      userId?: string
    }
  }
}
\`\`\`

2. **取消订阅**
\`\`\`typescript
{
  type: 'unsubscribe',
  payload: {
    events: ['task:progress']
  }
}
\`\`\`

3. **心跳**
\`\`\`typescript
{
  type: 'ping',
  payload: {
    timestamp: Date
  }
}
\`\`\`

4. **加入房间**
\`\`\`typescript
{
  type: 'join_room',
  payload: {
    room: string // company:123, task:456, etc.
  }
}
\`\`\`

5. **离开房间**
\`\`\`typescript
{
  type: 'leave_room',
  payload: {
    room: string
  }
}
\`\`\`

6. **发送消息**
\`\`\`typescript
{
  type: 'send_message',
  payload: {
    room: string
    message: string
    metadata?: any
  }
}
\`\`\`

#### 服务端发送

1. **任务进度更新**
\`\`\`typescript
{
  type: 'task:progress',
  payload: {
    taskId: string
    progress: number
    status: 'pending' | 'running' | 'completed' | 'failed'
    currentStep?: string
    totalSteps?: number
    message?: string
    estimatedCompletion?: Date
    metadata?: {
      tokensUsed?: number
      cost?: number
    }
  }
}
\`\`\`

2. **公司状态变更**
\`\`\`typescript
{
  type: 'company:status',
  payload: {
    companyId: string
    status: 'active' | 'idle' | 'error' | 'maintenance'
    message?: string
    metrics?: {
      activeTasks: number
      queueSize: number
      resourceUsage: number
    }
  }
}
\`\`\`

3. **Agent活动**
\`\`\`typescript
{
  type: 'agent:activity',
  payload: {
    agentId: string
    activity: 'started' | 'completed' | 'error' | 'idle'
    details?: {
      taskId?: string
      input?: string
      output?: string
      error?: string
      duration?: number
    }
  }
}
\`\`\`

4. **系统通知**
\`\`\`typescript
{
  type: 'notification',
  payload: {
    id: string
    level: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    category: 'system' | 'task' | 'billing' | 'security'
    actions?: Array<{
      label: string
      action: string
      style?: 'primary' | 'secondary' | 'danger'
    }>
    persistent?: boolean
    autoClose?: number // seconds
  }
}
\`\`\`

5. **系统告警**
\`\`\`typescript
{
  type: 'system:alert',
  payload: {
    id: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    source: string
    affectedServices: string[]
    recommendedActions: string[]
    timestamp: Date
  }
}
\`\`\`

6. **用户通知**
\`\`\`typescript
{
  type: 'user:notification',
  payload: {
    id: string
    type: 'mention' | 'assignment' | 'completion' | 'error' | 'invitation'
    title: string
    message: string
    data?: any
    read: boolean
    createdAt: Date
  }
}
\`\`\`

7. **实时聊天消息**
\`\`\`typescript
{
  type: 'chat:message',
  payload: {
    id: string
    room: string
    userId: string
    username: string
    avatar?: string
    message: string
    timestamp: Date
    edited?: boolean
    replyTo?: string
  }
}
\`\`\`

8. **心跳响应**
\`\`\`typescript
{
  type: 'pong',
  payload: {
    timestamp: Date
    serverTime: Date
  }
}
\`\`\`

9. **连接状态**
\`\`\`typescript
{
  type: 'connection:status',
  payload: {
    status: 'connected' | 'disconnected' | 'reconnecting'
    reason?: string
    retryIn?: number
  }
}
\`\`\`

10. **房间更新**
\`\`\`typescript
{
  type: 'room:update',
  payload: {
    room: string
    action: 'joined' | 'left' | 'updated'
    userId?: string
    memberCount: number
    members?: Array<{
      userId: string
      username: string
      status: 'online' | 'away' | 'busy'
    }>
  }
}
\`\`\`

### 房间管理

\`\`\`typescript
interface Room {
  id: string
  type: 'company' | 'task' | 'agent' | 'global'
  name: string
  members: Set<string> // User IDs
  metadata: {
    createdAt: Date
    lastActivity: Date
    messageCount: number
  }
}

// 房间命名规则
const ROOM_PATTERNS = {
  company: 'company:{companyId}',
  task: 'task:{taskId}',
  agent: 'agent:{agentId}',
  user: 'user:{userId}',
  global: 'global',
  admin: 'admin'
}
\`\`\`

### 错误处理

\`\`\`typescript
interface WebSocketError {
  code: string
  message: string
  details?: any
  recoverable: boolean
}

const WS_ERROR_CODES = {
  AUTHENTICATION_FAILED: 'WS_001',
  INVALID_MESSAGE_FORMAT: 'WS_002',
  SUBSCRIPTION_FAILED: 'WS_003',
  ROOM_ACCESS_DENIED: 'WS_004',
  RATE_LIMIT_EXCEEDED: 'WS_005',
  SERVER_ERROR: 'WS_006',
  CONNECTION_LOST: 'WS_007',
  INVALID_TOKEN: 'WS_008',
  PERMISSION_DENIED: 'WS_009',
  RESOURCE_NOT_FOUND: 'WS_010'
}
\`\`\`

---

## 文件管理

### 上传接口

#### POST /api/files/upload
上传文件

**请求:** multipart/form-data
- `file: File` - 文件
- `type?: string` - 文件类型 (avatar, document, image, video, audio, etc.)
- `metadata?: string` - JSON格式的元数据
- `companyId?: string` - 关联的公司ID
- `private?: boolean` - 是否私有文件

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    thumbnailUrl?: string
    metadata?: {
      width?: number
      height?: number
      duration?: number
      pages?: number
    }
    uploadedBy: string
    companyId?: string
    private: boolean
    createdAt: Date
  }
}
\`\`\`

#### POST /api/files/upload/chunk
分块上传大文件

**请求:** multipart/form-data
- `chunk: File` - 文件块
- `chunkIndex: number` - 块索引
- `totalChunks: number` - 总块数
- `fileId: string` - 文件ID
- `filename: string` - 文件名

#### POST /api/files/upload/complete
完成分块上传

**请求体:**
\`\`\`typescript
{
  fileId: string
  totalChunks: number
  metadata?: any
}
\`\`\`

#### GET /api/files
获取文件列表

**查询参数:**
- `type?: string`
- `companyId?: string`
- `private?: boolean`
- `search?: string`
- `page?: number`
- `limit?: number`

#### GET /api/files/:id
获取文件信息

#### PUT /api/files/:id
更新文件信息

**请求体:**
\`\`\`typescript
{
  filename?: string
  metadata?: any
  private?: boolean
  tags?: string[]
}
\`\`\`

#### DELETE /api/files/:id
删除文件

#### GET /api/files/:id/download
下载文件

**查询参数:**
- `inline?: boolean` - 是否内联显示
- `thumbnail?: boolean` - 是否下载缩略图

#### POST /api/files/:id/share
分享文件

**请求体:**
\`\`\`typescript
{
  expiresAt?: Date
  password?: string
  allowDownload?: boolean
  allowPreview?: boolean
}
\`\`\`

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    shareId: string
    shareUrl: string
    expiresAt?: Date
    protected: boolean
  }
}
\`\`\`

#### GET /api/files/shared/:shareId
访问分享文件

#### POST /api/files/batch/delete
批量删除文件

**请求体:**
\`\`\`typescript
{
  fileIds: string[]
}
\`\`\`

#### GET /api/files/storage/usage
获取存储使用情况

**响应:**
\`\`\`typescript
{
  success: true,
  data: {
    totalUsed: number
    totalLimit: number
    byType: Record<string, number>
    byCompany: Record<string, number>
    recentUploads: FileInfo[]
  }
}
\`\`\`

---

## 错误代码

\`\`\`typescript
enum ErrorCodes {
  // 认证错误 (1000-1099)
  UNAUTHORIZED = 'AUTH_001',
  INVALID_TOKEN = 'AUTH_002',
  TOKEN_EXPIRED = 'AUTH_003',
  INSUFFICIENT_PERMISSIONS = 'AUTH_004',
  ACCOUNT_LOCKED = 'AUTH_005',
  INVALID_CREDENTIALS = 'AUTH_006',
  MFA_REQUIRED = 'AUTH_007',
  EMAIL_NOT_VERIFIED = 'AUTH_008',
  
  // 验证错误 (1100-1199)
  VALIDATION_ERROR = 'VAL_001',
  REQUIRED_FIELD_MISSING = 'VAL_002',
  INVALID_FORMAT = 'VAL_003',
  INVALID_EMAIL = 'VAL_004',
  WEAK_PASSWORD = 'VAL_005',
  DUPLICATE_VALUE = 'VAL_006',
  INVALID_FILE_TYPE = 'VAL_007',
  FILE_TOO_LARGE = 'VAL_008',
  
  // 资源错误 (1200-1299)
  RESOURCE_NOT_FOUND = 'RES_001',
  RESOURCE_ALREADY_EXISTS = 'RES_002',
  RESOURCE_IN_USE = 'RES_003',
  RESOURCE_LIMIT_EXCEEDED = 'RES_004',
  RESOURCE_LOCKED = 'RES_005',
  RESOURCE_EXPIRED = 'RES_006',
  
  // 业务逻辑错误 (1300-1399)
  WORKFLOW_INVALID = 'BIZ_001',
  AGENT_UNAVAILABLE = 'BIZ_002',
  TOOL_ERROR = 'BIZ_003',
  EXECUTION_FAILED = 'BIZ_004',
  QUOTA_EXCEEDED = 'BIZ_005',
  PAYMENT_REQUIRED = 'BIZ_006',
  FEATURE_DISABLED = 'BIZ_007',
  MAINTENANCE_MODE = 'BIZ_008',
  
  // 系统错误 (1400-1499)
  INTERNAL_ERROR = 'SYS_001',
  DATABASE_ERROR = 'SYS_002',
  EXTERNAL_SERVICE_ERROR = 'SYS_003',
  RATE_LIMIT_EXCEEDED = 'SYS_004',
  SERVICE_UNAVAILABLE = 'SYS_005',
  TIMEOUT_ERROR = 'SYS_006',
  NETWORK_ERROR = 'SYS_007',
  STORAGE_ERROR = 'SYS_008',
}

interface ErrorResponse {
  success: false
  error: {
    code: ErrorCodes
    message: string
    details?: any
    field?: string
    timestamp: string
    requestId: string
  }
}
\`\`\`

---

## 数据库设计

### 表结构

#### users
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar TEXT,
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  profile JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login_at TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email_verified ON users(email_verified);
\`\`\`

#### companies
\`\`\`sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  industry VARCHAR(50),
  status VARCHAR(20) DEFAULT 'idle',
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_members UUID[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  logo TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP
);

CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_type ON companies(type);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_tags ON companies USING GIN(tags);
\`\`\`

#### agents
\`\`\`sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'idle',
  capabilities TEXT[] DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  performance JSONB DEFAULT '{}',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  version VARCHAR(20) DEFAULT '1.0.0',
  is_public BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX idx_agents_company_id ON agents(company_id);
CREATE INDEX idx_agents_created_by ON agents(created_by);
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_provider ON agents(provider);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_is_public ON agents(is_public);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX idx_agents_rating ON agents(rating);
\`\`\`

#### tools
\`\`\`sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  status VARCHAR(20) DEFAULT 'active',
  configuration JSONB DEFAULT '{}',
  schema JSONB DEFAULT '{}',
  usage JSONB DEFAULT '{}',
  documentation JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX idx_tools_created_by ON tools(created_by);
CREATE INDEX idx_tools_type ON tools(type);
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_is_public ON tools(is_public);
CREATE INDEX idx_tools_tags ON tools USING GIN(tags);
CREATE INDEX idx_tools_rating ON tools(rating);
CREATE INDEX idx_tools_downloads ON tools(downloads);
\`\`\`

#### workflows
\`\`\`sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft',
  triggers JSONB DEFAULT '[]',
  schedule JSONB,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  template_category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_executed_at TIMESTAMP
);

CREATE INDEX idx_workflows_company_id ON workflows(company_id);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_is_template ON workflows(is_template);
CREATE INDEX idx_workflows_template_category ON workflows(template_category);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
\`\`\`

#### tasks
\`\`\`sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  input JSONB,
  output JSONB,
  error JSONB,
  progress INTEGER DEFAULT 0,
  current_step VARCHAR(255),
  total_steps INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  execution_time INTEGER,
  estimated_completion TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_workflow_id ON tasks(workflow_id);
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
\`\`\`

#### task_executions
\`\`\`sql
CREATE TABLE task_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  node_id VARCHAR(255) NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  execution_time INTEGER,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_task_executions_task_id ON task_executions(task_id);
CREATE INDEX idx_task_executions_agent_id ON task_executions(agent_id);
CREATE INDEX idx_task_executions_tool_id ON task_executions(tool_id);
CREATE INDEX idx_task_executions_status ON task_executions(status);
CREATE INDEX idx_task_executions_started_at ON task_executions(started_at);
\`\`\`

#### files
\`\`\`sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  private BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_company_id ON files(company_id);
CREATE INDEX idx_files_type ON files(type);
CREATE INDEX idx_files_private ON files(private);
CREATE INDEX idx_files_tags ON files USING GIN(tags);
CREATE INDEX idx_files_created_at ON files(created_at);
\`\`\`

#### file_shares
\`\`\`sql
CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  share_id VARCHAR(255) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP,
  password_hash VARCHAR(255),
  allow_download BOOLEAN DEFAULT TRUE,
  allow_preview BOOLEAN DEFAULT TRUE,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX idx_file_shares_share_id ON file_shares(share_id);
CREATE INDEX idx_file_shares_created_by ON file_shares(created_by);
CREATE INDEX idx_file_shares_expires_at ON file_shares(expires_at);
\`\`\`

#### logs
\`\`\`sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL,
  source VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  request_id VARCHAR(255),
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_source ON logs(source);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_company_id ON logs(company_id);
CREATE INDEX idx_logs_task_id ON logs(task_id);
CREATE INDEX idx_logs_request_id ON logs(request_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);
\`\`\`

#### notifications
\`\`\`sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  category VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'medium',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
\`\`\`

#### refresh_tokens
\`\`\`sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
\`\`\`

#### agent_reviews
\`\`\`sql
CREATE TABLE agent_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

CREATE INDEX idx_agent_reviews_agent_id ON agent_reviews(agent_id);
CREATE INDEX idx_agent_reviews_user_id ON agent_reviews(user_id);
CREATE INDEX idx_agent_reviews_rating ON agent_reviews(rating);
\`\`\`

#### tool_reviews
\`\`\`sql
CREATE TABLE tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

CREATE INDEX idx_tool_reviews_tool_id ON tool_reviews(tool_id);
CREATE INDEX idx_tool_reviews_user_id ON tool_reviews(user_id);
CREATE INDEX idx_tool_reviews_rating ON tool_reviews(rating);
\`\`\`

---

## 部署配置

### 环境变量

\`\`\`bash
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/multi_agent_platform
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# 服务配置
PORT=3000
NODE_ENV=production
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# WebSocket配置
WS_PORT=3001
WS_HEARTBEAT_INTERVAL=30000
WS_CONNECTION_TIMEOUT=60000

# 外部服务
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# 文件存储
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket
AWS_S3_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain

# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# 短信服务
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# 支付服务
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# 监控
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
METRICS_ENABLED=true

# 限流
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false

# 缓存
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# 安全
CORS_ORIGIN=https://yourdomain.com
HELMET_ENABLED=true
CSRF_ENABLED=true

# 功能开关
MARKETPLACE_ENABLED=true
COLLABORATION_ENABLED=true
ANALYTICS_ENABLED=true
AUDIT_LOG_ENABLED=true
\`\`\`

### Docker配置

\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### docker-compose.yml

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/multi_agent_platform
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=multi_agent_platform
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
\`\`\`

---

## 安全考虑

### 数据加密
- 密码使用bcrypt加密存储（成本因子12+）
- 敏感配置信息使用AES-256-GCM加密
- 数据库连接使用SSL/TLS
- API通信强制使用HTTPS
- 文件存储加密（静态加密）

### API安全
- 所有API端点需要认证（除公开端点）
- JWT token签名验证
- 使用CORS限制跨域访问
- 实施速率限制（滑动窗口算法）
- 输入验证和清理（防XSS）
- SQL注入防护（参数化查询）
- CSRF保护
- 请求大小限制

### 权限控制
- 基于角色的访问控制(RBAC)
- 资源级权限检查
- API密钥管理和轮换
- 审计日志记录
- 最小权限原则
- 权限继承和委托

### 会话管理
- 安全的会话令牌生成
- 会话超时机制
- 并发会话限制
- 设备指纹识别
- 异常登录检测

---

## 性能优化

### 数据库优化
- 适当的索引设计（B-tree, GIN, GIST）
- 查询优化（EXPLAIN ANALYZE）
- 连接池配置（pgBouncer）
- 读写分离
- 分区表（按时间分区）
- 定期VACUUM和ANALYZE

### 缓存策略
- Redis缓存热点数据
- API响应缓存（HTTP缓存头）
- 会话缓存
- 查询结果缓存
- CDN静态资源缓存
- 应用级缓存（内存缓存）

### 异步处理
- 任务队列（Bull/BullMQ）
- 后台作业处理
- 事件驱动架构
- 消息队列（Redis Streams）
- 批处理优化
- 并发控制

### 前端优化
- 代码分割和懒加载
- 图片优化和压缩
- 静态资源压缩
- 浏览器缓存策略
- Service Worker
- 预加载关键资源

---

## 监控和日志

### 应用监控
- 健康检查端点
- 性能指标收集（Prometheus）
- 错误追踪（Sentry）
- 实时告警（PagerDuty）
- 用户体验监控
- 业务指标监控

### 日志管理
- 结构化日志（JSON格式）
- 日志级别控制
- 日志轮转和归档
- 集中化日志收集（ELK Stack）
- 日志搜索和分析
- 敏感信息脱敏

### 指标收集
- 业务指标（KPI）
- 系统指标（CPU、内存、磁盘）
- 应用指标（响应时间、吞吐量）
- 用户行为分析
- 性能基准测试
- 容量规划

### 告警机制
- 多级告警（信息、警告、严重、紧急）
- 告警聚合和去重
- 告警升级机制
- 多渠道通知（邮件、短信、Slack）
- 告警抑制和静默
- 自动恢复检测

---

## 备份和恢复

### 数据备份
- 定期全量备份
- 增量备份
- 事务日志备份
- 跨区域备份
- 备份加密
- 备份完整性验证

### 恢复策略
- 点时间恢复（PITR）
- 灾难恢复计划
- 故障转移机制
- 数据一致性检查
- 恢复测试
- RTO/RPO目标

---

这个完整的后端接口文档涵盖了多智能体平台的所有核心功能，包括详细的数据模型、API接口、安全机制、性能优化、监控日志等方面。文档提供了完整的技术规范，可以作为后端开发的详细指南.
