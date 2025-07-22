"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface Column<T> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  searchable?: boolean
  selectable?: boolean
  actions?: {
    create?: () => void
    view?: (record: T) => void
    edit?: (record: T) => void
    delete?: (record: T) => void
    export?: () => void
    bulkActions?: Array<{
      label: string
      action: (selectedRecords: T[]) => void
      variant?: "default" | "destructive"
    }>
  }
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  title,
  searchable = true,
  selectable = false,
  actions,
  loading = false,
  pagination,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: "asc" | "desc"
  } | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})

  // 过滤和搜索数据
  const filteredData = useMemo(() => {
    let result = data

    // 搜索过滤
    if (searchTerm && searchable) {
      result = result.filter((item) =>
        columns.some((column) => {
          const value = item[column.key]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        }),
      )
    }

    // 列过滤
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => String(item[key as keyof T]) === value)
      }
    })

    return result
  }, [data, searchTerm, filters, columns, searchable])

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map((item) => item.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const getFilterOptions = (key: keyof T) => {
    const uniqueValues = [...new Set(data.map((item) => String(item[key])))]
    return uniqueValues.map((value) => ({ label: value, value }))
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 表格头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
          {selectedRows.size > 0 && <p className="text-sm text-gray-600 mt-1">已选择 {selectedRows.size} 项</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* 搜索 */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          )}

          {/* 批量操作 */}
          {selectedRows.size > 0 && actions?.bulkActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  批量操作
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {actions.bulkActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      const selectedRecords = sortedData.filter((item) => selectedRows.has(item.id))
                      action.action(selectedRecords)
                    }}
                    className={action.variant === "destructive" ? "text-red-600" : ""}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {actions?.export && (
              <Button variant="outline" onClick={actions.export}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            )}
            {actions?.create && (
              <Button onClick={actions.create}>
                <Plus className="h-4 w-4 mr-2" />
                新建
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {columns
          .filter((column) => column.filterable)
          .map((column) => (
            <Select
              key={String(column.key)}
              value={filters[String(column.key)] || "all"}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, [String(column.key)]: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`筛选${column.title}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部{column.title}</SelectItem>
                {getFilterOptions(column.key).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {selectable && (
                <th className="text-left py-3 px-4 w-12">
                  <Checkbox
                    checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`text-left py-3 px-4 font-medium text-gray-900 ${column.width ? `w-${column.width}` : ""}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <button onClick={() => handleSort(column.key)} className="text-gray-400 hover:text-gray-600">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {(actions?.view || actions?.edit || actions?.delete) && (
                <th className="text-left py-3 px-4 w-20">操作</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((record, index) => (
              <motion.tr
                key={record.id}
                className="border-b border-gray-100 hover:bg-gray-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {selectable && (
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={selectedRows.has(record.id)}
                      onCheckedChange={(checked) => handleSelectRow(record.id, checked as boolean)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={String(column.key)} className="py-3 px-4">
                    {column.render ? column.render(record[column.key], record) : String(record[column.key])}
                  </td>
                ))}
                {(actions?.view || actions?.edit || actions?.delete) && (
                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.view && (
                          <DropdownMenuItem onClick={() => actions.view!(record)}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </DropdownMenuItem>
                        )}
                        {actions.edit && (
                          <DropdownMenuItem onClick={() => actions.edit!(record)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                        )}
                        {actions.delete && (
                          <DropdownMenuItem onClick={() => actions.delete!(record)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            显示 {(pagination.current - 1) * pagination.pageSize + 1} 到{" "}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} 项， 共 {pagination.total} 项
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到数据</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或筛选器</p>
          {actions?.create && (
            <Button onClick={actions.create}>
              <Plus className="h-4 w-4 mr-2" />
              新建
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
