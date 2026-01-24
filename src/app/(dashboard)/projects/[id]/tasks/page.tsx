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
import { notFound, useParams, useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { useData } from "@/contexts/data-context"
import { 
  getTaskGroupsByProject, 
  getTasksByTaskGroup,
  getCompanyById
} from "@/lib/mock-data/projects-tasks"
import type { Task, TaskGroup, Project } from "@/types"
import { ChevronDown, ChevronRight, ChevronUp, Plus, Pencil, Trash2, GripVertical, LayoutGrid, List, Search, X, Clock, FolderKanban, Upload, User, Folder, Calendar, CheckCircle, Check } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

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

  const getWorkstreamColor = (workstream: Task["workstream"]) => {
    switch (workstream) {
      case "creator":
        return "border-l-blue-500"
      case "legal":
        return "border-l-amber-500"
      case "insurance":
        return "border-l-green-500"
      case "general":
        return "border-l-gray-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <Card 
      onClick={() => router.push(`/projects/${projectId}/tasks/${task.id}`)}
      className={cn(
        "border-l-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer",
        getWorkstreamColor(task.workstream)
      )}
    >
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
          <Badge variant={getStatusVariant(task.status)} className="text-xs shrink-0">
            {task.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {task.workstream}
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
  searchQuery: string
  projectId: string
  project: Project | undefined
}

function FlatKanbanBoard({
  tasks,
  taskGroups,
  selectedTaskGroup,
  searchQuery,
  projectId,
  project,
}: FlatKanbanBoardProps) {
  const router = useRouter()
  
  // Get company data from project
  const company = project ? getCompanyById(project.companyId) : undefined
  
  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')

  // Filter tasks by selected group, status, and search query
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

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.workstream.toLowerCase().includes(query) ||
        (t.assignee?.toLowerCase().includes(query) ?? false)
      )
    }

    return filtered
  }, [tasks, selectedTaskGroup, selectedStatus, searchQuery])

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

  // Task card - styled to match creative tickets exactly
  const TaskCardWithGroup = ({ task }: { task: Task }) => {
    const group = getTaskGroup(task.taskGroupId)
    
    // Get company brand color - parse from branding_colors or use default
    const getCompanyColor = () => {
      if (!company?.branding_colors) return '#3b82f6'
      // branding_colors format: "#primary,#secondary,#accent"
      return company.branding_colors.split(',')[0] || '#3b82f6'
    }

    // Determine priority based on workstream (for demo purposes)
    const getPriority = () => {
      switch (task.workstream) {
        case 'legal':
          return { label: 'HIGH', className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' }
        case 'insurance':
          return { label: 'MED', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' }
        case 'creator':
          return { label: 'MED', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' }
        default:
          return { label: 'LOW', className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' }
      }
    }

    // Get category label
    const getCategoryLabel = () => {
      switch (task.workstream) {
        case 'creator':
          return 'Creative Design'
        case 'legal':
          return 'Legal Review'
        case 'insurance':
          return 'Insurance Check'
        case 'general':
          return 'General Task'
        default:
          return 'Task'
      }
    }

    const priority = getPriority()
    
    return (
      <Card
        onClick={() => router.push(`/projects/${projectId}/tasks/${task.id}`)}
        className={cn(
          "relative py-0 transition-all duration-200 cursor-pointer group",
          "bg-slate-800/50 hover:border-blue-500/50",
          "border border-slate-700/50 shadow-lg rounded-xl"
        )}
      >
        <CardContent className="p-4 flex flex-col" style={{ minHeight: '160px' }}>
          {/* Header: Brand/Company + Priority */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* Company Avatar */}
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 ring-1 ring-border/40"
                style={{ backgroundColor: getCompanyColor() }}
                title={company?.name || 'Company'}
              >
                <span className="text-white font-semibold text-[9px]">
                  {company?.name?.charAt(0) || 'C'}
                </span>
              </div>
              {/* Company Name */}
              <span className="text-xs text-muted-foreground truncate font-medium">
                {company?.name || 'Company'}
              </span>
            </div>
            {/* Priority Badge */}
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0",
              priority.className
            )}>
              {priority.label}
            </span>
          </div>

          {/* Task Title */}
          <h3 className="mb-2.5 text-sm font-semibold text-white line-clamp-2 leading-snug hover:text-blue-400 transition-colors">
            {task.title}
          </h3>

          {/* Category Line */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium">
            {task.workstream === 'creator' && <span className="shrink-0">✏️</span>}
            {task.workstream === 'legal' && <span className="shrink-0">⚖️</span>}
            {task.workstream === 'insurance' && <span className="shrink-0">🛡️</span>}
            {task.workstream === 'general' && <span className="shrink-0">📋</span>}
            <span>{getCategoryLabel()}</span>
          </div>

          {/* Task Group Badge (if exists) - Small chip */}
          {group && (
            <div className="mb-3">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: `${group.color}20`,
                  color: group.color,
                  border: `1px solid ${group.color}40`
                }}
              >
                {group.name}
              </span>
            </div>
          )}

          {/* Bottom Metadata Row */}
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/50">
            {/* Left: Assignee Avatar */}
            {task.assignee ? (
              <div 
                className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-medium text-white"
                title={task.assignee}
              >
                {task.assignee.split(' ').map(n => n[0]).join('')}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-600" />
            )}

            {/* Right: Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">{task.dueDate}</span>
              </div>
            )}
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
      {/* Kanban Columns - Horizontal Scroll */}
      <div
        className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin"
        style={{
          scrollSnapType: "x proximity",
          touchAction: "pan-x",
        }}
      >
        <div className="flex gap-6 h-[calc(100vh-320px)] px-4 md:px-6">
          {STATUS_COLUMNS.map((column) => (
            <div
              key={column.key}
              className={cn(
                "flex flex-col min-w-[320px] max-w-[320px] h-full rounded-lg bg-muted/30 border border-border/30",
                "scroll-snap-align-start"
              )}
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Column Header - Sticky */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-muted/30 rounded-t-lg border-b border-border/30 transition-shadow duration-200">
                <h3 className="font-semibold text-sm text-foreground">{column.label}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {tasksByColumn[column.key].length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex flex-col gap-3 flex-1 p-3 overflow-y-auto scrollbar-thin">
                {tasksByColumn[column.key].length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground/60 border-2 border-dashed border-border/40 rounded-lg bg-card/50">
                    <span className="text-xs">No tasks</span>
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
}

function StreamView({ 
  tasks, 
  taskGroups,
  selectedTaskGroup,
  onTaskGroupSelect,
  selectedStatus,
  onStatusSelect,
  projectId,
}: StreamViewProps) {
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

  const getWorkstreamColor = (workstream: Task["workstream"]) => {
    switch (workstream) {
      case "creator":
        return "bg-blue-500"
      case "legal":
        return "bg-amber-500"
      case "insurance":
        return "bg-green-500"
      case "general":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
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
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Workstream indicator */}
                    <div className={cn("w-1 h-full rounded-full", getWorkstreamColor(task.workstream))} />
                    
                    <div className="flex-1 space-y-2">
                      {/* Task header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{task.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {taskGroup?.name && <>{taskGroup.name} • </>}{task.workstream}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(task.status)} className="shrink-0">
                          {task.status.replace('_', ' ')}
                        </Badge>
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
  const { getProjectById } = useData()

  // Fetch project from data context (consistent with projects list)
  const project = getProjectById(projectId)

  // View state management
  const viewFromUrl = searchParams.get('view') as 'board' | 'stream' | null
  const [currentView, setCurrentView] = useState<'board' | 'stream'>('board')

  // Filter state management
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string | null>(null) // null = "All Groups"
  const [selectedStatus, setSelectedStatus] = useState<string>('all') // for Stream view
  const [searchQuery, setSearchQuery] = useState('')

  // State management
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TaskGroup | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3b82f6' })
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Urgent' | 'High' | 'Medium' | 'Low',
    taskGroupId: '' as string,
    designType: '',
    brand: '',
    dueDate: '',
    targetAudience: '',
    detailedDescription: '',
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
  
  // Modal display state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [createMore, setCreateMore] = useState(false)
  
  // Expandable sections state
  const [isExpanded, setIsExpanded] = useState(false)
  const [requestDetailsExpanded, setRequestDetailsExpanded] = useState(true)
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(true)
  const [linkAssetsExpanded, setLinkAssetsExpanded] = useState(false)
  
  // DAM Asset Browser state
  const [showAssetBrowser, setShowAssetBrowser] = useState(false)
  const [assetQuery, setAssetQuery] = useState('')
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
      brand: '',
      dueDate: '',
      targetAudience: '',
      detailedDescription: '',
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
    setTaskFormData({
      title: '',
      description: '',
      priority: 'Medium',
      taskGroupId: '',
      designType: '',
      brand: '',
      dueDate: '',
      targetAudience: '',
      detailedDescription: '',
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
    // Validate required field
    if (!taskFormData.title.trim()) {
      setTaskFormError('Title is required')
      return
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      taskGroupId: taskFormData.taskGroupId || '', // Use selected group or ungrouped
      projectId: projectId,
      workstream: 'general',
      title: taskFormData.title.trim(),
      status: 'submitted', // Always defaults to "Submitted"
      assignee: undefined,
      dueDate: undefined,
      createdDate: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      updatedAt: new Date().toISOString(),
    }

    setTasks([...tasks, newTask])
    toast.success('✓ Task created')

    // If "Create more" is checked, reset form and keep modal open
    if (createMore) {
      setTaskFormData({
        title: '',
        description: '',
        priority: 'Medium',
        taskGroupId: '', // Keep empty for next task
        designType: '',
        brand: '',
        dueDate: '',
        targetAudience: '',
        detailedDescription: '',
        attachments: [] as File[],
      })
      setTaskGroupQuery('')
      setTaskFormError('')
      // Focus back on title input (happens automatically with autoFocus)
    } else {
      closeTaskModal()
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
      {/* Header, Breadcrumbs, Filters - Inside Container */}
      <PageContainer className="space-y-6 animate-fade-in">
        {/* Breadcrumb Navigation - Subtle */}
        <div className="flex items-center text-xs text-gray-500">
          <a 
            href="/projects"
            className="hover:text-gray-300 transition-colors"
          >
            Projects
          </a>
          <span className="mx-2">/</span>
          <a 
            href={`/projects/${projectId}`}
            className="hover:text-gray-300 transition-colors"
          >
            {project.name}
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-400">Tasks</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage creative tasks and track progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={currentView === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchView('board')}
                className={cn(
                  currentView === 'board' && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <LayoutGrid className="h-4 w-4 mr-1.5" />
                Board
              </Button>
              <Button
                variant={currentView === 'stream' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchView('stream')}
                className={cn(
                  currentView === 'stream' && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <List className="h-4 w-4 mr-1.5" />
                Stream
              </Button>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => openTaskModal()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Task
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills - Task Groups */}
        <div className="flex gap-2 flex-wrap">
          {/* All Groups pill */}
          <Badge
            variant={selectedTaskGroup === null ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selectedTaskGroup === null
                ? ""
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => setSelectedTaskGroup(null)}
          >
            All Groups ({tasks.length})
          </Badge>

          {/* Task Group filter pills */}
          {taskGroups.map((group) => {
            const count = tasks.filter(t => t.taskGroupId === group.id).length
            return (
              <Badge
                key={group.id}
                variant={selectedTaskGroup === group.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedTaskGroup === group.id
                    ? ""
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setSelectedTaskGroup(group.id)}
              >
                {group.name} ({count})
              </Badge>
            )
          })}
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
            searchQuery={searchQuery}
            projectId={projectId}
            project={project}
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
          className={cn(
            "bg-white dark:bg-[#0d0e14] overflow-hidden transition-all duration-300 border-gray-800 p-0",
            isFullscreen 
              ? "w-screen h-screen max-w-none rounded-none" 
              : "w-full max-w-4xl max-h-[90vh] rounded-xl"
          )}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              handleCreateTask()
            }
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <DialogTitle className="text-sm font-medium">New Task</DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <X className="h-4 w-4 text-gray-400" />
                ) : (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4"



>

              {/* Title Input */}
              <div className="space-y-3">
                <input
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
                  placeholder="Add description..."
                  value={taskFormData.description}
                  onChange={(e) => {
                    setTaskFormData({ ...taskFormData, description: e.target.value })
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = `${Math.min(target.scrollHeight, 200)}px`
                  }}
                  rows={1}
                  className="w-full text-sm bg-transparent resize-none outline-none py-2 placeholder:text-gray-400 min-h-[60px] max-h-[200px]"
                  style={{ height: 'auto' }}
                />
                
                {/* Error Message */}
                {taskFormError && (
                  <p className="text-xs text-red-500">{taskFormError}</p>
                )}
              </div>

              {/* Properties Bar - Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {/* Assignee */}
                <PropertyPill
                  icon={<User className="w-3.5 h-3.5" />}
                  label="Assignee"
                  value="None"
                  onClick={() => {/* TODO: Open assignee picker */}}
                />
                
                {/* Project - Click to Select */}
                <PropertyPill
                  icon={<Folder className="w-3.5 h-3.5" />}
                  label="Project"
                  value={project?.name || "Select project"}
                  onClick={() => setShowProjectPicker(true)}
                  required={!project}
                />
                
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
                            className="w-full text-xs bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-2.5 py-1.5 focus:border-blue-500 outline-none"
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
                                {/* Create New Option */}
                                {showCreate && (
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500 border-b border-gray-200 dark:border-gray-700"
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
                                    <span className="text-xs">Create "{taskGroupQuery}"</span>
                                  </button>
                                )}
                                
                                {/* None Option */}
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                                  onClick={() => {
                                    setTaskFormData({ ...taskFormData, taskGroupId: '' })
                                    setShowTaskGroupPicker(false)
                                    setTaskGroupQuery('')
                                  }}
                                >
                                  <X className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">None</span>
                                </button>
                                
                                {/* Existing Groups */}
                                {filteredGroups.length > 0 ? (
                                  filteredGroups.map(group => (
                                    <button
                                      key={group.id}
                                      type="button"
                                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                      <span className="text-xs text-gray-900 dark:text-white">{group.name}</span>
                                    </button>
                                  ))
                                ) : !showCreate ? (
                                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
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
                
                {/* Priority */}
                <PropertyPill
                  icon={
                    taskFormData.priority === 'Urgent' ? <span className="text-red-500">🔴</span> :
                    taskFormData.priority === 'High' ? <span className="text-orange-500">🟠</span> :
                    taskFormData.priority === 'Medium' ? <span className="text-yellow-500">🟡</span> :
                    <span className="text-green-500">🟢</span>
                  }
                  label="Priority"
                  value={taskFormData.priority}
                  onClick={() => setIsExpanded(!isExpanded)}
                />
                
                {/* Due Date */}
                <PropertyPill
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Due"
                  value={taskFormData.dueDate || "None"}
                  onClick={() => setIsExpanded(!isExpanded)}
                />
                
                {/* Brand */}
                <PropertyPill
                  label="Brand"
                  value={taskFormData.brand || "None"}
                  onClick={() => setIsExpanded(!isExpanded)}
                />
                
                {/* Design Type */}
                <PropertyPill
                  label="Type"
                  value={taskFormData.designType || "None"}
                  onClick={() => setIsExpanded(!isExpanded)}
                />
                
                {/* More/Less Toggle */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all duration-150"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isExpanded ? 'Less' : 'More'}
                </button>
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-gray-800 pt-4 animate-in slide-in-from-top duration-200">
                  {/* Design Type & Brand Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Design Type</label>
                      <select 
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none transition-all duration-150"
                        value={taskFormData.designType}
                        onChange={(e) => setTaskFormData({ ...taskFormData, designType: e.target.value })}
                      >
                        <option value="">Select type...</option>
                        <option value="social-media">Social Media</option>
                        <option value="print">Print</option>
                        <option value="web">Web</option>
                        <option value="video">Video</option>
                        <option value="packaging">Packaging</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Brand</label>
                      <select 
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none transition-all duration-150"
                        value={taskFormData.brand}
                        onChange={(e) => setTaskFormData({ ...taskFormData, brand: e.target.value })}
                      >
                        <option value="">Select brand...</option>
                        <option value="acme">Acme Corporation</option>
                        <option value="techstart">TechStart Inc</option>
                      </select>
                    </div>
                  </div>

                  {/* Due Date & Priority Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Due Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none transition-all duration-150"
                        value={taskFormData.dueDate}
                        onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Priority</label>
                      <select 
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none transition-all duration-150"
                        value={taskFormData.priority}
                        onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as typeof taskFormData.priority })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Task Group */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Task Group (optional)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search or create task group..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none transition-all duration-150"
                        value={taskGroupQuery}
                        onChange={(e) => {
                          setTaskGroupQuery(e.target.value)
                          setShowTaskGroupDropdown(true)
                        }}
                        onFocus={() => setShowTaskGroupDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowTaskGroupDropdown(false), 200)
                        }}
                      />
                      
                      {showTaskGroupDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-xl max-h-48 overflow-auto">
                          {(() => {
                            const searchLower = taskGroupQuery.toLowerCase().trim()
                            const filteredGroups = taskGroups.filter(g => 
                              g.name.toLowerCase().includes(searchLower)
                            )
                            const exactMatch = taskGroups.find(g => 
                              g.name.toLowerCase() === searchLower
                            )
                            const showCreate = searchLower && !exactMatch
                            
                            return (
                              <>
                                {showCreate && (
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-gray-800 text-blue-400 transition-colors duration-150 border-b border-gray-700"
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      const groupId = createTaskGroupInline(taskGroupQuery)
                                      if (groupId) {
                                        setTaskFormData({ ...taskFormData, taskGroupId: groupId })
                                      }
                                      setShowTaskGroupDropdown(false)
                                    }}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create "{taskGroupQuery}"</span>
                                  </button>
                                )}
                                
                                {filteredGroups.length > 0 ? (
                                  <>
                                    {filteredGroups.map((group) => (
                                      <button
                                        key={group.id}
                                        type="button"
                                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-xs hover:bg-gray-800 transition-colors duration-150"
                                        onMouseDown={(e) => {
                                          e.preventDefault()
                                          setTaskFormData({ ...taskFormData, taskGroupId: group.id })
                                          setTaskGroupQuery(group.name)
                                          setShowTaskGroupDropdown(false)
                                        }}
                                      >
                                        <span 
                                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                                          style={{ backgroundColor: group.color }}
                                        />
                                        <span className="text-white">{group.name}</span>
                                      </button>
                                    ))}
                                  </>
                                ) : !showCreate ? (
                                  <div className="px-2.5 py-1.5 text-gray-500 text-xs">
                                    {searchLower ? 'No groups found' : 'Start typing to search or create...'}
                                  </div>
                                ) : null}
                              </>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Details Collapsible */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
                    <button 
                      type="button" 
                      onClick={() => setRequestDetailsExpanded(!requestDetailsExpanded)} 
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Request Details</span>
                      {requestDetailsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {requestDetailsExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        <input 
                          type="text" 
                          placeholder="Target Audience (e.g., B2B decision makers)" 
                          className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none py-2 placeholder:text-gray-400"
                          value={taskFormData.targetAudience}
                          onChange={(e) => setTaskFormData({ ...taskFormData, targetAudience: e.target.value })}
                        />
                        <textarea 
                          rows={3} 
                          placeholder="Detailed description, requirements, specs..." 
                          className="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:border-blue-500 outline-none p-3 resize-none placeholder:text-gray-400"
                          value={taskFormData.detailedDescription}
                          onChange={(e) => setTaskFormData({ ...taskFormData, detailedDescription: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Attachments Collapsible */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
                    <button 
                      type="button" 
                      onClick={() => setAttachmentsExpanded(!attachmentsExpanded)} 
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Attachments</span>
                      {attachmentsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {attachmentsExpanded && (
                      <div className="px-4 pb-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF, AI, PSD up to 50MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Link Assets from DAM Collapsible */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
                    <button 
                      type="button" 
                      onClick={() => setLinkAssetsExpanded(!linkAssetsExpanded)} 
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Link Assets</span>
                        {selectedAssets.length > 0 && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{selectedAssets.length}</span>
                        )}
                      </div>
                      {linkAssetsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {linkAssetsExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        <button 
                          type="button"
                          onClick={() => setShowAssetBrowser(true)}
                          className="w-full border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2"
                        >
                          <Folder className="w-4 h-4" />
                          Browse Assets from DAM
                        </button>
                        
                        {selectedAssets.length > 0 && (
                          <div className="space-y-2">
                            {selectedAssets.map(asset => (
                              <div key={asset.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <img src={asset.thumbnail} alt={asset.name} className="w-10 h-10 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{asset.name}</p>
                                  <select
                                    value={asset.role || 'OUTPUT'}
                                    onChange={(e) => updateAssetRole(asset.id, e.target.value)}
                                    className="text-xs bg-transparent border-none text-gray-500 outline-none mt-0.5 cursor-pointer"
                                  >
                                    <option value="OUTPUT">Output</option>
                                    <option value="INSPIRATION">Inspiration</option>
                                    <option value="SOURCE_MATERIAL">Source Material</option>
                                    <option value="ORIGINAL">Original</option>
                                  </select>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => removeAsset(asset.id)} 
                                  className="text-gray-400 hover:text-red-500 transition"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Footer - Fixed */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800 flex-shrink-0">
              {/* Left: Create more checkbox */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={createMore}
                  onChange={(e) => setCreateMore(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1 bg-gray-800 cursor-pointer"
                />
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Create more</span>
              </label>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={closeTaskModal}
                  className="text-xs h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  className="text-xs h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-all duration-150"
                >
                  Create Task
                  <span className="ml-2 text-[10px] opacity-60">⌘↵</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DAM Asset Browser Modal */}
      <Dialog open={showAssetBrowser} onOpenChange={setShowAssetBrowser}>
        <DialogContent className="max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-0 flex flex-col">
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
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-sm font-semibold mb-4">Select Project</DialogTitle>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search projects..."
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          </div>
          
          {/* Projects List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {(() => {
              const { projects } = useData()
              const searchLower = projectQuery.toLowerCase().trim()
              const filteredProjects = searchLower === ''
                ? projects
                : projects.filter(p => p.name.toLowerCase().includes(searchLower))
              
              return filteredProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    // Project switching logic would go here
                    // For now, just close the dialog since we're already in a project context
                    setShowProjectPicker(false)
                    setProjectQuery('')
                    toast.success(`Project "${proj.name}" selected`)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{proj.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{proj.name}</p>
                    <p className="text-xs text-gray-500 truncate">{proj.status} • {proj.assets || 0} assets</p>
                  </div>
                  {project?.id === proj.id && <Check className="w-4 h-4 text-blue-500" />}
                </button>
              ))
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
