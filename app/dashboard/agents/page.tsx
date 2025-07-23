'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Types and Services
import { Agent } from '@/services/types'
import { useAgent } from '@/hooks/useAgent'
import { AgentList } from '@/components/agent/AgentList'
import { AgentForm } from '@/components/agent/AgentForm'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function AgentsPage() {
  const {
    agents,
    isLoading,
    error,
    pagination,
    selectedAgents,
    searchQuery,
    filters,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    duplicateAgent,
    startAgent,
    stopAgent,
    batchOperation,
    deleteAgents,
    clearSelection,
    setSearchQuery,
    setFilters,
    toggleAgentSelection,
    selectAllAgents,
    setCurrentAgent,
  } = useAgent()

  // Extract individual filter values for backward compatibility
  const loading = isLoading
  const statusFilter = filters?.status
  const typeFilter = filters?.type
  const sortBy = filters?.sortBy
  const sortOrder = filters?.sortOrder
  const viewMode = filters?.viewMode

  // Helper functions for backward compatibility
  const setStatusFilter = (status: string) => setFilters({ ...filters, status })
  const setTypeFilter = (type: string) => setFilters({ ...filters, type })
  const setSortBy = (sort: string) => setFilters({ ...filters, sortBy: sort })
  const setSortOrder = (order: string) => setFilters({ ...filters, sortOrder: order })
  const setViewMode = (mode: string) => setFilters({ ...filters, viewMode: mode })
  const selectAgent = (agentId: string, selected: boolean) => toggleAgentSelection(agentId)
  const selectAll = () => selectAllAgents()
  const batchStart = (agentIds: string[]) => batchOperation(agentIds, 'start')
  const batchStop = (agentIds: string[]) => batchOperation(agentIds, 'stop')
  const batchDelete = (agentIds: string[]) => deleteAgents(agentIds)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])



  const handleCreateAgent = async (data: any) => {
    setFormLoading(true)
    try {
      await createAgent(data)
      setIsCreateDialogOpen(false)
      toast({
        title: "创建成功",
        description: "Agent已成功创建",
      })
    } catch (error) {
      toast({
        title: "创建失败",
        description: "创建Agent时发生错误",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditAgent = async (data: any) => {
    if (!editingAgent) return
    
    setFormLoading(true)
    try {
      await updateAgent(editingAgent.id, data)
      setIsEditDialogOpen(false)
      setEditingAgent(null)
      toast({
        title: "更新成功",
        description: "Agent已成功更新",
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新Agent时发生错误",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAgent = (agent: Agent) => {
    setDeletingAgent(agent)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAgent = async () => {
    if (!deletingAgent) return

    try {
      await deleteAgent(deletingAgent.id)
      setIsDeleteDialogOpen(false)
      setDeletingAgent(null)
      toast({
        title: "删除成功",
        description: "Agent已成功删除",
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除Agent时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleBatchDelete = () => {
    if (selectedAgents.length === 0) return
    setIsBatchDeleteDialogOpen(true)
  }

  const confirmBatchDelete = async () => {
    try {
      await batchDelete(selectedAgents)
      setIsBatchDeleteDialogOpen(false)
      clearSelection()
      toast({
        title: "批量删除成功",
        description: `已删除 ${selectedAgents.length} 个Agent`,
      })
    } catch (error) {
      toast({
        title: "批量删除失败",
        description: "批量删除Agent时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleStartAgent = async (agent: Agent) => {
    try {
      await startAgent(agent.id)
      toast({
        title: "启动成功",
        description: `${agent.name} 已启动`,
      })
    } catch (error) {
      toast({
        title: "启动失败",
        description: "启动Agent时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleStopAgent = async (agent: Agent) => {
    try {
      await stopAgent(agent.id)
      toast({
        title: "停止成功",
        description: `${agent.name} 已停止`,
      })
    } catch (error) {
      toast({
        title: "停止失败",
        description: "停止Agent时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateAgent = async (agent: Agent) => {
    try {
      await duplicateAgent(agent.id)
      toast({
        title: "复制成功",
        description: `${agent.name} 已复制`,
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "复制Agent时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleBatchStart = async () => {
    try {
      await batchStart(selectedAgents)
      clearSelection()
      toast({
        title: "批量启动成功",
        description: `已启动 ${selectedAgents.length} 个Agent`,
      })
    } catch (error) {
      toast({
        title: "批量启动失败",
        description: "批量启动Agent时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleBatchStop = async () => {
    try {
      await batchStop(selectedAgents)
      clearSelection()
      toast({
        title: "批量停止成功",
        description: `已停止 ${selectedAgents.length} 个Agent`,
      })
    } catch (error) {
      toast({
        title: "批量停止失败",
        description: "批量停止Agent时发生错误",
        variant: "destructive",
      })
    }
  }



  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">智能体管理</h1>
        <p className="text-muted-foreground">创建和管理您的AI智能体</p>
      </div>

      {/* Agent列表 */}
      <AgentList
        agents={agents}
        loading={loading}
        selectedAgents={selectedAgents}
        onSelectAgent={(agentId, selected) => selectAgent(agentId, selected)}
        onSelectAll={selectAll}
        onCreateAgent={() => setIsCreateDialogOpen(true)}
        onEditAgent={(agent) => {
          setEditingAgent(agent)
          setIsEditDialogOpen(true)
        }}
        onDeleteAgent={handleDeleteAgent}
        onDuplicateAgent={handleDuplicateAgent}
        onStartAgent={handleStartAgent}
        onStopAgent={handleStopAgent}
        onViewAgent={(agent) => {
          // TODO: 实现查看详情功能
          console.log('View agent:', agent)
        }}
        onBatchStart={handleBatchStart}
        onBatchStop={handleBatchStop}
        onBatchDelete={handleBatchDelete}
        onExport={() => {
          // TODO: 实现导出功能
          console.log('Export agents')
        }}
        onImport={() => {
          // TODO: 实现导入功能
          console.log('Import agents')
        }}
        onRefresh={fetchAgents}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 创建Agent对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建新智能体</DialogTitle>
            <DialogDescription>
              配置您的AI智能体的基本信息、模型参数和功能设置
            </DialogDescription>
          </DialogHeader>
          <AgentForm
            onSubmit={handleCreateAgent}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* 编辑Agent对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑智能体</DialogTitle>
            <DialogDescription>
              修改智能体的配置和设置
            </DialogDescription>
          </DialogHeader>
          {editingAgent && (
            <AgentForm
              agent={editingAgent}
              onSubmit={handleEditAgent}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingAgent(null)
              }}
              loading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除智能体 "{deletingAgent?.name}" 及其所有数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAgent} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量删除确认对话框 */}
      <AlertDialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除选中的 {selectedAgents.length} 个智能体及其所有数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBatchDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
