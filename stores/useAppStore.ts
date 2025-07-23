import {
  mockDataStore,
  type Activity,
  type Agent,
  type ApiKey,
  type Company,
  type Log,
  type Performance,
  type Prompt,
  type Tool,
} from "@/lib/mock-data"
import toast from "react-hot-toast"
import { create } from "zustand"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "viewer"
  avatar: string
  status: "active" | "inactive"
  lastLogin: string
  createdAt: string
  permissions: string[]
}

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    timezone: string
    language: string
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    requireTwoFactor: boolean
    passwordMinLength: number
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    fromEmail: string
  }
  api: {
    rateLimit: number
    maxRequestSize: number
    enableCors: boolean
    allowedOrigins: string[]
  }
  storage: {
    provider: string
    maxFileSize: number
    allowedFileTypes: string[]
    retentionDays: number
  }
}

interface AppState {
  // Data
  companies: Company[]
  agents: Agent[]
  apiKeys: ApiKey[]
  tools: Tool[]
  prompts: Prompt[]
  logs: Log[]
  performance: Performance[]
  activities: Activity[]
  users: User[]
  systemSettings: SystemSettings

  // UI State
  isLoading: boolean
  selectedCompany: Company | null
  selectedAgent: Agent | null

  // WebSocket
  // wsConnected 状态已移除，使用 WebSocketContext 中的 connected 状态代替

  // Actions
  setLoading: (loading: boolean) => void
  // setWsConnected 已移除

  // Company actions
  loadCompanies: () => void
  createCompany: (company: Omit<Company, "id">) => Promise<boolean>
  updateCompany: (id: string, updates: Partial<Company>) => Promise<boolean>
  deleteCompany: (id: string) => Promise<boolean>
  setSelectedCompany: (company: Company | null) => void

  // Agent actions
  loadAgents: () => void
  createAgent: (agent: Omit<Agent, "id">) => Promise<boolean>
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<boolean>
  deleteAgent: (id: string) => Promise<boolean>
  setSelectedAgent: (agent: Agent | null) => void

  // API Key actions
  loadApiKeys: () => void
  createApiKey: (apiKey: Omit<ApiKey, "id">) => Promise<boolean>
  updateApiKey: (id: string, updates: Partial<ApiKey>) => Promise<boolean>
  deleteApiKey: (id: string) => Promise<boolean>

  // Tool actions
  loadTools: () => void
  createTool: (tool: Omit<Tool, "id">) => Promise<boolean>
  updateTool: (id: string, updates: Partial<Tool>) => Promise<boolean>
  deleteTool: (id: string) => Promise<boolean>

  // Prompt actions
  loadPrompts: () => void
  createPrompt: (prompt: Omit<Prompt, "id">) => Promise<boolean>
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<boolean>
  deletePrompt: (id: string) => Promise<boolean>

  // Log actions
  loadLogs: () => void
  addLog: (log: Omit<Log, "id">) => void

  // Performance actions
  loadPerformance: () => void
  addPerformanceData: (data: Performance) => void

  // Activity actions
  loadActivities: () => void
  addActivity: (activity: Omit<Activity, "id">) => void

  // User actions
  loadUsers: () => void
  createUser: (user: Omit<User, "id">) => Promise<boolean>
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>

  // System settings actions
  loadSystemSettings: () => void
  updateSystemSettings: (settings: SystemSettings) => Promise<boolean>
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  companies: [],
  agents: [],
  apiKeys: [],
  tools: [],
  prompts: [],
  logs: [],
  performance: [],
  activities: [],
  users: [],
  systemSettings: {
    general: {
      siteName: "",
      siteDescription: "",
      timezone: "",
      language: "",
    },
    security: {
      sessionTimeout: 0,
      maxLoginAttempts: 0,
      requireTwoFactor: false,
      passwordMinLength: 0,
    },
    email: {
      smtpHost: "",
      smtpPort: 0,
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "",
    },
    api: {
      rateLimit: 0,
      maxRequestSize: 0,
      enableCors: false,
      allowedOrigins: [],
    },
    storage: {
      provider: "",
      maxFileSize: 0,
      allowedFileTypes: [],
      retentionDays: 0,
    },
  },
  isLoading: false,
  selectedCompany: null,
  selectedAgent: null,

  // Basic actions
  setLoading: (loading) => set({ isLoading: loading }),

  // Company actions
  loadCompanies: () => {
    const companies = mockDataStore.getCompanies()
    set({ companies })
  },

  createCompany: async (company) => {
    try {
      const newCompany = mockDataStore.createCompany(company)
      set((state) => ({ companies: [...state.companies, newCompany] }))
      toast.success("公司创建成功")
      return true
    } catch (error) {
      toast.error("公司创建失败")
      return false
    }
  },

  updateCompany: async (id, updates) => {
    try {
      const updatedCompany = mockDataStore.updateCompany(id, updates)
      if (updatedCompany) {
        set((state) => ({
          companies: state.companies.map((c) => (c.id === id ? updatedCompany : c)),
        }))
        toast.success("公司更新成功")
        return true
      }
      toast.error("公司更新失败")
      return false
    } catch (error) {
      toast.error("公司更新失败")
      return false
    }
  },

  deleteCompany: async (id) => {
    try {
      const success = mockDataStore.deleteCompany(id)
      if (success) {
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id),
        }))
        toast.success("公司删除成功")
        return true
      }
      toast.error("公司删除失败")
      return false
    } catch (error) {
      toast.error("公司删除失败")
      return false
    }
  },

  setSelectedCompany: (company) => set({ selectedCompany: company }),

  // Agent actions
  loadAgents: () => {
    const agents = mockDataStore.getAgents()
    set({ agents })
  },

  createAgent: async (agent) => {
    try {
      const newAgent = mockDataStore.createAgent(agent)
      set((state) => ({ agents: [...state.agents, newAgent] }))
      toast.success("智能体创建成功")
      return true
    } catch (error) {
      toast.error("智能体创建失败")
      return false
    }
  },

  updateAgent: async (id, updates) => {
    try {
      const updatedAgent = mockDataStore.updateAgent(id, updates)
      if (updatedAgent) {
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? updatedAgent : a)),
        }))
        toast.success("智能体更新成功")
        return true
      }
      toast.error("智能体更新失败")
      return false
    } catch (error) {
      toast.error("智能体更新失败")
      return false
    }
  },

  deleteAgent: async (id) => {
    try {
      const success = mockDataStore.deleteAgent(id)
      if (success) {
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
        }))
        toast.success("智能体删除成功")
        return true
      }
      toast.error("智能体删除失败")
      return false
    } catch (error) {
      toast.error("智能体删除失败")
      return false
    }
  },

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  // API Key actions
  loadApiKeys: () => {
    const apiKeys = mockDataStore.getApiKeys()
    set({ apiKeys })
  },

  createApiKey: async (apiKey) => {
    try {
      const newApiKey = mockDataStore.createApiKey(apiKey)
      set((state) => ({ apiKeys: [...state.apiKeys, newApiKey] }))
      toast.success("API密钥创建成功")
      return true
    } catch (error) {
      toast.error("API密钥创建失败")
      return false
    }
  },

  updateApiKey: async (id, updates) => {
    try {
      const updatedApiKey = mockDataStore.updateApiKey(id, updates)
      if (updatedApiKey) {
        set((state) => ({
          apiKeys: state.apiKeys.map((k) => (k.id === id ? updatedApiKey : k)),
        }))
        toast.success("API密钥更新成功")
        return true
      }
      toast.error("API密钥更新失败")
      return false
    } catch (error) {
      toast.error("API密钥更新失败")
      return false
    }
  },

  deleteApiKey: async (id) => {
    try {
      const success = mockDataStore.deleteApiKey(id)
      if (success) {
        set((state) => ({
          apiKeys: state.apiKeys.filter((k) => k.id !== id),
        }))
        toast.success("API密钥删除成功")
        return true
      }
      toast.error("API密钥删除失败")
      return false
    } catch (error) {
      toast.error("API密钥删除失败")
      return false
    }
  },

  // Tool actions
  loadTools: () => {
    const tools = mockDataStore.getTools()
    set({ tools })
  },

  createTool: async (tool) => {
    try {
      const newTool = mockDataStore.createTool(tool)
      set((state) => ({ tools: [...state.tools, newTool] }))
      toast.success("工具创建成功")
      return true
    } catch (error) {
      toast.error("工具创建失败")
      return false
    }
  },

  updateTool: async (id, updates) => {
    try {
      const updatedTool = mockDataStore.updateTool(id, updates)
      if (updatedTool) {
        set((state) => ({
          tools: state.tools.map((t) => (t.id === id ? updatedTool : t)),
        }))
        toast.success("工具更新成功")
        return true
      }
      toast.error("工具更新失败")
      return false
    } catch (error) {
      toast.error("工具更新失败")
      return false
    }
  },

  deleteTool: async (id) => {
    try {
      const success = mockDataStore.deleteTool(id)
      if (success) {
        set((state) => ({
          tools: state.tools.filter((t) => t.id !== id),
        }))
        toast.success("工具删除成功")
        return true
      }
      toast.error("工具删除失败")
      return false
    } catch (error) {
      toast.error("工具删除失败")
      return false
    }
  },

  // Prompt actions
  loadPrompts: () => {
    const prompts = mockDataStore.getPrompts()
    set({ prompts })
  },

  createPrompt: async (prompt) => {
    try {
      const newPrompt = mockDataStore.createPrompt(prompt)
      set((state) => ({ prompts: [...state.prompts, newPrompt] }))
      toast.success("提示词创建成功")
      return true
    } catch (error) {
      toast.error("提示词创建失败")
      return false
    }
  },

  updatePrompt: async (id, updates) => {
    try {
      const updatedPrompt = mockDataStore.updatePrompt(id, updates)
      if (updatedPrompt) {
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === id ? updatedPrompt : p)),
        }))
        toast.success("提示词更新成功")
        return true
      }
      toast.error("提示词更新失败")
      return false
    } catch (error) {
      toast.error("提示词更新失败")
      return false
    }
  },

  deletePrompt: async (id) => {
    try {
      const success = mockDataStore.deletePrompt(id)
      if (success) {
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
        }))
        toast.success("提示词删除成功")
        return true
      }
      toast.error("提示词删除失败")
      return false
    } catch (error) {
      toast.error("提示词删除失败")
      return false
    }
  },

  // Log actions
  loadLogs: () => {
    const logs = mockDataStore.getLogs()
    set({ logs })
  },

  addLog: (log) => {
    const newLog = mockDataStore.addLog(log)
    set((state) => ({ logs: [newLog, ...state.logs] }))
  },

  // Performance actions
  loadPerformance: () => {
    const performance = mockDataStore.getPerformance()
    set({ performance })
  },

  addPerformanceData: (data) => {
    mockDataStore.addPerformanceData(data)
    set((state) => ({ performance: [...state.performance, data] }))
  },

  // Activity actions
  loadActivities: () => {
    const activities = mockDataStore.getActivities()
    set({ activities })
  },

  addActivity: (activity) => {
    const newActivity = mockDataStore.addActivity(activity)
    set((state) => ({ activities: [newActivity, ...state.activities] }))
  },

  // User actions
  loadUsers: () => {
    // Mock users data
    const users: User[] = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "active",
        lastLogin: "2024-01-15T10:30:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        permissions: ["all"],
      },
    ]
    set({ users })
  },

  createUser: async (user) => {
    try {
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
      }
      set((state) => ({ users: [...state.users, newUser] }))
      toast.success("用户创建成功")
      return true
    } catch (error) {
      toast.error("用户创建失败")
      return false
    }
  },

  updateUser: async (id, updates) => {
    try {
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      }))
      toast.success("用户更新成功")
      return true
    } catch (error) {
      toast.error("用户更新失败")
      return false
    }
  },

  deleteUser: async (id) => {
    try {
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }))
      toast.success("用户删除成功")
      return true
    } catch (error) {
      toast.error("用户删除失败")
      return false
    }
  },

  // System settings actions
  loadSystemSettings: () => {
    const settings: SystemSettings = {
      general: {
        siteName: "Multi-Agent Platform",
        siteDescription: "AI-powered multi-agent collaboration platform",
        timezone: "Asia/Shanghai",
        language: "zh-CN",
      },
      security: {
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        requireTwoFactor: false,
        passwordMinLength: 8,
      },
      email: {
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUser: "noreply@example.com",
        smtpPassword: "",
        fromEmail: "noreply@example.com",
      },
      api: {
        rateLimit: 1000,
        maxRequestSize: 10485760,
        enableCors: true,
        allowedOrigins: ["*"],
      },
      storage: {
        provider: "local",
        maxFileSize: 52428800,
        allowedFileTypes: ["jpg", "png", "pdf", "doc", "docx"],
        retentionDays: 90,
      },
    }
    set({ systemSettings: settings })
  },

  updateSystemSettings: async (settings) => {
    try {
      set({ systemSettings: settings })
      toast.success("系统设置更新成功")
      return true
    } catch (error) {
      toast.error("系统设置更新失败")
      return false
    }
  },
}))
