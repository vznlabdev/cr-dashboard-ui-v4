"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { notFound, useParams, useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { useData } from "@/contexts/data-context"
import { 
  getTaskGroupsByProject, 
  getTasksByTaskGroup,
  getCompanyById
} from "@/lib/mock-data/projects-tasks"
import type { Task, TaskGroup, Project } from "@/types"
import { ChevronDown, ChevronRight, ChevronUp, Plus, Pencil, Trash2, GripVertical, LayoutGrid, List, Search, X, Clock, FolderKanban, Upload, User, Folder, Calendar, CheckCircle, Check, MoreVertical, Zap, Bot, Rocket, Paperclip, Maximize2, AlertCircle, AlertTriangle, Minus, Target, Eye, MessageSquare, Filter, Signal, SignalHigh, SignalMedium, SignalLow } from "lucide-react"
import { useState, useEffect, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { MediaManager } from "@/components/media-manager/media-manager"
import type { MediaManagerData } from "@/types/mediaManager"
import { validateAllTabs, countMediaItems, hasMediaContent } from "@/utils/mediaValidation"
import { clearMediaDataFromStorage } from "@/contexts/MediaManagerContext"
import { getMediaCount, getMediaSummary, getMediaWarnings, hasMediaData } from "@/utils/mediaHelpers"

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "assessment", label: "Assessment" },
  { key: "assigned", label: "Assigned" },
  { key: "production", label: "Production" },
  { key: "qa_review", label: "QA Review" },
  { key: "delivered", label: "Delivered" },
]

const AUTO_ASSIGN_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // green
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
  '#ef4444', // red
  '#64748b', // slate
]

function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const router = useRouter()
  
  const getStatusVariant = (status: Task["status"]) => {
    switch (status) {
      case "delivered":
        return "default"
      case "qa_review":
        return "secondary"
      case "production":
        return "secondary"
      case "assigned":
        return "outline"
      case "assessment":
        return "outline"
      case "submitted":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card 
      onClick={() => router.push(`/projects/${projectId}/tasks/${task.id}`)}
      className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
    >
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
          <Badge variant={getStatusVariant(task.status)} className="text-xs shrink-0">
            {task.status}
          </Badge>
        </div>
        {task.assignee && (
          <p className="text-xs text-muted-foreground">
            👤 {task.assignee}
          </p>
        )}
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            📅 {task.dueDate}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Flat Kanban Board Component (shows all tasks in columns filtered by group)
interface FlatKanbanBoardProps {
  tasks: Task[]
  taskGroups: TaskGroup[]
  selectedTaskGroup: string | null
  projectId: string
  project: Project | undefined
  onDeleteTask: (taskId: string) => void
}

function FlatKanbanBoard({
  tasks,
  taskGroups,
  selectedTaskGroup,
  projectId,
  project,
  onDeleteTask,
}: FlatKanbanBoardProps) {
  const router = useRouter()
  
  // Get company data from project
  const company = project ? getCompanyById(project.companyId) : undefined
  
  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')

  // Filter tasks by selected group and status
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Filter by task group
    if (selectedTaskGroup) {
      filtered = filtered.filter(t => t.taskGroupId === selectedTaskGroup)
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus)
    }

    return filtered
  }, [tasks, selectedTaskGroup, selectedStatus])

  // Group filtered tasks by status column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      submitted: [],
      assessment: [],
      assigned: [],
      production: [],
      qa_review: [],
      delivered: [],
    }
    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })
    return grouped
  }, [filteredTasks])

  // Get task group by ID
  const getTaskGroup = (taskGroupId: string) => {
    return taskGroups.find(g => g.id === taskGroupId)
  }

  // Format relative time (e.g., "2h ago", "3 days ago")
  const getRelativeTime = (isoTimestamp: string) => {
    const now = new Date()
    const then = new Date(isoTimestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    
    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`
    return `${Math.floor(diffDay / 30)}mo ago`
  }

  // Check if task is overdue
  const isTaskOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    const now = new Date()
    const due = new Date(dueDate)
    return due < now
  }

  // Format due date consistently
  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return ''
    // If it's already in "Dec 22, 2024" format, return as-is
    if (dueDate.match(/^[A-Za-z]{3}\s\d{1,2},\s\d{4}$/)) {
      return dueDate
    }
    // Otherwise parse and format as "Dec 22, 2024"
    const date = new Date(dueDate)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  // Task card - Linear-style with essential info
  const TaskCardWithGroup = ({ task }: { task: Task }) => {
    const group = getTaskGroup(task.taskGroupId)
    
    // Get priority dot - clear visual indicator
    const getPriorityDot = () => {
      const priority = task.priority?.toLowerCase() || 'medium'
      
      if (priority === 'urgent' || priority === 'high') {
        return <div className="w-2 h-2 rounded-full bg-red-500" title="High priority" />
      }
      if (priority === 'low') {
        return <div className="w-2 h-2 rounded-full bg-gray-400" title="Low priority" />
      }
      // Default to medium
      return <div className="w-2 h-2 rounded-full bg-orange-500" title="Medium priority" />
    }
    
    return (
      <Card
        onClick={() => router.push(`/projects/${projectId}/tasks/${task.id}`)}
        className={cn(
          "relative py-0 cursor-pointer group",
          "bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50",
          "border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600",
          "rounded-md transition-colors"
        )}
      >
        <CardContent className="p-3.5 flex flex-col gap-3">
          {/* Task Title + Priority Dot */}
          <div className="flex items-start gap-2.5">
            <h3 
              className="flex-1 text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug"
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {getPriorityDot()}
              
              {/* Three-dot menu - shown on hover */}
              <DropdownMenu>
                <DropdownMenuTrigger 
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-opacity"
                    title="More options"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/projects/${projectId}/tasks/${task.id}`)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTask(task.id)
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Assignee + Company */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Assignee Avatar */}
              {task.assignee ? (
                <div 
                  className="w-6 h-6 rounded-full bg-gray-600 dark:bg-gray-500 flex items-center justify-center text-[10px] font-medium text-white shrink-0"
                  title={task.assignee}
                >
                  {task.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border border-dashed border-gray-400 shrink-0" />
              )}
              
              {/* Company name */}
              <span className="text-xs text-muted-foreground truncate">
                {company?.name || 'Company'}
              </span>
            </div>
            
            {/* Right: Metadata badges */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Comments */}
              {task.commentsCount !== undefined && task.commentsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{task.commentsCount}</span>
                </div>
              )}
              
              {/* Attachments */}
              {task.attachmentsCount !== undefined && task.attachmentsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{task.attachmentsCount}</span>
                </div>
              )}
              
              {/* Due date */}
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className={cn(
                    "h-3.5 w-3.5",
                    isTaskOverdue(task.dueDate) && "text-orange-500"
                  )} />
                  <span>{getRelativeTime(task.dueDate)}</span>
                </div>
              )}
              
              {/* Updated timestamp (if no other metadata) */}
              {!task.commentsCount && !task.attachmentsCount && !task.dueDate && task.updatedAt && (
                <span className="text-xs text-muted-foreground">
                  {getRelativeTime(task.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate task counts for filter pills
  const getGroupTaskCount = (groupId: string | null) => {
    if (groupId === null) {
      return tasks.length
    }
    return tasks.filter(t => t.taskGroupId === groupId).length
  }

  return (
    <div className="mt-6 -mx-4 md:-mx-6">
      {/* Kanban Columns - Horizontal Scroll - Linear Style */}
      <div
        className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin"
        style={{
          scrollSnapType: "x proximity",
          touchAction: "pan-x",
        }}
      >
        <div className="flex gap-4 h-[calc(100vh-320px)] px-4 md:px-6">
          {STATUS_COLUMNS.map((column) => (
            <div
              key={column.key}
              className="flex flex-col min-w-[280px] max-w-[280px] h-full"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Column Header - Minimal Linear Style */}
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <h3 className="text-sm font-medium text-foreground">{column.label}</h3>
                <span className="text-xs text-muted-foreground">
                  {tasksByColumn[column.key].length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-thin">
                {tasksByColumn[column.key].length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  tasksByColumn[column.key].map((task) => (
                    <TaskCardWithGroup key={task.id} task={task} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TaskGroupSwimlane({ 
  taskGroup, 
  tasks,
  isCollapsed,
  onToggleCollapse,
  onEdit,
  onDelete,
  onAddTask,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  projectId
}: { 
  taskGroup: TaskGroup
  tasks: Task[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  onEdit: () => void
  onDelete: () => void
  onAddTask: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  isDragging: boolean
  projectId: string
}) {
  // Group tasks by status column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      submitted: [],
      assessment: [],
      assigned: [],
      production: [],
      qa_review: [],
      delivered: [],
    }
    
    tasks.forEach((task) => {
      grouped[task.status].push(task)
    })
    
    return grouped
  }, [tasks])

  // Calculate task counts per column
  const columnCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      submitted: 0,
      assessment: 0,
      assigned: 0,
      production: 0,
      qa_review: 0,
      delivered: 0,
    }
    
    tasks.forEach((task) => {
      counts[task.status]++
    })
    
    return counts
  }, [tasks])

  return (
    <Card 
      className={cn(
        "shadow-md transition-all",
        isDragging && "opacity-50 scale-95"
      )}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader 
        className="hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div 
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {/* Collapse/Expand Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {/* Task Group Info */}
            <div>
              <CardTitle className="text-lg">{taskGroup.name}</CardTitle>
              {taskGroup.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {taskGroup.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </Badge>
            
            {/* Edit Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            {/* Delete Button - only if no tasks */}
            {tasks.length === 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                onAddTask()
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-6 gap-4">
            {STATUS_COLUMNS.map((column) => (
              <div key={column.key} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-medium text-sm">{column.label}</h3>
                  <Badge variant="outline" className="text-xs">
                    {columnCounts[column.key]}
                  </Badge>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {tasksByColumn[column.key].length === 0 ? (
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                  ) : (
                  tasksByColumn[column.key].map((task) => (
                    <TaskCard key={task.id} task={task} projectId={projectId} />
                  ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Stream View Component
interface StreamViewProps {
  tasks: Task[]
  taskGroups: TaskGroup[]
  selectedTaskGroup: string | null
  onTaskGroupSelect: (groupId: string | null) => void
  selectedStatus: string
  onStatusSelect: (status: string) => void
  projectId: string
  onDeleteTask: (taskId: string) => void
}

function StreamView({ 
  tasks, 
  taskGroups,
  selectedTaskGroup,
  onTaskGroupSelect,
  selectedStatus,
  onStatusSelect,
  projectId,
  onDeleteTask,
}: StreamViewProps) {
  const router = useRouter()
  // Apply filters
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]
    
    // Filter by task group
    if (selectedTaskGroup) {
      filtered = filtered.filter(t => t.taskGroupId === selectedTaskGroup)
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus)
    }
    
    return filtered
  }, [tasks, selectedTaskGroup, selectedStatus])
  
  // Sort tasks by most recent first (by updatedAt)
  const sortedTasks = useMemo(() => {
    return filteredTasks.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [filteredTasks])

  const getTaskGroup = (taskGroupId: string) => {
    return taskGroups.find(g => g.id === taskGroupId)
  }

  const getStatusVariant = (status: Task["status"]) => {
    switch (status) {
      case "delivered":
        return "default"
      case "qa_review":
        return "secondary"
      case "production":
        return "secondary"
      case "assigned":
        return "outline"
      case "assessment":
        return "outline"
      case "submitted":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getGroupTaskCount = (groupId: string | null) => {
    if (groupId === null) return tasks.length
    return tasks.filter(t => t.taskGroupId === groupId).length
  }

  return (
    <div className="space-y-4">
      {/* Stream View Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        {/* Task Group Dropdown */}
        <Select 
          value={selectedTaskGroup || 'all'} 
          onValueChange={(value) => onTaskGroupSelect(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Groups ({getGroupTaskCount(null)})
            </SelectItem>
            {taskGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} ({getGroupTaskCount(group.id)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedStatus === 'all' ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selectedStatus === 'all'
                ? ""
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onStatusSelect('all')}
          >
            All ({tasks.length})
          </Badge>
          {STATUS_COLUMNS.map((column) => {
            const count = tasks.filter(t => t.status === column.key).length
            return (
              <Badge
                key={column.key}
                variant={selectedStatus === column.key ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedStatus === column.key
                    ? ""
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => onStatusSelect(column.key)}
              >
                {column.label} ({count})
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Tasks Match Filter</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or create a new task
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const taskGroup = getTaskGroup(task.taskGroupId)
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => router.push(`/projects/${projectId}/tasks/${task.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Task header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{task.title}</h3>
                          {taskGroup?.name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {taskGroup.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={getStatusVariant(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          
                          {/* Three-dot menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger 
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
                                title="More options"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/projects/${projectId}/tasks/${task.id}`)
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit task</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1" />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteTask(task.id)
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete task</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Task metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            👤 {task.assignee}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            📅 Due {task.dueDate}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          🕒 Updated {formatRelativeTime(task.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Project Preview Card Component
interface ProjectPreviewCardProps {
  project: Project
}

const ProjectPreviewCard = ({ project }: ProjectPreviewCardProps) => {
  const formatRelativeTime = (dateString: string) => {
    // Simple relative time formatting
    return dateString || 'recently'
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">{project.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{project.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {project.status || 'Active'}
            </span>
            <span className="text-xs text-gray-500">Updated {formatRelativeTime(project.updated)}</span>
          </div>
        </div>
      </div>
      
      {/* Description */}
      {project.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>
      )}
      
      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
        {project.owner && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">
                {project.owner.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{project.owner}</span>
          </div>
        )}
        {project.targetDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-700 dark:text-gray-300">{formatDate(project.targetDate)}</span>
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">{project.assets || 0} assets</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.compliance || 0}%` }} />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{project.compliance || 0}%</span>
        </div>
      </div>
    </div>
  )
}

// Team Members Data
const TEAM_MEMBERS = [
  { id: 'jgordon', name: 'jgordon', fullName: 'Jeff Gordon', avatarColor: '#ef4444' },
  { id: 'abdul.qadeer', name: 'abdul.qadeer', fullName: 'Abdul Qadeer', avatarColor: '#a855f7' },
  { id: 'asad', name: 'asad', fullName: 'Asad', avatarColor: '#06b6d4' },
  { id: 'dev.vznlab', name: 'dev.vznlab', fullName: 'Dev Vznlab', avatarColor: '#8b5cf6' },
  { id: 'husnain.raza', name: 'husnain.raza', fullName: 'Husnain Raza', avatarColor: '#ec4899' },
  { id: 'jg', name: 'jg', fullName: 'JG', avatarColor: '#78350f' },
  { id: 'ryan', name: 'ryan', fullName: 'Ryan', avatarColor: '#b45309' },
  { id: 'zlane', name: 'zlane', fullName: 'Zlane', avatarColor: '#10b981' },
]

// Priority Icon Component
const PriorityIcon = ({ priority, className = "w-3.5 h-3.5" }: { priority: string, className?: string }) => {
  if (priority === 'Urgent') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" className="fill-red-500" />
        <rect x="7" y="3" width="2" height="6" rx="1" className="fill-white" />
        <rect x="7" y="10.5" width="2" height="2" rx="1" className="fill-white" />
      </svg>
    )
  }
  if (priority === 'High') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="4" height="12" rx="1" className="fill-orange-500" />
        <rect x="6" y="2" width="4" height="14" rx="1" className="fill-orange-500" />
        <rect x="11" y="0" width="4" height="16" rx="1" className="fill-orange-500" />
      </svg>
    )
  }
  if (priority === 'Medium') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="7" width="4" height="9" rx="1" className="fill-yellow-600" />
        <rect x="6" y="4" width="4" height="12" rx="1" className="fill-yellow-600" />
        <rect x="11" y="7" width="4" height="9" rx="1" className="fill-gray-300 dark:fill-gray-700" />
      </svg>
    )
  }
  if (priority === 'Low') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="10" width="4" height="6" rx="1" className="fill-gray-400" />
        <rect x="6" y="10" width="4" height="6" rx="1" className="fill-gray-300 dark:fill-gray-700" />
        <rect x="11" y="10" width="4" height="6" rx="1" className="fill-gray-300 dark:fill-gray-700" />
      </svg>
    )
  }
  return null
}

// Property Pill Component for metadata bar
interface PropertyPillProps {
  icon?: React.ReactNode
  label: string
  value: string
  onClick?: () => void
  required?: boolean
}

const PropertyPill = ({ icon, label, value, onClick, required = false }: PropertyPillProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-all duration-150",
        required 
          ? "border-red-500/50 bg-red-500/10 hover:border-red-500" 
          : "border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className={cn("text-gray-500 dark:text-gray-400", required && "text-red-500")}>
        {label}:
      </span>
      <span className={cn("text-gray-900 dark:text-white font-medium", required && !value && "text-red-400")}>
        {value}
      </span>
    </button>
  )
}

export default function ProjectTasksPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const { getProjectById, projects: allProjects } = useData()

  // Refs
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // Fetch project from data context (consistent with projects list)
  const project = getProjectById(projectId)

  // View state management
  const viewFromUrl = searchParams.get('view') as 'board' | 'stream' | null
  const [currentView, setCurrentView] = useState<'board' | 'stream'>('board')

  // Filter state management
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string | null>(null) // null = "All Groups"
  const [selectedStatus, setSelectedStatus] = useState<string>('all') // for Stream view

  // State management
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TaskGroup | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3b82f6' })
  const [autoSelectNewGroup, setAutoSelectNewGroup] = useState(false)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Urgent' | 'High' | 'Medium' | 'Low',
    taskGroupId: '' as string,
    designType: '',
    mode: 'manual' as 'manual' | 'generative' | 'assisted',
    brand: '',
    dueDate: '',
    assignee: '' as string,
    intendedUses: [] as string[],
    aiToolsRestriction: 'all' as 'all' | 'specific',
    selectedTools: [] as string[],
    selectedProjectId: '' as string,
    targetAudience: '',
    detailedDescription: '',
    clientVisibility: 'internal' as 'internal' | 'visible' | 'commentable',
    estimatedHours: null as number | null,
    billable: false,
    mediaData: null as MediaManagerData | null,
  })
  const [taskFormError, setTaskFormError] = useState('')
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null)
  
  // Task Group combobox state
  const [taskGroupQuery, setTaskGroupQuery] = useState('')
  const [showTaskGroupDropdown, setShowTaskGroupDropdown] = useState(false)
  const [showTaskGroupPicker, setShowTaskGroupPicker] = useState(false)
  
  // Project picker state
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [projectQuery, setProjectQuery] = useState('')
  
  // Design Type picker state
  const [showDesignTypePicker, setShowDesignTypePicker] = useState(false)
  
  // Priority picker state
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  
  // Due Date picker state
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  
  // Brand picker state
  const [showBrandPicker, setShowBrandPicker] = useState(false)
  
  // Mode picker state
  const [showModePicker, setShowModePicker] = useState(false)
  
  // Intended Uses picker state
  const [showIntendedUsesPicker, setShowIntendedUsesPicker] = useState(false)
  
  // Assignee picker state
  const [showAssigneePicker, setShowAssigneePicker] = useState(false)
  
  // Modal display state
  const [createMore, setCreateMore] = useState(false)
  
  // Expandable sections state
  const [isExpanded, setIsExpanded] = useState(false)
  const [requestDetailsExpanded, setRequestDetailsExpanded] = useState(true)
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(true)
  const [linkAssetsExpanded, setLinkAssetsExpanded] = useState(false)
  
  // DAM Asset Browser state
  const [showAssetBrowser, setShowAssetBrowser] = useState(false)
  const [assetQuery, setAssetQuery] = useState('')
  
  // Media Manager state
  const [showMediaManager, setShowMediaManager] = useState(false)
  const [mediaSummaryExpanded, setMediaSummaryExpanded] = useState(false)
  
  // Filter dropdown state
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [filterSearchQuery, setFilterSearchQuery] = useState('')
  
  // Description auto-expands as user types (no manual expand button needed)
  const [selectedAssets, setSelectedAssets] = useState<Array<{
    id: string
    name: string
    thumbnail: string
    type: string
    projectName: string
    role?: 'OUTPUT' | 'INSPIRATION' | 'SOURCE_MATERIAL' | 'ORIGINAL'
  }>>([])
  
  // Mock assets for DAM browser (in production, this would come from API)
  const mockDamAssets = [
    { id: 'asset-1', name: 'Hero Banner.png', type: 'image', projectName: 'Brand Refresh', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
    { id: 'asset-2', name: 'Logo Variations.ai', type: 'vector', projectName: 'Brand Identity', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=400&fit=crop' },
    { id: 'asset-3', name: 'Product Photo.jpg', type: 'image', projectName: 'Product Launch', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
    { id: 'asset-4', name: 'Social Post.png', type: 'image', projectName: 'Social Campaign', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop' },
    { id: 'asset-5', name: 'Brand Guidelines.pdf', type: 'document', projectName: 'Brand Refresh', thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop' },
    { id: 'asset-6', name: 'Product Sheet.pdf', type: 'document', projectName: 'Product Launch', thumbnail: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400&h=400&fit=crop' },
    { id: 'asset-7', name: 'Email Header.png', type: 'image', projectName: 'Email Campaign', thumbnail: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&h=400&fit=crop' },
    { id: 'asset-8', name: 'Package Design.ai', type: 'vector', projectName: 'Packaging', thumbnail: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400&h=400&fit=crop' },
    { id: 'asset-9', name: 'Trade Show Banner.psd', type: 'image', projectName: 'Trade Show', thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop' },
    { id: 'asset-10', name: 'App Icon.png', type: 'image', projectName: 'App Launch', thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop' },
    { id: 'asset-11', name: 'Website Mockup.fig', type: 'design', projectName: 'Website Redesign', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop' },
    { id: 'asset-12', name: 'Video Thumbnail.jpg', type: 'image', projectName: 'Video Campaign', thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=400&fit=crop' },
  ]
  
  // Asset management functions
  const toggleAssetSelection = (asset: typeof mockDamAssets[0]) => {
    setSelectedAssets(prev => {
      const exists = prev.find(a => a.id === asset.id)
      if (exists) {
        return prev.filter(a => a.id !== asset.id)
      } else {
        return [...prev, { ...asset, role: 'OUTPUT' as const }] // Default role
      }
    })
  }
  
  const updateAssetRole = (assetId: string, role: string) => {
    setSelectedAssets(prev => 
      prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, role: role as typeof asset.role }
          : asset
      )
    )
  }
  
  const removeAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId))
  }
  
  // Filter assets based on search query
  const filteredDamAssets = useMemo(() => {
    const query = assetQuery.toLowerCase().trim()
    if (!query) return mockDamAssets
    
    return mockDamAssets.filter(asset => 
      asset.name.toLowerCase().includes(query) ||
      asset.projectName.toLowerCase().includes(query) ||
      asset.type.toLowerCase().includes(query)
    )
  }, [assetQuery])

  // Load view preference from URL or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (viewFromUrl) {
      setCurrentView(viewFromUrl)
      localStorage.setItem('tasks-view-preference', viewFromUrl)
    } else {
      const savedView = localStorage.getItem('tasks-view-preference') as 'board' | 'stream' | null
      if (savedView) {
        setCurrentView(savedView)
      }
    }
  }, [viewFromUrl])

  // Load task groups and tasks
  useEffect(() => {
    const groups = getTaskGroupsByProject(projectId)
    setTaskGroups(groups)
    
    // Load all tasks for this project
    const allTasks: Task[] = []
    groups.forEach(group => {
      const groupTasks = getTasksByTaskGroup(group.id)
      allTasks.push(...groupTasks)
    })
    setTasks(allTasks)
  }, [projectId])

  // Load collapse state from localStorage (client-side only)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(`project-${projectId}-collapsed-groups`)
    if (stored) {
      try {
        setCollapsedGroups(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse collapsed groups from localStorage", e)
      }
    }
  }, [projectId])

  // Auto-resize description textarea when content changes
  useEffect(() => {
    if (descriptionRef.current) {
      const textarea = descriptionRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`
    }
  }, [taskFormData.description, isTaskModalOpen])

  // Keyboard shortcuts for task modal
  useEffect(() => {
    if (!isTaskModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleCreateTask()
      }
      
      // Escape to close (only if no other modals are open)
      if (e.key === 'Escape' && !showAssetBrowser && !showProjectPicker) {
        e.preventDefault()
        closeTaskModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTaskModalOpen, taskFormData, project, showAssetBrowser, showProjectPicker, createMore, tasks, taskGroups])

  // Save collapse state to localStorage (client-side only)
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const newState = { ...prev, [groupId]: !prev[groupId] }
      // Only save to localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `project-${projectId}-collapsed-groups`,
          JSON.stringify(newState)
        )
      }
      return newState
    })
  }

  // Switch view and update URL
  const switchView = (view: 'board' | 'stream') => {
    setCurrentView(view)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks-view-preference', view)
    }
    router.push(`/projects/${projectId}/tasks?view=${view}`, { scroll: false })
  }

  // Modal handlers
  const openEditModal = (group: TaskGroup) => {
    setEditingGroup(group)
    setFormData({ name: group.name, description: group.description || '', color: group.color })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingGroup(null)
    setFormData({ name: '', description: '', color: '#3b82f6' })
    setAutoSelectNewGroup(false)
  }

  // Create task group
  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Task group name is required")
      return
    }

    const maxOrder = taskGroups.reduce((max, g) => Math.max(max, g.displayOrder), 0)
    
    const newGroup: TaskGroup = {
      id: `tg-${Date.now()}`,
      projectId: projectId,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      displayOrder: maxOrder + 1,
      createdBy: "Current User", // TODO: Get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTaskGroups([...taskGroups, newGroup])
    
    // If opened from task modal, auto-select the new group
    if (autoSelectNewGroup) {
      setTaskFormData({ ...taskFormData, taskGroupId: newGroup.id })
      setAutoSelectNewGroup(false)
    }
    
    toast.success(`Task group "${newGroup.name}" created successfully`)
    closeModal()
  }

  // Update task group
  const handleUpdate = () => {
    if (!editingGroup || !formData.name.trim()) {
      toast.error("Task group name is required")
      return
    }

    setTaskGroups(taskGroups.map(g => 
      g.id === editingGroup.id 
        ? { 
            ...g, 
            name: formData.name.trim(), 
            description: formData.description.trim() || undefined,
            color: formData.color,
            updatedAt: new Date().toISOString(),
          }
        : g
    ))

    toast.success(`Task group "${formData.name}" updated successfully`)
    closeModal()
  }

  // Delete task group
  const handleDelete = (group: TaskGroup) => {
    const groupTasks = tasks.filter(t => t.taskGroupId === group.id)
    if (groupTasks.length > 0) {
      toast.error("Cannot delete: Task group must have 0 tasks before deletion")
      return
    }

    setTaskGroups(taskGroups.filter(g => g.id !== group.id))
    toast.success(`Task group "${group.name}" deleted successfully`)
  }

  // Task modal handlers
  const openTaskModal = () => {
    setTaskFormData({
      title: '',
      description: '',
      priority: 'Medium',
      taskGroupId: '',
      designType: '',
      mode: 'manual',
      brand: '',
      dueDate: '',
      assignee: '',
      intendedUses: [],
      aiToolsRestriction: 'all',
      selectedTools: [],
      selectedProjectId: projectId, // Default to current project
      targetAudience: '',
      detailedDescription: '',
      clientVisibility: 'internal',
      estimatedHours: null,
      billable: false,
      mediaData: null,
    })
    setTaskFormError('')
    setTaskGroupQuery('')
    setIsExpanded(false)
    setSelectedAssets([])
    setShowAssetBrowser(false)
    setAssetQuery('')
    setIsTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setIsTaskModalOpen(false)
    
    // Clear media data from localStorage
    clearMediaDataFromStorage('new')
    
    setTaskFormData({
      title: '',
      description: '',
      priority: 'Medium',
      taskGroupId: '',
      designType: '',
      mode: 'manual',
      brand: '',
      dueDate: '',
      assignee: '',
      intendedUses: [],
      aiToolsRestriction: 'all',
      selectedTools: [],
      selectedProjectId: '',
      targetAudience: '',
      detailedDescription: '',
      clientVisibility: 'internal',
      estimatedHours: null,
      billable: false,
      mediaData: null,
    })
    setTaskFormError('')
    setTaskGroupQuery('')
    setShowTaskGroupDropdown(false)
    setIsExpanded(false)
    setRequestDetailsExpanded(true)
    setAttachmentsExpanded(true)
    setLinkAssetsExpanded(false)
    setSelectedAssets([])
    setShowAssetBrowser(false)
    setAssetQuery('')
    setMediaSummaryExpanded(false)
    setShowMediaManager(false)
  }

  // Create task group inline (for combobox)
  const createTaskGroupInline = (groupName: string) => {
    // Check for duplicates (case-insensitive)
    const duplicate = taskGroups.find(
      g => g.name.toLowerCase() === groupName.toLowerCase()
    )
    
    if (duplicate) {
      // Just select the existing one
      setTaskFormData({ ...taskFormData, taskGroupId: duplicate.id })
      setTaskGroupQuery(duplicate.name)
      setShowTaskGroupDropdown(false)
      return duplicate.id
    }
    
    // Auto-assign color (cycle through colors based on existing groups)
    const colorIndex = taskGroups.length % AUTO_ASSIGN_COLORS.length
    const autoColor = AUTO_ASSIGN_COLORS[colorIndex]
    
    const newGroup: TaskGroup = {
      id: `tg-${Date.now()}`,
      projectId: projectId,
      name: groupName.trim(),
      description: undefined,
      color: autoColor,
      displayOrder: taskGroups.length + 1,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    setTaskGroups([...taskGroups, newGroup])
    setTaskFormData({ ...taskFormData, taskGroupId: newGroup.id })
    setTaskGroupQuery(newGroup.name)
    setShowTaskGroupDropdown(false)
    toast.success(`Group "${newGroup.name}" created`)
    
    return newGroup.id
  }

  // Create task
  const handleCreateTask = () => {
    // Validate required fields
    if (!taskFormData.title.trim()) {
      setTaskFormError('Title is required')
      return
    }

    if (!taskFormData.selectedProjectId) {
      setTaskFormError('Project is required')
      toast.error('Please select a project')
      return
    }

    if (taskFormData.intendedUses.length === 0) {
      setTaskFormError('At least one intended use is required')
      toast.error('Please select at least one intended use')
      return
    }

    // Validate media data if present
    if (taskFormData.mediaData) {
      const creationMethod = 
        taskFormData.mode === 'manual' ? 'human-made' :
        taskFormData.mode === 'generative' ? 'ai-generated' :
        'ai-enhanced'
      
      const validation = validateAllTabs(
        taskFormData.mediaData,
        creationMethod,
        taskFormData.intendedUses
      )

      // Check for errors
      if (!validation.isValid) {
        setTaskFormError('Media validation failed')
        toast.error('Please fix media errors before creating task')
        // Show errors in console for debugging
        console.error('Media validation errors:', validation.allErrors)
        // Highlight the attachment button by showing the media summary
        setMediaSummaryExpanded(true)
        return
      }

      // Check for warnings
      if (validation.allWarnings.length > 0) {
        const proceed = confirm(
          `Media validation warnings:\n\n${validation.allWarnings.join('\n')}\n\nDo you want to continue anyway?`
        )
        if (!proceed) {
          return
        }
      }
    }

    // Create new task with all form data
    const taskId = `task-${Date.now()}`
    
    // Prepare media payload if media data exists
    const mediaPayload = taskFormData.mediaData ? {
      assets: taskFormData.mediaData.assets.map(a => a.id),
      prompts: {
        text: taskFormData.mediaData.prompts.text,
        saveToLibrary: taskFormData.mediaData.prompts.saveToLibrary,
        title: taskFormData.mediaData.prompts.title,
        tags: taskFormData.mediaData.prompts.tags,
        isPrivate: taskFormData.mediaData.prompts.isPrivate
      },
      training: taskFormData.mediaData.training.map(t => t.id),
      references: taskFormData.mediaData.references.map(ref => ({
        id: ref.id,
        type: ref.type,
        filename: ref.filename,
        url: ref.url,
        notes: ref.notes,
        order: ref.order
      })),
      creatorDNA: taskFormData.mediaData.creatorDNA.map(creator => ({
        id: creator.id,
        name: creator.name,
        nilpId: creator.nilpId,
        role: creator.role,
        nilpComponents: creator.nilpComponents
      }))
    } : undefined
    
    const newTask: Task = {
      id: taskId,
      taskGroupId: taskFormData.taskGroupId || '', // Use selected group or ungrouped
      projectId: taskFormData.selectedProjectId,
      title: taskFormData.title.trim(),
      description: taskFormData.description || undefined,
      status: 'submitted', // Always defaults to "Submitted"
      assignee: taskFormData.assignee || undefined,
      dueDate: taskFormData.dueDate || undefined,
      createdDate: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      updatedAt: new Date().toISOString(),
    }

    setTasks([...tasks, newTask])
    
    // Clear media data from localStorage after successful submission
    if (taskFormData.mediaData) {
      clearMediaDataFromStorage('new') // Clear the temporary storage
      console.log('Task created with media payload:', {
        taskId: newTask.id,
        media: mediaPayload
      })
      // In production, this would be sent to the backend:
      // await createTask({ task: newTask, media: mediaPayload })
    }
    
    toast.success('✓ Task created successfully')

    // If "Create more" is checked, reset form but keep context
    if (createMore) {
      setTaskFormData({
        title: '',
        description: '',
        priority: taskFormData.priority, // Keep priority
        taskGroupId: taskFormData.taskGroupId, // Keep task group
        designType: '',
        mode: taskFormData.mode, // Keep mode
        brand: taskFormData.brand, // Keep brand
        dueDate: '',
        assignee: taskFormData.assignee, // Keep assignee
        intendedUses: taskFormData.intendedUses, // Keep intended uses
        aiToolsRestriction: taskFormData.aiToolsRestriction, // Keep AI tools setting
        selectedTools: taskFormData.selectedTools, // Keep selected tools
        selectedProjectId: taskFormData.selectedProjectId, // Keep selected project
        targetAudience: '',
        detailedDescription: '',
        clientVisibility: taskFormData.clientVisibility, // Keep client visibility
        estimatedHours: null,
        billable: taskFormData.billable, // Keep billable setting
        mediaData: null, // Reset media data for next task
      })
      setTaskGroupQuery(taskGroups.find(g => g.id === taskFormData.taskGroupId)?.name || '')
      setSelectedAssets([]) // Clear attachments
      setTaskFormError('')
      // Focus title input for next task
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 0)
    } else {
      closeTaskModal()
    }
  }

  // Delete task handler
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success('Task deleted successfully')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (groupId: string) => (e: React.DragEvent) => {
    setDraggedGroup(groupId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (targetGroupId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    
    if (!draggedGroup || draggedGroup === targetGroupId) {
      setDraggedGroup(null)
      return
    }

    const draggedIndex = taskGroups.findIndex(g => g.id === draggedGroup)
    const targetIndex = taskGroups.findIndex(g => g.id === targetGroupId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedGroup(null)
      return
    }

    const newGroups = [...taskGroups]
    const [removed] = newGroups.splice(draggedIndex, 1)
    
    // Adjust target index if dragging forward (after removal, array is shorter)
    const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex
    newGroups.splice(adjustedTargetIndex, 0, removed)

    // Update display orders
    const reorderedGroups = newGroups.map((g, index) => ({
      ...g,
      displayOrder: index + 1,
      updatedAt: new Date().toISOString(),
    }))

    setTaskGroups(reorderedGroups)
    setDraggedGroup(null)
    
    toast.success("Task groups reordered successfully")
  }

  if (!project) {
    notFound()
  }

  // Group tasks by task group (use local state)
  const taskGroupsWithTasks = taskGroups.map((group) => ({
    group,
    tasks: tasks.filter(t => t.taskGroupId === group.id),
  }))

  const totalTasks = taskGroupsWithTasks.reduce(
    (sum, { tasks }) => sum + tasks.length,
    0
  )

  return (
    <>
      {/* Header - Linear Style, Streamlined */}
      <PageContainer className="space-y-0 animate-fade-in">
        {/* Compact Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <button
            onClick={() => router.push('/projects')}
            className="hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <span>•</span>
          <span>Projects</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{project.name}</span>
        </div>
        
        {/* Title Row + Metadata + Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            
            {/* Minimal Metadata Indicators */}
            <div className="flex items-center gap-3">
              {/* Status dot */}
              <div 
                className="flex items-center gap-1.5 px-1 py-0.5"
                title={`Project Status: ${project.status}`}
              >
                <div 
                  className={cn(
                    "h-2 w-2 rounded-full",
                    project.status === "Active" && "bg-green-500",
                    project.status !== "Active" && "bg-gray-400"
                  )}
                />
              </div>
              
              {/* Compliance percentage */}
              <span 
                className="text-sm text-muted-foreground px-1 py-0.5" 
                title={`Compliance Score: ${project.compliance}%`}
              >
                {project.compliance}%
              </span>
              
              {/* Risk icon - only show if not low */}
              {project.risk && project.risk !== 'Low' && (
                <div 
                  className="flex items-center px-1 py-0.5"
                  title={`Risk Level: ${project.risk}`}
                >
                  <AlertCircle 
                    className={cn(
                      "h-3.5 w-3.5",
                      project.risk === 'High' && "text-red-500",
                      project.risk === 'Medium' && "text-yellow-500"
                    )}
                  />
                </div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={() => openTaskModal()}
            size="sm"
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
        
        {/* View Toggles + Filter Dropdown */}
        <div className="flex items-center justify-between border-b border-border pb-0">
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => switchView('board')}
              className={cn(
                "pb-2 border-b-2 transition-colors",
                currentView === 'board' 
                  ? "border-foreground font-medium text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Board
            </button>
            <button
              onClick={() => switchView('stream')}
              className={cn(
                "pb-2 border-b-2 transition-colors",
                currentView === 'stream' 
                  ? "border-foreground font-medium text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Stream
            </button>
          </div>
          
          <div className="relative pb-2">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={cn(
                "flex items-center gap-2 px-3 py-1 text-xs rounded-md transition-colors border",
                selectedTaskGroup !== null 
                  ? "border-foreground/20 bg-muted text-foreground" 
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Filter className="h-3 w-3" />
              <span>
                {selectedTaskGroup === null 
                  ? `All (${tasks.length})`
                  : `${taskGroups.find(g => g.id === selectedTaskGroup)?.name} (${tasks.filter(t => t.taskGroupId === selectedTaskGroup).length})`
                }
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className="absolute right-0 z-50 mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search groups..."
                        className="pl-8 h-8 text-xs"
                        value={filterSearchQuery}
                        onChange={(e) => setFilterSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  {/* Filter Options */}
                  <div className="max-h-64 overflow-y-auto p-1">
                    {/* All option */}
                    <button
                      onClick={() => {
                        setSelectedTaskGroup(null)
                        setShowFilterDropdown(false)
                        setFilterSearchQuery('')
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                        selectedTaskGroup === null 
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      <span className="text-xs font-medium">All</span>
                      <span className="text-xs text-muted-foreground">{tasks.length}</span>
                    </button>
                    
                    {/* Task Group Options */}
                    {taskGroups
                      .filter(group => 
                        filterSearchQuery === '' || 
                        group.name.toLowerCase().includes(filterSearchQuery.toLowerCase())
                      )
                      .map((group) => {
                        const count = tasks.filter(t => t.taskGroupId === group.id).length
                        return (
                          <button
                            key={group.id}
                            onClick={() => {
                              setSelectedTaskGroup(group.id)
                              setShowFilterDropdown(false)
                              setFilterSearchQuery('')
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                              selectedTaskGroup === group.id 
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                : "text-gray-900 dark:text-white"
                            )}
                          >
                            <span className="text-xs font-medium truncate">{group.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{count}</span>
                          </button>
                        )
                      })}
                    
                    {/* No results */}
                    {taskGroups.filter(group => 
                      group.name.toLowerCase().includes(filterSearchQuery.toLowerCase())
                    ).length === 0 && filterSearchQuery !== '' && (
                      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No groups found
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stream View - Stays in Container */}
        {currentView === 'stream' && (
          <StreamView 
            tasks={tasks} 
            taskGroups={taskGroups}
            selectedTaskGroup={selectedTaskGroup}
            onTaskGroupSelect={setSelectedTaskGroup}
            selectedStatus={selectedStatus}
            onStatusSelect={setSelectedStatus}
            projectId={projectId}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </PageContainer>

      {/* Board View - Full Width (outside PageContainer) */}
      {currentView === 'board' && (
        <div className="relative">
          <FlatKanbanBoard
            tasks={tasks}
            taskGroups={taskGroups}
            selectedTaskGroup={selectedTaskGroup}
            projectId={projectId}
            project={project}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      )}

      {/* Task Group Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit Task Group' : 'Create Task Group'}
            </DialogTitle>
            <DialogDescription>
              {editingGroup 
                ? 'Update the task group details below.' 
                : 'Add a new task group to organize your tasks.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Social Media Assets"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    editingGroup ? handleUpdate() : handleCreate()
                  }
                }}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g. Instagram, Facebook, and Twitter campaign materials"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Blue', value: '#3b82f6' },
                  { name: 'Purple', value: '#8b5cf6' },
                  { name: 'Pink', value: '#ec4899' },
                  { name: 'Green', value: '#10b981' },
                  { name: 'Amber', value: '#f59e0b' },
                  { name: 'Teal', value: '#14b8a6' },
                  { name: 'Indigo', value: '#6366f1' },
                  { name: 'Orange', value: '#f97316' },
                  { name: 'Red', value: '#ef4444' },
                  { name: 'Gray', value: '#6b7280' },
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      formData.color === color.value 
                        ? "border-foreground scale-110" 
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={editingGroup ? handleUpdate : handleCreate}>
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Creation Modal - Linear Style */}
      <Dialog open={isTaskModalOpen} onOpenChange={(open) => {
        if (!open) closeTaskModal()
      }}>
        <DialogContent 
          className="bg-white dark:bg-[#0d0e14] transition-all duration-300 border border-gray-200 dark:border-gray-800 p-0 w-full max-w-5xl max-h-[70vh] rounded-xl"
          showCloseButton={false}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              handleCreateTask()
            }
          }}
        >
          <div className="flex flex-col h-full max-h-[70vh] overflow-hidden">
            {/* Header - Fixed - Linear Style */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-[#0d0e14]">
              {/* Breadcrumb Navigation - Single Line, Minimal */}
              <div className="flex items-center gap-4">
                {/* New Task - Static Label with Status Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 flex-shrink-0" />
                  <DialogTitle className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    New Task
                  </DialogTitle>
                </div>
                
                <span className="text-gray-300 dark:text-gray-600">›</span>
                
                {/* Brand - Clickable */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBrandPicker(!showBrandPicker)}
                    className="text-sm font-normal text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {taskFormData.brand || "Select Brand"}
                  </button>
                  
                  {/* Brand Picker Dropdown */}
                  {showBrandPicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowBrandPicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        <div className="p-1">
                          {/* Clear Option */}
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded"
                            onClick={() => {
                              setTaskFormData({ ...taskFormData, brand: '' })
                              setShowBrandPicker(false)
                            }}
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">None</span>
                          </button>
                          
                          {/* Brand Options */}
                          {['Acme Corporation', 'TechStart Inc'].map(brand => (
                            <button
                              key={brand}
                              type="button"
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                                taskFormData.brand === brand 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "text-gray-900 dark:text-white"
                              )}
                              onClick={() => {
                                setTaskFormData({ ...taskFormData, brand })
                                setShowBrandPicker(false)
                              }}
                            >
                              <span className="text-xs font-medium">{brand}</span>
                              {taskFormData.brand === brand && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <span className="text-gray-300 dark:text-gray-600">›</span>
                
                {/* Project - Clickable - Current Step */}
                <button
                  type="button"
                  onClick={() => setShowProjectPicker(true)}
                  className={cn(
                    "text-sm font-normal transition-colors",
                    !taskFormData.selectedProjectId 
                      ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" 
                      : "text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  {taskFormData.selectedProjectId ? getProjectById(taskFormData.selectedProjectId)?.name : "Select Project"}
                </button>
              </div>
              
              {/* Close Button - Minimal */}
              <button
                type="button"
                onClick={closeTaskModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0d0e14]">
              {/* Title and Description */}
              <div className="px-6 py-4">
              {/* Title Input */}
              <div className="space-y-3">
                <input
                  ref={titleInputRef}
                  autoFocus
                  type="text"
                  placeholder="Task title"
                  className={cn(
                    "w-full text-lg font-medium bg-transparent border-b py-2 outline-none transition-all duration-150 placeholder:text-gray-400",
                    taskFormError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-blue-500"
                  )}
                  value={taskFormData.title}
                  onChange={(e) => {
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                    if (taskFormError) setTaskFormError('')
                  }}
                />
                
                {/* Description Textarea - Auto-expanding */}
                <textarea
                  ref={descriptionRef}
                  placeholder="Add description..."
                  value={taskFormData.description}
                  onChange={(e) => {
                    setTaskFormData({ ...taskFormData, description: e.target.value })
                  }}
                  rows={3}
                  className="w-full text-sm bg-transparent resize-none outline-none py-2 placeholder:text-gray-400 transition-all duration-150 min-h-[60px] max-h-[300px]"
                />
                
                {/* Error Message */}
                {taskFormError && (
                  <p className="text-xs text-red-500">{taskFormError}</p>
                )}
              </div>
            </div>

            {/* Target Audience */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800">
              <input 
                type="text" 
                placeholder="Target Audience (e.g., B2B decision makers)" 
                className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none py-2 placeholder:text-gray-400"
                value={taskFormData.targetAudience}
                onChange={(e) => setTaskFormData({ ...taskFormData, targetAudience: e.target.value })}
              />
            </div>

            {/* Intended Uses - Required Field */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    Intended Uses
                  </span>
                  <span className="text-xs text-red-500">*</span>
                </div>
                
                {/* Selected Uses as Chips */}
                {taskFormData.intendedUses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {taskFormData.intendedUses.map(use => (
                      <span
                        key={use}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium"
                      >
                        {use}
                        <button
                          type="button"
                          onClick={() => {
                            setTaskFormData({
                              ...taskFormData,
                              intendedUses: taskFormData.intendedUses.filter(u => u !== use)
                            })
                          }}
                          className="hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Add Button / Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIntendedUsesPicker(!showIntendedUsesPicker)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-md hover:border-blue-500 hover:text-blue-500 transition-all duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Select intended uses...
                  </button>
                  
                  {/* Intended Uses Picker Dropdown */}
                  {showIntendedUsesPicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowIntendedUsesPicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        <div className="p-1 max-h-60 overflow-auto">
                          {[
                            'Advertising/Campaigns',
                            'Editorial',
                            'Internal',
                            'Social Media',
                            'Print',
                            'Web',
                            'Video'
                          ].map(use => (
                            <button
                              key={use}
                              type="button"
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                                taskFormData.intendedUses.includes(use)
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                  : "text-gray-900 dark:text-white"
                              )}
                              onClick={() => {
                                if (taskFormData.intendedUses.includes(use)) {
                                  setTaskFormData({
                                    ...taskFormData,
                                    intendedUses: taskFormData.intendedUses.filter(u => u !== use)
                                  })
                                } else {
                                  setTaskFormData({
                                    ...taskFormData,
                                    intendedUses: [...taskFormData.intendedUses, use]
                                  })
                                }
                              }}
                            >
                              <span className="text-xs font-medium">{use}</span>
                              {taskFormData.intendedUses.includes(use) && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* AI Tools Section - Conditional - Fixed */}
            {(taskFormData.mode === 'generative' || taskFormData.mode === 'assisted') && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      AI Tools
                    </span>
                  </div>
                  
                  {/* Radio Button Group */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="aiToolsRestriction"
                        checked={taskFormData.aiToolsRestriction === 'all'}
                        onChange={() => setTaskFormData({ ...taskFormData, aiToolsRestriction: 'all' })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-xs text-gray-900 dark:text-white">Use all approved tools</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="aiToolsRestriction"
                        checked={taskFormData.aiToolsRestriction === 'specific'}
                        onChange={() => setTaskFormData({ ...taskFormData, aiToolsRestriction: 'specific' })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-xs text-gray-900 dark:text-white">Restrict to specific tools...</span>
                    </label>
                    
                    {/* Tool Picker - Shows when 'specific' is selected */}
                    {taskFormData.aiToolsRestriction === 'specific' && (
                      <div className="ml-7 mt-2 space-y-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Select specific tools:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'ChatGPT',
                            'Midjourney',
                            'DALL-E',
                            'Claude',
                            'Stable Diffusion',
                            'Runway'
                          ].map(tool => (
                            <label key={tool} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={taskFormData.selectedTools.includes(tool)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTaskFormData({
                                      ...taskFormData,
                                      selectedTools: [...taskFormData.selectedTools, tool]
                                    })
                                  } else {
                                    setTaskFormData({
                                      ...taskFormData,
                                      selectedTools: taskFormData.selectedTools.filter(t => t !== tool)
                                    })
                                  }
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300">{tool}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Properties Bar */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 overflow-visible">
              {/* Properties Bar - Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2 overflow-visible">
                {/* Design Type - FIRST - HIGH PRIORITY */}
                <div className="relative">
                  <PropertyPill
                    icon={<Pencil className="w-3.5 h-3.5" />}
                    label="Type"
                    value={taskFormData.designType || "None"}
                    onClick={() => setShowDesignTypePicker(!showDesignTypePicker)}
                  />
                  
                  {/* Design Type Picker Dropdown */}
                  {showDesignTypePicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDesignTypePicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        <div className="p-1 max-h-60 overflow-auto">
                          {/* None Option */}
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded"
                            onClick={() => {
                              setTaskFormData({ ...taskFormData, designType: '' })
                              setShowDesignTypePicker(false)
                            }}
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">None</span>
                          </button>
                          
                          {/* Design Type Options */}
                          {[
                            'Social Media',
                            'Email',
                            'Web',
                            'Print',
                            'Video',
                            'Packaging',
                            'Presentation',
                            'Infographic',
                            'Banner',
                            'Logo'
                          ].map(type => (
                            <button
                              key={type}
                              type="button"
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                                taskFormData.designType === type 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "text-gray-900 dark:text-white"
                              )}
                              onClick={() => {
                                setTaskFormData({ ...taskFormData, designType: type })
                                setShowDesignTypePicker(false)
                              }}
                            >
                              <span className="text-xs font-medium">{type}</span>
                              {taskFormData.designType === type && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Mode - With Dropdown Picker */}
                <div className="relative">
                  <PropertyPill
                    icon={<Zap className="w-3.5 h-3.5" />}
                    label="Mode"
                    value={
                      taskFormData.mode === 'manual' ? 'Manual' :
                      taskFormData.mode === 'generative' ? 'AI Generative' :
                      'AI Assisted'
                    }
                    onClick={() => setShowModePicker(!showModePicker)}
                  />
                  
                  {/* Mode Picker Dropdown */}
                  {showModePicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowModePicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        <div className="p-1">
                          {[
                            { value: 'manual', label: 'Manual' },
                            { value: 'generative', label: 'AI Generative' },
                            { value: 'assisted', label: 'AI Assisted' }
                          ].map(mode => (
                            <button
                              key={mode.value}
                              type="button"
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                                taskFormData.mode === mode.value 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "text-gray-900 dark:text-white"
                              )}
                              onClick={() => {
                                setTaskFormData({ ...taskFormData, mode: mode.value as typeof taskFormData.mode })
                                setShowModePicker(false)
                              }}
                            >
                              <span className="text-xs font-medium">{mode.label}</span>
                              {taskFormData.mode === mode.value && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Assignee - With Dropdown Picker */}
                <div className="relative">
                  <PropertyPill
                    icon={
                      taskFormData.assignee && TEAM_MEMBERS.find(m => m.fullName === taskFormData.assignee) 
                        ? <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold"
                            style={{ backgroundColor: TEAM_MEMBERS.find(m => m.fullName === taskFormData.assignee)?.avatarColor }}
                          >
                            {taskFormData.assignee.charAt(0)}
                          </div>
                        : <User className="w-3.5 h-3.5" />
                    }
                    label="Assignee"
                    value={taskFormData.assignee || "None"}
                    onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                  />
                  
                  {/* Assignee Picker Dropdown */}
                  {showAssigneePicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowAssigneePicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        <div className="p-1 max-h-60 overflow-auto">
                          {/* None Option */}
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded"
                            onClick={() => {
                              setTaskFormData({ ...taskFormData, assignee: '' })
                              setShowAssigneePicker(false)
                            }}
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Unassigned</span>
                          </button>
                          
                          {/* Team Members */}
                          {TEAM_MEMBERS.map(member => (
                            <button
                              key={member.id}
                              type="button"
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                                taskFormData.assignee === member.fullName 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "text-gray-900 dark:text-white"
                              )}
                              onClick={() => {
                                setTaskFormData({ ...taskFormData, assignee: member.fullName })
                                setShowAssigneePicker(false)
                              }}
                            >
                              <div 
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                                style={{ backgroundColor: member.avatarColor }}
                              >
                                {member.fullName.charAt(0)}
                              </div>
                              <span className="text-xs font-medium">{member.fullName}</span>
                              {taskFormData.assignee === member.fullName && <Check className="w-3 h-3 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Priority - With Dropdown Picker */}
                <div className="relative">
                  <PropertyPill
                    icon={<PriorityIcon priority={taskFormData.priority} />}
                    label="Priority"
                    value={taskFormData.priority}
                    onClick={() => setShowPriorityPicker(!showPriorityPicker)}
                  />
                  
                  {/* Priority Picker Dropdown */}
                  {showPriorityPicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowPriorityPicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        <div className="p-1">
                          {/* No Priority Option */}
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded text-gray-500 dark:text-gray-400"
                            onClick={() => {
                              setTaskFormData({ ...taskFormData, priority: 'Medium' })
                              setShowPriorityPicker(false)
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">No priority</span>
                            </div>
                          </button>
                          
                          {/* Priority Options */}
                          {[
                            { value: 'Urgent' },
                            { value: 'High' },
                            { value: 'Medium' },
                            { value: 'Low' }
                          ].map(priority => (
                            <button
                              key={priority.value}
                              type="button"
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                                taskFormData.priority === priority.value 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "text-gray-900 dark:text-white"
                              )}
                              onClick={() => {
                                setTaskFormData({ ...taskFormData, priority: priority.value as typeof taskFormData.priority })
                                setShowPriorityPicker(false)
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                <PriorityIcon priority={priority.value} />
                                <span className="text-xs font-medium">{priority.value}</span>
                              </div>
                              {taskFormData.priority === priority.value && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Due Date - With Date Picker */}
                <div className="relative">
                  <PropertyPill
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    label="Due"
                    value={taskFormData.dueDate || "None"}
                    onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                  />
                  
                  {/* Due Date Picker Dropdown */}
                  {showDueDatePicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDueDatePicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-[160px] overflow-y-auto">
                        <div className="p-1">
                          {/* Clear Option */}
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded"
                            onClick={() => {
                              setTaskFormData({ ...taskFormData, dueDate: '' })
                              setShowDueDatePicker(false)
                            }}
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Clear date</span>
                          </button>
                          
                          {/* Quick Date Options */}
                          {[
                            { label: 'Today', days: 0 },
                            { label: 'Tomorrow', days: 1 },
                            { label: 'In 3 days', days: 3 },
                            { label: 'In 1 week', days: 7 },
                            { label: 'In 2 weeks', days: 14 },
                            { label: 'In 1 month', days: 30 }
                          ].map(option => {
                            const date = new Date()
                            date.setDate(date.getDate() + option.days)
                            const dateStr = date.toISOString().split('T')[0]
                            
                            return (
                              <button
                                key={option.label}
                                type="button"
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                                  taskFormData.dueDate === dateStr 
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                    : "text-gray-900 dark:text-white"
                                )}
                                onClick={() => {
                                  setTaskFormData({ ...taskFormData, dueDate: dateStr })
                                  setShowDueDatePicker(false)
                                }}
                              >
                                <span className="text-xs font-medium">{option.label}</span>
                                {taskFormData.dueDate === dateStr && <Check className="w-3 h-3" />}
                              </button>
                            )
                          })}
                          
                          {/* Custom Date Option */}
                          <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                            <div className="px-3 py-2">
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">Custom date</label>
                              <input
                                type="date"
                                value={taskFormData.dueDate || ''}
                                onChange={(e) => {
                                  setTaskFormData({ ...taskFormData, dueDate: e.target.value })
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Task Group - Combobox with Inline Create */}
                <div className="relative">
                  <PropertyPill
                    icon={
                      taskFormData.taskGroupId && taskGroups.find(g => g.id === taskFormData.taskGroupId) 
                        ? <span className="w-2 h-2 rounded-full" style={{ backgroundColor: taskGroups.find(g => g.id === taskFormData.taskGroupId)?.color }} />
                        : undefined
                    }
                    label="Group"
                    value={
                      taskFormData.taskGroupId 
                        ? taskGroups.find(g => g.id === taskFormData.taskGroupId)?.name || "None"
                        : "None"
                    }
                    onClick={() => setShowTaskGroupPicker(!showTaskGroupPicker)}
                  />
                  
                  {/* Task Group Dropdown */}
                  {showTaskGroupPicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowTaskGroupPicker(false)}
                      />
                      <div className="absolute z-50 mt-1 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        {/* Search/Create Input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Search or create task group..."
                            className="w-full text-xs bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-2.5 py-1.5 focus:border-blue-500 outline-none placeholder:text-gray-400 transition-all duration-150"
                            value={taskGroupQuery}
                            onChange={(e) => setTaskGroupQuery(e.target.value)}
                            autoFocus
                          />
                        </div>
                        
                        {/* Options List */}
                        <div className="max-h-60 overflow-auto">
                          {(() => {
                            const searchLower = taskGroupQuery.toLowerCase().trim()
                            const filteredGroups = searchLower === ''
                              ? taskGroups
                              : taskGroups.filter(g => g.name.toLowerCase().includes(searchLower))
                            const exactMatch = taskGroups.find(g => g.name.toLowerCase() === searchLower)
                            const showCreate = searchLower && !exactMatch
                            
                            return (
                              <>
                                {/* New Group Button */}
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500 border-b border-gray-200 dark:border-gray-700 transition-all duration-150"
                                  onClick={() => {
                                    setShowTaskGroupPicker(false)
                                    setTaskGroupQuery('')
                                    setEditingGroup(null)
                                    setFormData({ name: '', description: '', color: '#3b82f6' })
                                    setAutoSelectNewGroup(true)
                                    setIsModalOpen(true)
                                  }}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">New group</span>
                                </button>
                                
                                {/* Create New Option (inline quick create) */}
                                {showCreate && (
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500 border-b border-gray-200 dark:border-gray-700 transition-all duration-150"
                                    onClick={() => {
                                      const groupId = createTaskGroupInline(taskGroupQuery)
                                      if (groupId) {
                                        setTaskFormData({ ...taskFormData, taskGroupId: groupId })
                                      }
                                      setShowTaskGroupPicker(false)
                                      setTaskGroupQuery('')
                                    }}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Create "{taskGroupQuery}"</span>
                                  </button>
                                )}
                                
                                {/* None Option */}
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
                                  onClick={() => {
                                    setTaskFormData({ ...taskFormData, taskGroupId: '' })
                                    setShowTaskGroupPicker(false)
                                    setTaskGroupQuery('')
                                  }}
                                >
                                  <Minus className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">None</span>
                                </button>
                                
                                {/* Existing Groups */}
                                {filteredGroups.length > 0 ? (
                                  filteredGroups.map(group => (
                                    <button
                                      key={group.id}
                                      type="button"
                                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
                                      onClick={() => {
                                        setTaskFormData({ ...taskFormData, taskGroupId: group.id })
                                        setShowTaskGroupPicker(false)
                                        setTaskGroupQuery('')
                                      }}
                                    >
                                      <span 
                                        className="w-2 h-2 rounded-full flex-shrink-0" 
                                        style={{ backgroundColor: group.color }}
                                      />
                                      <span className="text-xs text-gray-900 dark:text-white font-medium">{group.name}</span>
                                    </button>
                                  ))
                                ) : !showCreate ? (
                                  <div className="px-3 py-2 text-xs text-gray-500">
                                    No groups found
                                  </div>
                                ) : null}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Additional Options Toggle - Linear style */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all duration-150"
                  title={isExpanded ? 'Hide additional options' : 'Show additional options'}
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <MoreVertical className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'More'}</span>
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            <div className="px-6">
              {isExpanded && (
                <div className="py-4 space-y-6 border-t border-gray-200 dark:border-gray-800">
                  {/* Client Visibility */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client Visibility</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1.5 transition-colors">
                        <input
                          type="radio"
                          name="clientVisibility"
                          checked={taskFormData.clientVisibility === 'internal'}
                          onChange={() => setTaskFormData({ ...taskFormData, clientVisibility: 'internal' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">Internal only</span>
                      </label>
                      
                      <label className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1.5 transition-colors">
                        <input
                          type="radio"
                          name="clientVisibility"
                          checked={taskFormData.clientVisibility === 'visible'}
                          onChange={() => setTaskFormData({ ...taskFormData, clientVisibility: 'visible' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">Visible to client</span>
                      </label>
                      
                      <label className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1.5 transition-colors">
                        <input
                          type="radio"
                          name="clientVisibility"
                          checked={taskFormData.clientVisibility === 'commentable'}
                          onChange={() => setTaskFormData({ ...taskFormData, clientVisibility: 'commentable' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">Client can comment</span>
                      </label>
                    </div>
                  </div>

                  {/* Budget Tracking */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Budget Tracking</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400">Estimated hours:</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          value={taskFormData.estimatedHours || ''}
                          onChange={(e) => setTaskFormData({ ...taskFormData, estimatedHours: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-20 text-xs bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={taskFormData.billable}
                          onChange={(e) => setTaskFormData({ ...taskFormData, billable: e.target.checked })}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span className="text-xs text-gray-900 dark:text-white">Billable: Yes</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Media Summary Section */}
            {taskFormData.mediaData && hasMediaData(taskFormData.mediaData) && (
              <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50">
                <button
                  type="button"
                  onClick={() => setMediaSummaryExpanded(!mediaSummaryExpanded)}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Media Attached</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{getMediaSummary(taskFormData.mediaData)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {getMediaCount(taskFormData.mediaData)} item{getMediaCount(taskFormData.mediaData) !== 1 ? 's' : ''}
                    </span>
                    {mediaSummaryExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {mediaSummaryExpanded && (
                  <div className="px-6 pb-4 space-y-3">
                    {/* Detailed Media Breakdown */}
                    <div className="space-y-2">
                      {taskFormData.mediaData.assets.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Assets:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {taskFormData.mediaData.assets.length}
                          </span>
                        </div>
                      )}
                      {taskFormData.mediaData.prompts.text.trim().length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Prompt:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {taskFormData.mediaData.prompts.text.length} characters
                          </span>
                        </div>
                      )}
                      {taskFormData.mediaData.training.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Training Datasets:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {taskFormData.mediaData.training.length}
                          </span>
                        </div>
                      )}
                      {taskFormData.mediaData.references.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">References:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {taskFormData.mediaData.references.length}
                          </span>
                        </div>
                      )}
                      {taskFormData.mediaData.creatorDNA.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Creators:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {taskFormData.mediaData.creatorDNA.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Warnings */}
                    {getMediaWarnings(taskFormData.mediaData).length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {getMediaWarnings(taskFormData.mediaData).map((warning, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => setShowMediaManager(true)}
                      className="w-full px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 transition"
                    >
                      Edit Media
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
            {/* End Scrollable Content Area */}

            {/* Footer - Fixed */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
              {/* Left side - Attachment button */}
              <button
                type="button"
                onClick={() => setShowMediaManager(true)}
                className="relative p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title="Media Manager"
              >
                <Paperclip className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                {taskFormData.mediaData && hasMediaContent(taskFormData.mediaData) && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-blue-600 rounded-full">
                    {countMediaItems(taskFormData.mediaData)}
                  </span>
                )}
              </button>
              
              {/* Right side - Create controls */}
              <div className="flex items-center gap-3">
                {/* Create More Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createMore}
                    onChange={(e) => setCreateMore(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Create more</span>
                </label>
                
                {/* Create Task Button */}
                <button
                  type="button"
                  onClick={handleCreateTask}
                  className="px-6 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-150 shadow-sm hover:shadow"
                >
                  Create Task
                </button>
                
                {/* Keyboard Shortcut Hint */}
                <span className="text-xs text-gray-500">⌘↵</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DAM Asset Browser Modal */}
      <Dialog open={showAssetBrowser} onOpenChange={setShowAssetBrowser}>
        <DialogContent className="max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-0 flex flex-col" showCloseButton={false}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <DialogTitle className="text-sm font-semibold text-gray-900 dark:text-white">Select Assets from DAM</DialogTitle>
            <button 
              onClick={() => setShowAssetBrowser(false)} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="px-6 py-4 flex-shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search assets..."
                  value={assetQuery}
                  onChange={(e) => setAssetQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                  autoFocus
                />
              </div>
              <select className="text-sm bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white">
                <option>All Types</option>
                <option>Images</option>
                <option>Vectors</option>
                <option>Documents</option>
              </select>
            </div>
          </div>
          
          {/* Assets Grid */}
          <div className="px-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-4 gap-3 pb-4">
              {filteredDamAssets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => toggleAssetSelection(asset)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition",
                    selectedAssets.find(a => a.id === asset.id)
                      ? "border-blue-500 ring-2 ring-blue-500/50"
                      : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                  {selectedAssets.find(a => a.id === asset.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white truncate font-medium">{asset.name}</p>
                    <p className="text-[10px] text-gray-300 truncate">{asset.projectName}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredDamAssets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No assets found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowAssetBrowser(false)}
                className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowAssetBrowser(false)}
                disabled={selectedAssets.length === 0}
                className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedAssets.length > 0 ? selectedAssets.length : ''} Asset{selectedAssets.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Project Picker Dialog */}
      <Dialog open={showProjectPicker} onOpenChange={setShowProjectPicker}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6">
          <DialogTitle className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">Select Project</DialogTitle>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search projects..."
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 transition-all duration-150"
              autoFocus
            />
          </div>
          
          {/* Projects List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {(() => {
              const searchLower = projectQuery.toLowerCase().trim()
              const filteredProjects = searchLower === ''
                ? allProjects
                : allProjects.filter(p => p.name.toLowerCase().includes(searchLower))
              
              return filteredProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setTaskFormData({ ...taskFormData, selectedProjectId: proj.id })
                    setShowProjectPicker(false)
                    setProjectQuery('')
                    toast.success(`Project "${proj.name}" selected`)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{proj.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{proj.name}</p>
                    <p className="text-xs text-gray-500 truncate">{proj.status} • {proj.assets || 0} assets</p>
                  </div>
                  {taskFormData.selectedProjectId === proj.id && <Check className="w-4 h-4 text-blue-500" />}
                </button>
              ))
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Manager Modal */}
      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        creationMethod={
          taskFormData.mode === 'manual' ? 'human-made' :
          taskFormData.mode === 'generative' ? 'ai-generated' :
          'ai-enhanced'
        }
        taskId={undefined}
        creativeType={taskFormData.designType}
        toolUsed={taskFormData.selectedTools.length > 0 ? taskFormData.selectedTools[0] : undefined}
        intendedUse={taskFormData.intendedUses.length > 0 ? taskFormData.intendedUses[0] : undefined}
        onSave={(data) => {
          console.log('Media Manager data saved:', data)
          
          // Convert the save data to MediaManagerData format
          const mediaData: MediaManagerData = {
            assets: data.linkedAssetIds.map((id: string) => ({
              id,
              filename: `asset-${id}`,
              fileType: 'unknown',
              fileSize: 0,
              thumbnailUrl: '/placeholder.svg',
              clearanceStatus: 'pending' as const,
              source: 'library' as const,
              uploadedAt: new Date()
            })),
            prompts: {
              text: data.prompt.text,
              saveToLibrary: data.prompt.saveToLibrary,
              title: data.prompt.title,
              tags: data.prompt.tags,
              isPrivate: data.prompt.visibility === 'private'
            },
            training: data.trainingDataIds.map((id: string) => ({
              id,
              filename: `training-${id}`,
              fileType: 'unknown',
              fileSize: 0,
              thumbnailUrl: '/placeholder.svg',
              clearanceStatus: 'cleared' as const,
              source: 'library' as const,
              uploadedAt: new Date()
            })),
            references: data.references.map((ref: any, index: number) => ({
              id: ref.id,
              type: (ref.type === 'asset' ? 'asset' : ref.type === 'url' ? 'url' : 'upload') as 'asset' | 'upload' | 'url',
              filename: ref.name,
              url: ref.url,
              thumbnailUrl: '/placeholder.svg',
              notes: ref.note,
              order: ref.order || index
            })),
            creatorDNA: data.creatorDna.map((creator: any) => ({
              id: creator.personaId,
              name: `Creator ${creator.personaId}`,
              nilpId: creator.personaId,
              authorizationStatus: 'authorized' as const,
              role: creator.role,
              nilpComponents: creator.nilpComponents
            }))
          }
          
          // Update task form data
          setTaskFormData(prev => ({ ...prev, mediaData }))
          toast.success('Media saved successfully')
        }}
      />
    </>
  )
}
