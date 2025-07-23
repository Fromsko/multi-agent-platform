import companiesData from "@/mock/companies.json"
import agentsData from "@/mock/agents.json"
import apiKeysData from "@/mock/api-keys.json"
import toolsData from "@/mock/tools.json"
import promptsData from "@/mock/prompts.json"
import logsData from "@/mock/logs.json"
import performanceData from "@/mock/performance.json"
import activitiesData from "@/mock/activities.json"

export interface Company {
  id: string
  name: string
  type: string
  description: string
  agents: number
  status: "active" | "idle" | "maintenance"
  currentProject: string
  progress: number
  createdAt: string
  lastActivity: string
  revenue: number
  tasks: {
    completed: number
    inProgress: number
    pending: number
  }
}

export interface Agent {
  id: string
  name: string
  description: string
  type: string
  status: "active" | "idle" | "running" | "error"
  lastActivity: string
  interactions: number
  successRate: number
  avatar: string
  companyId: string
  skills: string[]
  config: {
    temperature: number
    maxTokens: number
    memoryLength: number
  }
  createdAt: string
}

export interface ApiKey {
  id: string
  name: string
  provider: string
  key: string
  status: "active" | "inactive" | "expired"
  usage: {
    current: number
    limit: number
  }
  createdAt: string
  lastUsed: string
}

export interface Tool {
  id: string
  name: string
  description: string
  type: string
  status: "active" | "inactive" | "maintenance"
  provider: string
  config: Record<string, any>
  usage: {
    calls: number
    errors: number
    avgResponseTime: number
  }
  createdAt: string
}

export interface Prompt {
  id: string
  name: string
  description: string
  category: string
  content: string
  variables: string[]
  usage: number
  rating: number
  createdAt: string
  updatedAt: string
}

export interface Log {
  id: string
  timestamp: string
  agentId: string
  agentName: string
  type: string
  status: "success" | "error" | "warning"
  duration: number
  tokens: {
    input: number
    output: number
  }
  cost: number
  request: Record<string, any>
  response?: Record<string, any>
  error?: {
    code: string
    message: string
  }
}

export interface Performance {
  timestamp: string
  tasks: number
  efficiency: number
  responseTime: number
  errorRate: number
  activeAgents: number
}

export interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
  companyId?: string
  companyName?: string
  agentId?: string
  agentName?: string
  metadata?: Record<string, any>
}

// Mock data store
class MockDataStore {
  private companies: Company[] = companiesData.companies
  private agents: Agent[] = agentsData.agents
  private apiKeys: ApiKey[] = apiKeysData.apiKeys
  private tools: Tool[] = toolsData.tools
  private prompts: Prompt[] = promptsData.prompts
  private logs: Log[] = Array.isArray(logsData) ? logsData : []
  private performance: Performance[] = performanceData.performance
  private activities: Activity[] = activitiesData.activities

  // Companies
  getCompanies(): Company[] {
    return this.companies
  }

  getCompanyById(id: string): Company | undefined {
    return this.companies.find((c) => c.id === id)
  }

  createCompany(company: Omit<Company, "id">): Company {
    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
    }
    this.companies.push(newCompany)
    return newCompany
  }

  updateCompany(id: string, updates: Partial<Company>): Company | undefined {
    const index = this.companies.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.companies[index] = { ...this.companies[index], ...updates }
      return this.companies[index]
    }
    return undefined
  }

  deleteCompany(id: string): boolean {
    const index = this.companies.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.companies.splice(index, 1)
      return true
    }
    return false
  }

  // Agents
  getAgents(): Agent[] {
    return this.agents
  }

  getAgentById(id: string): Agent | undefined {
    return this.agents.find((a) => a.id === id)
  }

  getAgentsByCompany(companyId: string): Agent[] {
    return this.agents.filter((a) => a.companyId === companyId)
  }

  createAgent(agent: Omit<Agent, "id">): Agent {
    const newAgent: Agent = {
      ...agent,
      id: Date.now().toString(),
    }
    this.agents.push(newAgent)
    return newAgent
  }

  updateAgent(id: string, updates: Partial<Agent>): Agent | undefined {
    const index = this.agents.findIndex((a) => a.id === id)
    if (index !== -1) {
      this.agents[index] = { ...this.agents[index], ...updates }
      return this.agents[index]
    }
    return undefined
  }

  deleteAgent(id: string): boolean {
    const index = this.agents.findIndex((a) => a.id === id)
    if (index !== -1) {
      this.agents.splice(index, 1)
      return true
    }
    return false
  }

  // API Keys
  getApiKeys(): ApiKey[] {
    return this.apiKeys
  }

  getApiKeyById(id: string): ApiKey | undefined {
    return this.apiKeys.find((k) => k.id === id)
  }

  createApiKey(apiKey: Omit<ApiKey, "id">): ApiKey {
    const newApiKey: ApiKey = {
      ...apiKey,
      id: Date.now().toString(),
    }
    this.apiKeys.push(newApiKey)
    return newApiKey
  }

  updateApiKey(id: string, updates: Partial<ApiKey>): ApiKey | undefined {
    const index = this.apiKeys.findIndex((k) => k.id === id)
    if (index !== -1) {
      this.apiKeys[index] = { ...this.apiKeys[index], ...updates }
      return this.apiKeys[index]
    }
    return undefined
  }

  deleteApiKey(id: string): boolean {
    const index = this.apiKeys.findIndex((k) => k.id === id)
    if (index !== -1) {
      this.apiKeys.splice(index, 1)
      return true
    }
    return false
  }

  // Tools
  getTools(): Tool[] {
    return this.tools
  }

  getToolById(id: string): Tool | undefined {
    return this.tools.find((t) => t.id === id)
  }

  createTool(tool: Omit<Tool, "id">): Tool {
    const newTool: Tool = {
      ...tool,
      id: Date.now().toString(),
    }
    this.tools.push(newTool)
    return newTool
  }

  updateTool(id: string, updates: Partial<Tool>): Tool | undefined {
    const index = this.tools.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.tools[index] = { ...this.tools[index], ...updates }
      return this.tools[index]
    }
    return undefined
  }

  deleteTool(id: string): boolean {
    const index = this.tools.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.tools.splice(index, 1)
      return true
    }
    return false
  }

  // Prompts
  getPrompts(): Prompt[] {
    return this.prompts
  }

  getPromptById(id: string): Prompt | undefined {
    return this.prompts.find((p) => p.id === id)
  }

  createPrompt(prompt: Omit<Prompt, "id">): Prompt {
    const newPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(),
    }
    this.prompts.push(newPrompt)
    return newPrompt
  }

  updatePrompt(id: string, updates: Partial<Prompt>): Prompt | undefined {
    const index = this.prompts.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.prompts[index] = { ...this.prompts[index], ...updates }
      return this.prompts[index]
    }
    return undefined
  }

  deletePrompt(id: string): boolean {
    const index = this.prompts.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.prompts.splice(index, 1)
      return true
    }
    return false
  }

  // Logs
  getLogs(): Log[] {
    return this.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getLogById(id: string): Log | undefined {
    return this.logs.find((l) => l.id === id)
  }

  addLog(log: Omit<Log, "id">): Log {
    const newLog: Log = {
      ...log,
      id: Date.now().toString(),
    }
    this.logs.unshift(newLog)
    return newLog
  }

  // Performance
  getPerformance(): Performance[] {
    return this.performance
  }

  addPerformanceData(data: Performance): void {
    this.performance.push(data)
    // Keep only last 24 hours of data
    if (this.performance.length > 24) {
      this.performance.shift()
    }
  }

  // Activities
  getActivities(): Activity[] {
    return this.activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  addActivity(activity: Omit<Activity, "id">): Activity {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
    }
    this.activities.unshift(newActivity)
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities.pop()
    }
    return newActivity
  }

  // Stats
  getStats() {
    return {
      totalCompanies: this.companies.length,
      totalAgents: this.agents.length,
      activeProjects: this.companies.filter((c) => c.status === "active").length,
      completedTasks: this.companies.reduce((sum, c) => sum + c.tasks.completed, 0),
    }
  }
}

export const mockDataStore = new MockDataStore()
