import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // 侧边栏状态
  sidebarCollapsed: boolean
  sidebarWidth: number
  
  // 主题设置
  theme: 'light' | 'dark' | 'system'
  
  // 布局设置
  layout: 'default' | 'compact' | 'comfortable'
  
  // 弹窗状态
  modals: {
    [key: string]: boolean
  }
  
  // 抽屉状态
  drawers: {
    [key: string]: boolean
  }
  
  // 加载状态
  globalLoading: boolean
  loadingStates: {
    [key: string]: boolean
  }
  
  // 通知设置
  notifications: {
    enabled: boolean
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    duration: number
  }
  
  // 表格设置
  tableSettings: {
    [key: string]: {
      pageSize: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      hiddenColumns: string[]
      columnWidths: { [key: string]: number }
    }
  }
  
  // 面包屑
  breadcrumbs: Array<{
    label: string
    href?: string
    icon?: string
  }>
  
  // 操作
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void
  setTheme: (theme: UIState['theme']) => void
  setLayout: (layout: UIState['layout']) => void
  openModal: (key: string) => void
  closeModal: (key: string) => void
  toggleModal: (key: string) => void
  openDrawer: (key: string) => void
  closeDrawer: (key: string) => void
  toggleDrawer: (key: string) => void
  setGlobalLoading: (loading: boolean) => void
  setLoading: (key: string, loading: boolean) => void
  updateNotificationSettings: (settings: Partial<UIState['notifications']>) => void
  updateTableSettings: (tableKey: string, settings: Partial<UIState['tableSettings'][string]>) => void
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void
  addBreadcrumb: (breadcrumb: UIState['breadcrumbs'][0]) => void
  resetUI: () => void
}

const initialState = {
  sidebarCollapsed: false,
  sidebarWidth: 280,
  theme: 'system' as const,
  layout: 'default' as const,
  modals: {},
  drawers: {},
  globalLoading: false,
  loadingStates: {},
  notifications: {
    enabled: true,
    position: 'top-right' as const,
    duration: 4000,
  },
  tableSettings: {},
  breadcrumbs: [],
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 切换侧边栏
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },
      
      // 设置侧边栏折叠状态
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },
      
      // 设置侧边栏宽度
      setSidebarWidth: (width: number) => {
        set({ sidebarWidth: Math.max(200, Math.min(400, width)) })
      },
      
      // 设置主题
      setTheme: (theme: UIState['theme']) => {
        set({ theme })
        
        // 应用主题到document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark')
        } else {
          // system theme
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (isDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      
      // 设置布局
      setLayout: (layout: UIState['layout']) => {
        set({ layout })
      },
      
      // 打开弹窗
      openModal: (key: string) => {
        set(state => ({
          modals: { ...state.modals, [key]: true }
        }))
      },
      
      // 关闭弹窗
      closeModal: (key: string) => {
        set(state => ({
          modals: { ...state.modals, [key]: false }
        }))
      },
      
      // 切换弹窗
      toggleModal: (key: string) => {
        const { modals } = get()
        const isOpen = modals[key] || false
        
        set(state => ({
          modals: { ...state.modals, [key]: !isOpen }
        }))
      },
      
      // 打开抽屉
      openDrawer: (key: string) => {
        set(state => ({
          drawers: { ...state.drawers, [key]: true }
        }))
      },
      
      // 关闭抽屉
      closeDrawer: (key: string) => {
        set(state => ({
          drawers: { ...state.drawers, [key]: false }
        }))
      },
      
      // 切换抽屉
      toggleDrawer: (key: string) => {
        const { drawers } = get()
        const isOpen = drawers[key] || false
        
        set(state => ({
          drawers: { ...state.drawers, [key]: !isOpen }
        }))
      },
      
      // 设置全局加载状态
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading })
      },
      
      // 设置特定加载状态
      setLoading: (key: string, loading: boolean) => {
        set(state => ({
          loadingStates: { ...state.loadingStates, [key]: loading }
        }))
      },
      
      // 更新通知设置
      updateNotificationSettings: (settings: Partial<UIState['notifications']>) => {
        set(state => ({
          notifications: { ...state.notifications, ...settings }
        }))
      },
      
      // 更新表格设置
      updateTableSettings: (tableKey: string, settings: Partial<UIState['tableSettings'][string]>) => {
        set(state => ({
          tableSettings: {
            ...state.tableSettings,
            [tableKey]: {
              pageSize: 20,
              hiddenColumns: [],
              columnWidths: {},
              ...state.tableSettings[tableKey],
              ...settings,
            }
          }
        }))
      },
      
      // 设置面包屑
      setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => {
        set({ breadcrumbs })
      },
      
      // 添加面包屑
      addBreadcrumb: (breadcrumb: UIState['breadcrumbs'][0]) => {
        set(state => ({
          breadcrumbs: [...state.breadcrumbs, breadcrumb]
        }))
      },
      
      // 重置UI状态
      resetUI: () => {
        set(initialState)
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        theme: state.theme,
        layout: state.layout,
        notifications: state.notifications,
        tableSettings: state.tableSettings,
      }),
    }
  )
)

// UI状态选择器
export const useUISelectors = () => {
  const store = useUIStore()
  
  return {
    // 是否有任何弹窗打开
    hasOpenModal: Object.values(store.modals).some(Boolean),
    
    // 是否有任何抽屉打开
    hasOpenDrawer: Object.values(store.drawers).some(Boolean),
    
    // 是否有任何加载状态
    hasAnyLoading: store.globalLoading || Object.values(store.loadingStates).some(Boolean),
    
    // 获取特定弹窗状态
    isModalOpen: (key: string) => store.modals[key] || false,
    
    // 获取特定抽屉状态
    isDrawerOpen: (key: string) => store.drawers[key] || false,
    
    // 获取特定加载状态
    isLoading: (key: string) => store.loadingStates[key] || false,
    
    // 获取表格设置
    getTableSettings: (tableKey: string) => store.tableSettings[tableKey] || {
      pageSize: 20,
      hiddenColumns: [],
      columnWidths: {},
    },
  }
}

// 主题监听hook
import { useEffect } from 'react'

export const useThemeWatcher = () => {
  const { theme, setTheme } = useUIStore()
  
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      // 初始设置
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [theme])
}