"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageContainer } from "@/components/layout/PageContainer"
import { useData } from "@/contexts/data-context"
import { mockTasks, getCompanyById } from "@/lib/mock-data/projects-tasks"
import type { Task } from "@/types"
import { Search, Zap, Clock, X, Filter, ChevronDown, MessageSquare, Paperclip, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "submitted", label: "Submitted" },
  { value: "assessment", label: "Assessment" },
  { value: "assigned", label: "Assigned" },
  { value: "production", label: "Production" },
  { value: "qa_review", label: "QA Review" },
  { value: "delivered", label: "Delivered" },
]

const MODE_OPTIONS = [
  { value: "all", label: "All Modes" },
  { value: "manual", label: "Manual" },
  { value: "generative", label: "AI Generative" },
  { value: "assisted", label: "AI Assisted" },
]

type ViewTab = 'my-tasks' | 'all' | 'unassigned' | 'overdue'

export default function UnifiedTasksPage() {
  const router = useRouter()
  const { projects, getProjectById } = useData()
  
  // Mock current user - in real app, get from auth context
  const currentUser = "Sarah Chen" // TODO: Replace with actual auth context
  
  const [activeView, setActiveView] = useState<ViewTab>('my-tasks')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMode, setSelectedMode] = useState<string>('all')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [focusedRow, setFocusedRow] = useState<number>(-1)
  
  // Group & Sort state
  const [groupBy, setGroupBy] = useState<'none' | 'project' | 'status' | 'assignee' | 'priority'>('none')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'updated' | 'created' | 'title'>('updated')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Get all unique assignees
  const allAssignees = useMemo(() => {
    const assignees = new Set<string>()
    mockTasks.forEach(task => {
      if (task.assignee) assignees.add(task.assignee)
    })
    return Array.from(assignees).sort()
  }, [])

  // Helper: Get priority value for sorting
  const getPriorityValue = (priority?: 'urgent' | 'high' | 'medium' | 'low') => {
    const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1 }
    return priority ? priorityMap[priority] : 0
  }

  // Helper: Get priority indicator
  const getPriorityIndicator = (priority?: 'urgent' | 'high' | 'medium' | 'low') => {
    if (!priority) return { icon: '○', color: 'text-gray-400', label: 'None' }
    const indicators = {
      urgent: { icon: '●', color: 'text-red-600 dark:text-red-400', label: 'Urgent' },
      high: { icon: '●', color: 'text-orange-600 dark:text-orange-400', label: 'High' },
      medium: { icon: '●', color: 'text-yellow-600 dark:text-yellow-400', label: 'Medium' },
      low: { icon: '○', color: 'text-gray-400', label: 'Low' },
    }
    return indicators[priority]
  }

  // Filter and Sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // Filter
    let filtered = mockTasks.filter(task => {
      // View-based filter (primary filter)
      if (activeView === 'my-tasks') {
        if (task.assignee !== currentUser) return false
      } else if (activeView === 'unassigned') {
        if (task.assignee) return false
      } else if (activeView === 'overdue') {
        if (!task.dueDate || new Date(task.dueDate) >= new Date()) return false
      }
      // 'all' view shows everything
      
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Project filter
      if (selectedProject !== 'all' && task.projectId !== selectedProject) {
        return false
      }
      
      // Status filter
      if (selectedStatus !== 'all' && task.status !== selectedStatus) {
        return false
      }
      
      // Mode filter
      if (selectedMode !== 'all' && task.mode !== selectedMode) {
        return false
      }
      
      // Assignee filter (only applies to 'all' view)
      if (activeView === 'all' && selectedAssignee !== 'all' && task.assignee !== selectedAssignee) {
        return false
      }
      
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'priority':
          comparison = getPriorityValue(b.priority) - getPriorityValue(a.priority)
          break
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          comparison = dateA - dateB
          break
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'created':
          comparison = new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortDirection === 'asc' ? -comparison : comparison
    })

    return filtered
  }, [activeView, currentUser, searchQuery, selectedProject, selectedStatus, selectedMode, selectedAssignee, sortBy, sortDirection])

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return [{ group: null, tasks: filteredAndSortedTasks }]
    }

    const groups: { [key: string]: Task[] } = {}
    
    filteredAndSortedTasks.forEach(task => {
      let key = 'Unknown'
      
      switch (groupBy) {
        case 'project':
          const project = getProjectById(task.projectId)
          key = project?.name || 'Unknown Project'
          break
        case 'status':
          key = task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          break
        case 'assignee':
          key = task.assignee || 'Unassigned'
          break
        case 'priority':
          key = task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'No Priority'
          break
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, tasks]) => ({ group, tasks }))
  }, [filteredAndSortedTasks, groupBy, getProjectById])

  // Flat list for keyboard navigation
  const filteredTasks = filteredAndSortedTasks

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with "/"
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()
        return
      }

      if (e.target instanceof HTMLInputElement) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedRow(prev => Math.min(prev + 1, filteredTasks.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedRow(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && focusedRow >= 0) {
        const task = filteredTasks[focusedRow]
        router.push(`/projects/${task.projectId}/tasks/${task.id}`)
      } else if (e.key === 'Escape') {
        setFocusedRow(-1)
      } else if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowFilters(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedRow, filteredTasks, router])

  // Get status badge variant
  const getStatusVariant = (status: Task["status"]) => {
    switch (status) {
      case "delivered":
        return "default"
      case "qa_review":
        return "secondary"
      case "production":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Check if overdue
  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  // Count active filters
  const activeFiltersCount = [
    selectedProject !== 'all',
    selectedStatus !== 'all',
    selectedMode !== 'all',
    selectedAssignee !== 'all'
  ].filter(Boolean).length

  // Clear all filters
  const clearFilters = () => {
    setSelectedProject('all')
    setSelectedStatus('all')
    setSelectedMode('all')
    setSelectedAssignee('all')
  }

  // Get count for each view
  const viewCounts = useMemo(() => {
    return {
      myTasks: mockTasks.filter(t => t.assignee === currentUser).length,
      all: mockTasks.length,
      unassigned: mockTasks.filter(t => !t.assignee).length,
      overdue: mockTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length,
    }
  }, [currentUser])

  return (
    <PageContainer className="space-y-4 animate-fade-in">
      {/* View Tabs - Linear Style */}
      <div className="flex items-center gap-1 border-b pb-0">
        <button
          onClick={() => {
            setActiveView('my-tasks')
            setSelectedAssignee('all') // Reset assignee filter
          }}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-t-md transition-colors relative",
            activeView === 'my-tasks'
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          My Tasks
          <span className={cn(
            "ml-1.5 px-1.5 py-0.5 text-xs rounded",
            activeView === 'my-tasks'
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          )}>
            {viewCounts.myTasks}
          </span>
          {activeView === 'my-tasks' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        
        <button
          onClick={() => setActiveView('all')}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-t-md transition-colors relative",
            activeView === 'all'
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          All Tasks
          <span className={cn(
            "ml-1.5 px-1.5 py-0.5 text-xs rounded",
            activeView === 'all'
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          )}>
            {viewCounts.all}
          </span>
          {activeView === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveView('unassigned')
            setSelectedAssignee('all')
          }}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-t-md transition-colors relative",
            activeView === 'unassigned'
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Unassigned
          <span className={cn(
            "ml-1.5 px-1.5 py-0.5 text-xs rounded",
            activeView === 'unassigned'
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          )}>
            {viewCounts.unassigned}
          </span>
          {activeView === 'unassigned' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveView('overdue')
            setSelectedAssignee('all')
          }}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-t-md transition-colors relative",
            activeView === 'overdue'
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Overdue
          <span className={cn(
            "ml-1.5 px-1.5 py-0.5 text-xs rounded",
            activeView === 'overdue'
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              : "bg-muted text-muted-foreground"
          )}>
            {viewCounts.overdue}
          </span>
          {activeView === 'overdue' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
          )}
        </button>
      </div>

      {/* Compact Header with Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks... (press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('')
                  e.currentTarget.blur()
                }
              }}
            />
          </div>
        </div>

        {/* Group By */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <span className="text-xs">Group:</span>
              <span className="font-medium text-xs">
                {groupBy === 'none' ? 'None' : groupBy === 'project' ? 'Project' : groupBy === 'status' ? 'Status' : groupBy === 'assignee' ? 'Assignee' : 'Priority'}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setGroupBy('none')}>
              {groupBy === 'none' && '✓ '}None
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupBy('project')}>
              {groupBy === 'project' && '✓ '}Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupBy('status')}>
              {groupBy === 'status' && '✓ '}Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupBy('assignee')}>
              {groupBy === 'assignee' && '✓ '}Assignee
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupBy('priority')}>
              {groupBy === 'priority' && '✓ '}Priority
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort By */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              {sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span className="text-xs">Sort:</span>
              <span className="font-medium text-xs">
                {sortBy === 'priority' ? 'Priority' : sortBy === 'dueDate' ? 'Due Date' : sortBy === 'updated' ? 'Updated' : sortBy === 'created' ? 'Created' : 'Title'}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('priority')}>
              {sortBy === 'priority' && '✓ '}Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('dueDate')}>
              {sortBy === 'dueDate' && '✓ '}Due Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('updated')}>
              {sortBy === 'updated' && '✓ '}Updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('created')}>
              {sortBy === 'created' && '✓ '}Created
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('title')}>
              {sortBy === 'title' && '✓ '}Title
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="border-t mt-1"
            >
              <ArrowUpDown className="h-3 w-3 mr-2" />
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors h-9",
            showFilters || activeFiltersCount > 0
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              : "hover:bg-muted"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Linear-style Filter Pills */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 py-2 border-b">
          {/* Status Pills */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Status:</span>
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  selectedStatus === option.value
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Mode Pills */}
          <div className="flex items-center gap-1 border-l pl-2">
            <span className="text-xs text-muted-foreground mr-1">Mode:</span>
            {MODE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedMode(option.value)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  selectedMode === option.value
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                    : "hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results Count - Compact */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          {activeView === 'my-tasks' && ' assigned to you'}
          {activeView === 'unassigned' && ' without assignee'}
          {activeView === 'overdue' && ' past due'}
        </span>
        <span className="text-[10px]">
          Use ↑↓ to navigate • Enter to open • Esc to clear • Cmd+F to filter
        </span>
      </div>

      {/* Linear-style Compact Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-[35%] h-9 text-xs font-medium">Task</TableHead>
              <TableHead className="h-9 text-xs font-medium">Project</TableHead>
              <TableHead className="h-9 text-xs font-medium">Status</TableHead>
              <TableHead className="h-9 text-xs font-medium w-[60px]">Priority</TableHead>
              <TableHead className="h-9 text-xs font-medium">Assignee</TableHead>
              <TableHead className="h-9 text-xs font-medium">Activity</TableHead>
              <TableHead className="h-9 text-xs font-medium">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-20" />
                    <div className="font-medium">
                      {activeView === 'my-tasks' && 'No tasks assigned to you'}
                      {activeView === 'unassigned' && 'No unassigned tasks'}
                      {activeView === 'overdue' && 'No overdue tasks'}
                      {activeView === 'all' && 'No tasks found'}
                    </div>
                    <p className="text-xs">
                      {activeView === 'my-tasks' && 'All caught up! 🎉'}
                      {activeView === 'unassigned' && 'All tasks have been assigned'}
                      {activeView === 'overdue' && 'Great job staying on schedule!'}
                      {activeView === 'all' && activeFiltersCount > 0 && 'Try adjusting your filters'}
                    </p>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:underline mt-2"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              groupedTasks.map(({ group, tasks }) => (
                <>
                  {/* Group Header (if grouping enabled) */}
                  {group && (
                    <TableRow key={`group-${group}`} className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={7} className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{group}</span>
                          <span className="text-xs text-muted-foreground">({tasks.length})</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Task Rows */}
                  {tasks.map((task) => {
                    const project = getProjectById(task.projectId)
                    const company = project ? getCompanyById(project.companyId) : null
                    const idx = filteredTasks.findIndex(t => t.id === task.id)
                    const isFocused = idx === focusedRow
                    const priority = getPriorityIndicator(task.priority)
                    
                    return (
                      <TableRow
                        key={task.id}
                        onClick={() => router.push(`/projects/${task.projectId}/tasks/${task.id}`)}
                        className={cn(
                          "cursor-pointer border-b border-border/40 transition-colors h-11",
                          isFocused 
                            ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800" 
                            : "hover:bg-muted/50"
                        )}
                        onMouseEnter={() => setFocusedRow(idx)}
                        onMouseLeave={() => setFocusedRow(-1)}
                      >
                        {/* Task Title */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            {task.mode && task.mode !== 'manual' && (
                              <Zap className={cn(
                                "h-3 w-3 flex-shrink-0",
                                task.mode === "generative" && "text-blue-600 dark:text-blue-400",
                                task.mode === "assisted" && "text-purple-600 dark:text-purple-400"
                              )} />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{task.title}</div>
                              {company && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {company.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Project */}
                        <TableCell className="py-2">
                          {project && (
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: project.companyId === '1' ? '#3b82f6' : project.companyId === '2' ? '#8b5cf6' : '#10b981' }}
                              />
                              <span className="text-xs truncate">{project.name}</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2">
                          <div className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize",
                            task.status === "delivered" && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                            task.status === "qa_review" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                            task.status === "production" && "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
                            task.status === "assigned" && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
                            (task.status === "assessment" || task.status === "submitted") && "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                          )}>
                            {task.status.replace('_', ' ')}
                          </div>
                        </TableCell>

                        {/* Priority */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1" title={priority.label}>
                            <span className={cn("text-sm", priority.color)}>{priority.icon}</span>
                          </div>
                        </TableCell>

                        {/* Assignee */}
                        <TableCell className="py-2">
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                {task.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-xs truncate">{task.assignee}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>

                        {/* Activity (Comments + Attachments) */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-3">
                            {(task.commentsCount || 0) > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                <span className="text-xs">{task.commentsCount}</span>
                              </div>
                            )}
                            {(task.attachmentsCount || 0) > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                <span className="text-xs">{task.attachmentsCount}</span>
                              </div>
                            )}
                            {!task.commentsCount && !task.attachmentsCount && (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Due Date */}
                        <TableCell className="py-2">
                          {task.dueDate ? (
                            <div className={cn(
                              "flex items-center gap-1.5 text-xs",
                              isOverdue(task.dueDate) && "text-red-600 dark:text-red-400 font-medium"
                            )}>
                              {isOverdue(task.dueDate) && <Clock className="h-3 w-3" />}
                              {formatDate(task.dueDate)}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  )
}
