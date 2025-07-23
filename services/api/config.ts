// API配置文件
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    ME: '/api/v1/auth/me',
  },
  // 用户管理
  USERS: {
    LIST: '/api/v1/users',
    ME: '/api/v1/users/me',
    DETAIL: (id: string) => `/api/v1/users/${id}`,
    UPDATE: (id: string) => `/api/v1/users/${id}`,
    DELETE: (id: string) => `/api/v1/users/${id}`,
    UPDATE_ROLE: (id: string) => `/api/v1/users/${id}/role`,
    UPDATE_STATUS: (id: string) => `/api/v1/users/${id}/status`,
    ACTIVITY: (id: string) => `/api/v1/users/${id}/activity`,
    INVITE: (id: string) => `/api/v1/users/${id}/invite`,
  },
  // 公司管理
  COMPANIES: {
    LIST: '/api/v1/companies',
    CREATE: '/api/v1/companies',
    DETAIL: (id: string) => `/api/v1/companies/${id}`,
    UPDATE: (id: string) => `/api/v1/companies/${id}`,
    DELETE: (id: string) => `/api/v1/companies/${id}`,
    START: (id: string) => `/api/v1/companies/${id}/start`,
    STOP: (id: string) => `/api/v1/companies/${id}/stop`,
    METRICS: (id: string) => `/api/v1/companies/${id}/metrics`,
    DUPLICATE: (id: string) => `/api/v1/companies/${id}/duplicate`,
    EXPORT: (id: string) => `/api/v1/companies/${id}/export`,
    IMPORT: (id: string) => `/api/v1/companies/${id}/import`,
  },
  // Agent管理
  AGENTS: {
    LIST: '/api/v1/agents',
    CREATE: '/api/v1/agents',
    DETAIL: (id: string) => `/api/v1/agents/${id}`,
    UPDATE: (id: string) => `/api/v1/agents/${id}`,
    DELETE: (id: string) => `/api/v1/agents/${id}`,
    START: (id: string) => `/api/v1/agents/${id}/start`,
    STOP: (id: string) => `/api/v1/agents/${id}/stop`,
    CHAT: (id: string) => `/api/v1/agents/${id}/chat`,
    METRICS: (id: string) => `/api/v1/agents/${id}/metrics`,
    LOGS: (id: string) => `/api/v1/agents/${id}/logs`,
    DUPLICATE: (id: string) => `/api/v1/agents/${id}/duplicate`,
    EXPORT: (id: string) => `/api/v1/agents/${id}/export`,
    IMPORT: (id: string) => `/api/v1/agents/${id}/import`,
  },
  // 工具管理
  TOOLS: {
    LIST: '/api/v1/tools',
    CREATE: '/api/v1/tools',
    DETAIL: (id: string) => `/api/v1/tools/${id}`,
    UPDATE: (id: string) => `/api/v1/tools/${id}`,
    DELETE: (id: string) => `/api/v1/tools/${id}`,
    TEST: (id: string) => `/api/v1/tools/${id}/test`,
    USAGE: (id: string) => `/api/v1/tools/${id}/usage`,
    VERSIONS: (id: string) => `/api/v1/tools/${id}/versions`,
  },
  // 工作流管理
  WORKFLOWS: {
    LIST: '/api/v1/workflows',
    CREATE: '/api/v1/workflows',
    DETAIL: (id: string) => `/api/v1/workflows/${id}`,
    UPDATE: (id: string) => `/api/v1/workflows/${id}`,
    DELETE: (id: string) => `/api/v1/workflows/${id}`,
    EXECUTE: (id: string) => `/api/v1/workflows/${id}/execute`,
    STOP: (id: string) => `/api/v1/workflows/${id}/stop`,
    LOGS: (id: string) => `/api/v1/workflows/${id}/logs`,
    DUPLICATE: (id: string) => `/api/v1/workflows/${id}/duplicate`,
    EXPORT: (id: string) => `/api/v1/workflows/${id}/export`,
    IMPORT: (id: string) => `/api/v1/workflows/${id}/import`,
  },
  // 任务管理
  TASKS: {
    LIST: '/api/v1/tasks',
    CREATE: '/api/v1/tasks',
    DETAIL: (id: string) => `/api/v1/tasks/${id}`,
    UPDATE: (id: string) => `/api/v1/tasks/${id}`,
    DELETE: (id: string) => `/api/v1/tasks/${id}`,
    CANCEL: (id: string) => `/api/v1/tasks/${id}/cancel`,
    RETRY: (id: string) => `/api/v1/tasks/${id}/retry`,
    LOGS: (id: string) => `/api/v1/tasks/${id}/logs`,
  },
  // 文件管理
  FILES: {
    LIST: '/api/v1/files',
    UPLOAD: '/api/v1/files/upload',
    DETAIL: (id: string) => `/api/v1/files/${id}`,
    DOWNLOAD: (id: string) => `/api/v1/files/${id}/download`,
    DELETE: (id: string) => `/api/v1/files/${id}`,
    SHARE: (id: string) => `/api/v1/files/${id}/share`,
  },
  // 日志管理
  LOGS: {
    LIST: '/api/v1/logs',
    DETAIL: (id: string) => `/api/v1/logs/${id}`,
    EXPORT: '/api/v1/logs/export',
  },
  // 通知管理
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ: '/api/v1/notifications/read-all',
    DELETE: (id: string) => `/api/v1/notifications/${id}`,
    SETTINGS: '/api/v1/notifications/settings',
  },
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const