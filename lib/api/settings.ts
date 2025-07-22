import { api } from "./base"

export interface SystemSettings {
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
    templates: {
      id: string
      name: string
      type: string
      subject: string
      content: string
      variables: string[]
    }[]
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
    openai: {
      enabled: boolean
      apiKey: string
      endpoint: string
      settings: any
    }
    anthropic: {
      enabled: boolean
      apiKey: string
      endpoint: string
      settings: any
    }
    google: {
      enabled: boolean
      apiKey: string
      endpoint: string
      settings: any
    }
    aws: {
      enabled: boolean
      apiKey: string
      endpoint: string
      settings: any
    }
    stripe: {
      enabled: boolean
      apiKey: string
      endpoint: string
      settings: any
    }
  }
  features: {
    marketplaceEnabled: boolean
    collaborationEnabled: boolean
    analyticsEnabled: boolean
    auditLogEnabled: boolean
  }
}

export const settingsApi = {
  getSettings: () => api.get("/api/v1/settings"),
  updateSettings: (data: SystemSettings) => api.put("/api/v1/settings", data),
  getHealthStatus: () => api.get("/api/v1/settings/health"),
  createBackup: (includeData: boolean, includeFiles: boolean, compression: boolean, encryption: boolean) =>
    api.post("/api/v1/settings/backup", { includeData, includeFiles, compression, encryption }),
  getBackups: () => api.get("/api/v1/settings/backups"),
  restoreBackup: (backupId: string, restoreData: boolean, restoreFiles: boolean) =>
    api.post("/api/v1/settings/restore", { backupId, restoreData, restoreFiles }),
}
