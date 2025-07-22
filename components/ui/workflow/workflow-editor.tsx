"use client"

import type React from "react"

import { useCallback, useState, useRef, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type OnConnectStartParams,
  MarkerType,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Save, Play, Trash2, Download, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { AgentNode } from "./nodes/agent-node"
import { ToolNode } from "./nodes/tool-node"
import { InputNode } from "./nodes/input-node"
import { OutputNode } from "./nodes/output-node"
import { mockDataStore } from "@/lib/mock-data"
import { Alert, AlertDescription } from "@/components/ui/alert"

// 注册自定义节点类型
const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  input: InputNode,
  output: OutputNode,
}

interface WorkflowEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onSave?: (nodes: Node[], edges: Edge[]) => void
  onRun?: () => void
  onExport?: (workflowData: any) => void
  readOnly?: boolean
  companyAgentCount?: number
  maxAgents?: number
}

export function WorkflowEditor({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onRun,
  onExport,
  readOnly = false,
  companyAgentCount = 0,
  maxAgents = 5,
}: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const connectingNodeId = useRef<string | null>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    // 获取所有可用的Agent和工具
    setAgents(mockDataStore.getAgents())
    setTools(mockDataStore.getTools())
  }, [])

  // 初始化节点和边
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes)
    }
    if (initialEdges.length > 0) {
      setEdges(initialEdges)
    }
  }, [initialNodes, initialEdges, setNodes, setEdges])

  // 验证工作流
  const validateWorkflow = useCallback(() => {
    const errors: string[] = []

    // 检查输入节点数量
    const inputNodes = nodes.filter((node) => node.type === "input")
    if (inputNodes.length === 0) {
      errors.push("工作流必须包含一个输入节点")
    } else if (inputNodes.length > 1) {
      errors.push("工作流只能包含一个输入节点")
    }

    // 检查输出节点数量
    const outputNodes = nodes.filter((node) => node.type === "output")
    if (outputNodes.length === 0) {
      errors.push("工作流必须包含一个输出节点")
    } else if (outputNodes.length > 1) {
      errors.push("工作流只能包含一个输出节点")
    }

    // 检查Agent节点数量
    const agentNodes = nodes.filter((node) => node.type === "agent")
    if (agentNodes.length > maxAgents) {
      errors.push(`Agent节点数量不能超过 ${maxAgents} 个`)
    }

    // 检查是否有孤立节点
    const connectedNodeIds = new Set()
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })

    const isolatedNodes = nodes.filter((node) => !connectedNodeIds.has(node.id) && nodes.length > 1)
    if (isolatedNodes.length > 0) {
      errors.push(`发现 ${isolatedNodes.length} 个未连接的节点`)
    }

    // 检查是否有循环依赖
    const hasCircularDependency = checkCircularDependency(nodes, edges)
    if (hasCircularDependency) {
      errors.push("工作流中存在循环依赖")
    }

    setValidationErrors(errors)
    return errors.length === 0
  }, [nodes, edges, maxAgents])

  // 检查循环依赖
  const checkCircularDependency = (nodes: Node[], edges: Edge[]): boolean => {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true
      if (visited.has(nodeId)) return false

      visited.add(nodeId)
      recursionStack.add(nodeId)

      const outgoingEdges = edges.filter((edge) => edge.source === nodeId)
      for (const edge of outgoingEdges) {
        if (dfs(edge.target)) return true
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true
      }
    }

    return false
  }

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => {
      // 创建一个带有动画的边
      const newEdge = {
        ...params,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: "#2563eb" },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges],
  )

  // 处理连接开始
  const onConnectStart = useCallback((_: any, { nodeId }: OnConnectStartParams) => {
    connectingNodeId.current = nodeId || null
  }, [])

  // 处理连接结束
  const onConnectEnd = useCallback(
    (event: MouseEvent) => {
      if (!connectingNodeId.current || !reactFlowWrapper.current || !reactFlowInstance) {
        return
      }

      const targetIsPane = (event.target as Element).classList.contains("react-flow__pane")

      if (targetIsPane) {
        // 获取鼠标位置
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect()
        const position = reactFlowInstance.project({
          x: event.clientX - left,
          y: event.clientY - top,
        })

        // 根据源节点类型决定创建什么类型的目标节点
        const sourceNode = nodes.find((n) => n.id === connectingNodeId.current)
        if (!sourceNode) return

        let newNodeType = "agent"
        if (sourceNode.type === "agent") {
          newNodeType = "tool"
        } else if (sourceNode.type === "tool") {
          newNodeType = "output"
        } else if (sourceNode.type === "input") {
          newNodeType = "agent"
        }

        // 检查节点数量限制
        if (newNodeType === "input" && nodes.filter((n) => n.type === "input").length >= 1) {
          toast.error("只能有一个输入节点")
          return
        }

        if (newNodeType === "output" && nodes.filter((n) => n.type === "output").length >= 1) {
          toast.error("只能有一个输出节点")
          return
        }

        if (newNodeType === "agent" && nodes.filter((n) => n.type === "agent").length >= maxAgents) {
          toast.error(`Agent节点数量不能超过 ${maxAgents} 个`)
          return
        }

        // 创建新节点
        const newNodeId = `${newNodeType}_${Date.now()}`
        const newNode: Node = {
          id: newNodeId,
          type: newNodeType,
          position,
          data: {
            label: `新${newNodeType === "agent" ? "智能体" : newNodeType === "tool" ? "工具" : "输出"}`,
          },
        }

        // 添加新节点
        setNodes((nds) => nds.concat(newNode))

        // 创建连接
        const newEdge: Edge = {
          id: `edge_${connectingNodeId.current}_${newNodeId}`,
          source: connectingNodeId.current,
          target: newNodeId,
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: "#2563eb" },
        }

        setEdges((eds) => eds.concat(newEdge))
      }

      connectingNodeId.current = null
    },
    [nodes, reactFlowInstance, setEdges, setNodes, maxAgents],
  )

  // 处理节点点击
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
      setSelectedEdge(null)
    },
    [setSelectedNode],
  )

  // 处理边点击
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge)
      setSelectedNode(null)
    },
    [setSelectedEdge],
  )

  // 处理画布点击
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [setSelectedNode, setSelectedEdge])

  // 添加输入节点
  const addInputNode = useCallback(() => {
    const inputNodes = nodes.filter((node) => node.type === "input")
    if (inputNodes.length >= 1) {
      toast.error("只能有一个输入节点")
      return
    }

    const newNode: Node = {
      id: `input_${Date.now()}`,
      type: "input",
      position: { x: 100, y: 100 },
      data: { label: "用户输入", format: "text" },
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes, nodes])

  // 添加Agent节点
  const addAgentNode = useCallback(() => {
    const agentNodes = nodes.filter((node) => node.type === "agent")
    if (agentNodes.length >= maxAgents) {
      toast.error(`Agent节点数量不能超过 ${maxAgents} 个`)
      return
    }

    const newNode: Node = {
      id: `agent_${Date.now()}`,
      type: "agent",
      position: { x: 300, y: 100 },
      data: {
        label: "新智能体",
        agents: agents,
        onAgentSelect: (agentId: string, nodeId: string) => {
          const agent = agents.find((a) => a.id === agentId)
          if (agent) {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, label: agent.name, agentId: agent.id } } : n,
              ),
            )
          }
        },
      },
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes, agents, nodes, maxAgents])

  // 添加工具节点
  const addToolNode = useCallback(() => {
    const newNode: Node = {
      id: `tool_${Date.now()}`,
      type: "tool",
      position: { x: 500, y: 100 },
      data: {
        label: "新工具",
        tools: tools,
        onToolSelect: (toolId: string, nodeId: string) => {
          const tool = tools.find((t) => t.id === toolId)
          if (tool) {
            setNodes((nds) =>
              nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label: tool.name, toolId: tool.id } } : n)),
            )
          }
        },
      },
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes, tools])

  // 添加输出节点
  const addOutputNode = useCallback(() => {
    const outputNodes = nodes.filter((node) => node.type === "output")
    if (outputNodes.length >= 1) {
      toast.error("只能有一个输出节点")
      return
    }

    const newNode: Node = {
      id: `output_${Date.now()}`,
      type: "output",
      position: { x: 700, y: 100 },
      data: { label: "输出", format: "text/html" },
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes, nodes])

  // 删除选中的节点或边
  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      // 同时删除与该节点相关的边
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
    }

    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges])

  // 保存工作流
  const handleSave = useCallback(() => {
    if (!validateWorkflow()) {
      toast.error("工作流验证失败，请检查错误信息")
      return
    }

    if (onSave) {
      onSave(nodes, edges)
    }
    toast.success("工作流已保存")
  }, [nodes, edges, onSave, validateWorkflow])

  // 运行工作流
  const handleRun = useCallback(() => {
    if (!validateWorkflow()) {
      toast.error("工作流验证失败，无法运行")
      return
    }

    if (onRun) {
      onRun()
    } else {
      toast.success("工作流开始运行")
    }
  }, [onRun, validateWorkflow])

  // 导出工作流配置
  const handleExport = useCallback(() => {
    if (!validateWorkflow()) {
      toast.error("工作流验证失败，无法导出")
      return
    }

    const workflowData = {
      version: "1.0",
      metadata: {
        name: "工作流配置",
        description: "AI公司工作流配置",
        createdAt: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          // 清理函数引用
          onAgentSelect: undefined,
          onToolSelect: undefined,
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        animated: edge.animated,
      })),
      execution: {
        strategy: "sequential", // sequential | parallel | conditional
        timeout: 300000, // 5分钟超时
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: "exponential",
        },
      },
      validation: {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
      },
    }

    if (onExport) {
      onExport(workflowData)
    } else {
      // 下载JSON文件
      const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `workflow-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("工作流配置已导出")
    }
  }, [nodes, edges, validationErrors, validateWorkflow, onExport])

  // 实时验证
  useEffect(() => {
    validateWorkflow()
  }, [nodes, edges, validateWorkflow])

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      {/* 验证错误提示 */}
      {validationErrors.length > 0 && (
        <div className="absolute top-4 left-4 z-50 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        onInit={setReactFlowInstance}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        deleteKeyCode={null} // 禁用默认的删除快捷键
        proOptions={{ hideAttribution: true }}
        className="bg-gray-50"
        minZoom={0.2}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        connectionLineStyle={{ stroke: "#2563eb", strokeWidth: 2 }}
        connectionLineType="smoothstep"
        snapToGrid={true}
        snapGrid={[15, 15]}
        readOnly={readOnly}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === "input") return "#0ea5e9"
            if (n.type === "output") return "#10b981"
            if (n.type === "agent") return "#8b5cf6"
            if (n.type === "tool") return "#f59e0b"
            return "#ff0072"
          }}
          nodeColor={(n) => {
            if (n.type === "input") return "#0ea5e9"
            if (n.type === "output") return "#10b981"
            if (n.type === "agent") return "#8b5cf6"
            if (n.type === "tool") return "#f59e0b"
            return "#ff0072"
          }}
          maskColor="rgba(240, 240, 240, 0.6)"
        />
        <Panel position="top-right" className="flex space-x-2">
          <Button size="sm" onClick={handleSave} disabled={readOnly || validationErrors.length > 0}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
          <Button size="sm" onClick={handleExport} disabled={validationErrors.length > 0}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button size="sm" onClick={handleRun} disabled={validationErrors.length > 0}>
            <Play className="h-4 w-4 mr-2" />
            运行
          </Button>
        </Panel>
        <Panel position="top-left" className="flex space-x-2">
          <Button size="sm" onClick={addInputNode} disabled={readOnly}>
            输入节点
          </Button>
          <Button size="sm" onClick={addAgentNode} disabled={readOnly}>
            Agent节点 ({nodes.filter((n) => n.type === "agent").length}/{maxAgents})
          </Button>
          <Button size="sm" onClick={addToolNode} disabled={readOnly}>
            工具节点
          </Button>
          <Button size="sm" onClick={addOutputNode} disabled={readOnly}>
            输出节点
          </Button>
          {(selectedNode || selectedEdge) && (
            <Button size="sm" variant="destructive" onClick={deleteSelected} disabled={readOnly}>
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          )}
        </Panel>
      </ReactFlow>
    </div>
  )
}
