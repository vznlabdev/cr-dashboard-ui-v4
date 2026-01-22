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
  getTasksByTaskGroup 
} from "@/lib/mock-data/projects-tasks"
import type { Task, TaskGroup } from "@/types"
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, GripVertical, LayoutGrid, List, Search, X, Clock, Upload } from "lucide-react"
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
}

function FlatKanbanBoard({
  tasks,
  taskGroups,
  selectedTaskGroup,
  searchQuery,
  projectId,
}: FlatKanbanBoardProps) {
  const router = useRouter()
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
    
    // Get company/group color
    const getGroupColor = () => {
      if (!group) return '#3b82f6' // default blue
      return group.color
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
          {/* Company/Group Avatar - Top Left */}
          <div className="flex items-start mb-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: getGroupColor() }}
              title={group?.name || 'Task'}
            >
              <span className="text-white font-semibold text-xs">
                {group?.name.charAt(0) || 'T'}
              </span>
            </div>
          </div>

          {/* Priority Badge - Absolute Top Right */}
          <span className={cn(
            "absolute top-3 right-3 px-2.5 py-0.5 text-xs font-medium rounded-full uppercase",
            priority.className
          )}>
            {priority.label}
          </span>

          {/* Task Title */}
          <h3 className="mb-2 text-base font-semibold text-white line-clamp-2 leading-snug hover:text-blue-400 transition-colors">
            {task.title}
          </h3>

          {/* Category Line */}
          <div className="flex items-center text-sm text-gray-400 mb-auto">
            {task.workstream === 'creator' && <span className="mr-2">✏️</span>}
            {task.workstream === 'legal' && <span className="mr-2">⚖️</span>}
            {task.workstream === 'insurance' && <span className="mr-2">🛡️</span>}
            {task.workstream === 'general' && <span className="mr-2">📋</span>}
            <span>{getCategoryLabel()}</span>
          </div>

          {/* Task Group Badge (if exists) - Small chip */}
          {group && (
            <div className="mt-2 mb-auto">
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
          <div className="flex justify-between items-center mt-auto pt-4">
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
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>{task.dueDate}</span>
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
    <div>
      {/* Kanban Columns - Horizontal Scroll */}
      <div className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin -mx-4 md:-mx-6">
        <div className="flex gap-6 min-h-[calc(100vh-320px)] px-4 md:px-6">
          {STATUS_COLUMNS.map((column) => (
            <div
              key={column.key}
              className={cn(
                "flex flex-col min-w-[320px] max-w-[320px] rounded-lg bg-muted/30 border border-border/30",
                "scroll-snap-align-start"
              )}
            >
              {/* Column Header - Sticky */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-muted/30 rounded-t-lg border-b border-border/30">
                <h3 className="font-semibold text-sm text-foreground">{column.label}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {tasksByColumn[column.key].length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex flex-col space-y-4 flex-1 p-4 overflow-y-auto max-h-[calc(100vh-360px)] scrollbar-thin">
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
  isDragging
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
          <button
            onClick={() => onStatusSelect('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
              selectedStatus === 'all'
                ? "bg-blue-600 text-white"
                : "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
            )}
          >
            All ({tasks.length})
          </button>
          {STATUS_COLUMNS.map((column) => {
            const count = tasks.filter(t => t.status === column.key).length
            return (
              <button
                key={column.key}
                onClick={() => onStatusSelect(column.key)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
                  selectedStatus === column.key
                    ? "bg-blue-600 text-white"
                    : "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
                )}
              >
                {column.label} ({count})
              </button>
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
                            {taskGroup?.name} • {task.workstream}
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
    taskGroupId: '',
    designType: '',
    brand: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    projectTag: '',
    targetAudience: '',
    description: '',
    attachments: [] as File[],
    linkedAssets: [] as Array<{ assetId: string; role: 'output' | 'original' | 'inspiration' | 'source_material' }>,
  })
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null)
  
  // Task Group combobox state
  const [taskGroupSearch, setTaskGroupSearch] = useState('')
  const [showTaskGroupDropdown, setShowTaskGroupDropdown] = useState(false)
  
  // DAM Asset Browser state
  const [isDamModalOpen, setIsDamModalOpen] = useState(false)
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])
  
  // Mock assets for DAM browser (in production, this would come from API)
  const mockDamAssets = [
    { id: 'asset-1', name: 'Hero Banner.png', type: 'image', projectName: 'Brand Refresh', thumbnail: '/placeholder.svg' },
    { id: 'asset-2', name: 'Logo Variations.ai', type: 'vector', projectName: 'Brand Identity', thumbnail: '/placeholder.svg' },
    { id: 'asset-3', name: 'Product Photo.jpg', type: 'image', projectName: 'Product Launch', thumbnail: '/placeholder.svg' },
  ]

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
  const openCreateModal = () => {
    setEditingGroup(null)
    setFormData({ name: '', description: '', color: '#3b82f6' })
    setIsModalOpen(true)
  }

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
  const openTaskModal = (taskGroupId?: string) => {
    const group = taskGroupId ? taskGroups.find(g => g.id === taskGroupId) : null
    setTaskFormData({
      title: '',
      taskGroupId: taskGroupId || '',
      designType: '',
      brand: '',
      priority: 'medium',
      dueDate: '',
      projectTag: '',
      targetAudience: '',
      description: '',
      attachments: [],
      linkedAssets: [],
    })
    setTaskGroupSearch(group?.name || '')
    setIsTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setIsTaskModalOpen(false)
    setTaskFormData({
      title: '',
      taskGroupId: '',
      designType: '',
      brand: '',
      priority: 'medium',
      dueDate: '',
      projectTag: '',
      targetAudience: '',
      description: '',
      attachments: [],
      linkedAssets: [],
    })
    setTaskGroupSearch('')
    setShowTaskGroupDropdown(false)
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
      setTaskGroupSearch(duplicate.name)
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
    setTaskGroupSearch(newGroup.name)
    setShowTaskGroupDropdown(false)
    toast.success(`Group "${newGroup.name}" created`)
    
    return newGroup.id
  }

  // Create task
  const handleCreateTask = () => {
    // Validate required fields
    if (!taskFormData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    if (!taskFormData.taskGroupId) {
      toast.error("Please select a Task Group")
      return
    }

    if (!taskFormData.designType) {
      toast.error("Design Type is required")
      return
    }

    if (!taskFormData.brand) {
      toast.error("Brand is required")
      return
    }

    if (!taskFormData.description.trim()) {
      toast.error("Description is required")
      return
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      taskGroupId: taskFormData.taskGroupId,
      projectId: projectId,
      workstream: 'general', // Default workstream
      title: taskFormData.title.trim(),
      status: 'submitted', // Always defaults to "Submitted" on create
      assignee: undefined, // Can be assigned after creation
      dueDate: taskFormData.dueDate || undefined,
      createdDate: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      updatedAt: new Date().toISOString(),
    }

    setTasks([...tasks, newTask])
    toast.success(`Task "${newTask.title}" created successfully`)
    closeTaskModal()
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

          {/* Action Buttons */}
          <Button 
            onClick={openCreateModal} 
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Group
          </Button>
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
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {/* All Groups pill */}
        <button
          onClick={() => setSelectedTaskGroup(null)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
            selectedTaskGroup === null
              ? "bg-blue-600 text-white"
              : "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
          )}
        >
          All Groups ({tasks.length})
        </button>
        
        {/* Task Group filter pills */}
        {taskGroups.map((group) => {
          const count = tasks.filter(t => t.taskGroupId === group.id).length
          return (
            <button
              key={group.id}
              onClick={() => setSelectedTaskGroup(group.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
                selectedTaskGroup === group.id
                  ? "bg-blue-600 text-white"
                  : "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
              )}
            >
              {group.name} ({count})
            </button>
          )
        })}
      </div>

      {/* View Content - Board or Stream */}
      {currentView === 'board' ? (
        <FlatKanbanBoard
          tasks={tasks}
          taskGroups={taskGroups}
          selectedTaskGroup={selectedTaskGroup}
          searchQuery={searchQuery}
          projectId={projectId}
        />
      ) : (
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

      {/* Task Creation Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to this project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* SECTION 1: BASIC INFORMATION */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  Provide the essential details for your request
                </p>
              </div>
              {/* Task Group */}
              <div className="space-y-2">
                <Label htmlFor="taskGroupSearch">
                  Task Group <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="taskGroupSearch"
                    placeholder="Type to search or create..."
                    value={taskGroupSearch}
                    onChange={(e) => {
                      setTaskGroupSearch(e.target.value)
                      setShowTaskGroupDropdown(true)
                    }}
                    onFocus={() => setShowTaskGroupDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowTaskGroupDropdown(false), 200)
                    }}
                  />
                  
                  {showTaskGroupDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-y-auto">
                      {(() => {
                        const searchLower = taskGroupSearch.toLowerCase().trim()
                        const filteredGroups = taskGroups.filter(g => 
                          g.name.toLowerCase().includes(searchLower)
                        )
                        const exactMatch = taskGroups.find(g => 
                          g.name.toLowerCase() === searchLower
                        )
                        
                        return (
                          <>
                            {searchLower && !exactMatch && (
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-500/10 text-blue-400 flex items-center gap-2 border-b"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  createTaskGroupInline(taskGroupSearch)
                                }}
                              >
                                <Plus className="h-4 w-4" />
                                <span>Create "{taskGroupSearch}"</span>
                              </button>
                            )}
                            
                            {filteredGroups.length > 0 ? (
                              <>
                                {filteredGroups.map((group) => (
                                  <button
                                    key={group.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      setTaskFormData({ ...taskFormData, taskGroupId: group.id })
                                      setTaskGroupSearch(group.name)
                                      setShowTaskGroupDropdown(false)
                                    }}
                                  >
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: group.color }}
                                    />
                                    <span>{group.name}</span>
                                  </button>
                                ))}
                              </>
                            ) : !searchLower ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                Start typing to search or create...
                              </div>
                            ) : null}
                            
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-500/10 text-blue-400 flex items-center gap-2 border-t"
                              onMouseDown={(e) => {
                                e.preventDefault()
                                if (searchLower) {
                                  createTaskGroupInline(taskGroupSearch)
                                } else {
                                  setShowTaskGroupDropdown(false)
                                  openCreateModal()
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              <span>Create New</span>
                            </button>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="taskTitle">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="taskTitle"
                  placeholder="e.g., Homepage Banner Redesign"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                />
              </div>

              {/* Design Type & Brand - Two Column */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="designType">
                    Design Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={taskFormData.designType}
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, designType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="email">Email Design</SelectItem>
                      <SelectItem value="web">Web Design</SelectItem>
                      <SelectItem value="print">Print Design</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="logo">Logo/Branding</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">
                    Brand <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={taskFormData.brand}
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, brand: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand-1">Acme Corporation</SelectItem>
                      <SelectItem value="brand-2">TechStart Inc</SelectItem>
                      <SelectItem value="brand-3">Global Ventures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority & Due Date - Two Column */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={taskFormData.priority}
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, priority: value as typeof taskFormData.priority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Project Tag */}
              <div className="space-y-2">
                <Label htmlFor="projectTag">Project Tag (optional)</Label>
                <Input
                  id="projectTag"
                  placeholder="e.g., Q1 Campaign, Product Launch"
                  value={taskFormData.projectTag}
                  onChange={(e) => setTaskFormData({ ...taskFormData, projectTag: e.target.value })}
                />
              </div>
            </div>

            {/* SECTION 2: REQUEST DETAILS */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-lg font-semibold">Request Details</h3>
                <p className="text-sm text-muted-foreground">
                  Describe what you need in detail
                </p>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., B2B decision makers, Gen Z consumers"
                  value={taskFormData.targetAudience}
                  onChange={(e) => setTaskFormData({ ...taskFormData, targetAudience: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your creative request in detail. Include any specific requirements, dimensions, colors, text, or other specifications..."
                  rows={6}
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="resize-none"
                />
              </div>
            </div>

            {/* SECTION 3: ATTACHMENTS */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-lg font-semibold">Attachments</h3>
                <p className="text-sm text-muted-foreground">
                  Upload reference files, images, or documents
                </p>
              </div>

              {/* Upload Area */}
              <label
                htmlFor="file-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                  "border-muted-foreground/25 hover:border-primary/50 transition-colors",
                  "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, PDF up to 50MB
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setTaskFormData({
                        ...taskFormData,
                        attachments: [...taskFormData.attachments, ...Array.from(e.target.files)]
                      })
                    }
                  }}
                  accept="image/*,.pdf"
                />
              </label>

              {/* Attachment List */}
              {taskFormData.attachments.length > 0 && (
                <div className="space-y-2">
                  {taskFormData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-xs font-medium">
                          {file.name.split(".").pop()?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTaskFormData({
                            ...taskFormData,
                            attachments: taskFormData.attachments.filter((_, i) => i !== index)
                          })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: LINKED ASSETS FROM DAM */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-lg font-semibold">Link Assets from DAM</h3>
                <p className="text-sm text-muted-foreground">
                  Associate existing assets with this task
                </p>
              </div>

              {/* Browse DAM Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDamModalOpen(true)}
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                Browse DAM
              </Button>

              {/* Linked Assets List */}
              {taskFormData.linkedAssets.length > 0 && (
                <div className="space-y-2">
                  {taskFormData.linkedAssets.map((linkedAsset, index) => {
                    const asset = mockDamAssets.find(a => a.id === linkedAsset.assetId)
                    if (!asset) return null
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">IMG</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.projectName}</p>
                          </div>
                        </div>
                        
                        {/* Asset Role Dropdown */}
                        <Select
                          value={linkedAsset.role}
                          onValueChange={(value) => {
                            const newLinkedAssets = [...taskFormData.linkedAssets]
                            newLinkedAssets[index] = { ...linkedAsset, role: value as typeof linkedAsset.role }
                            setTaskFormData({ ...taskFormData, linkedAssets: newLinkedAssets })
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="output">OUTPUT</SelectItem>
                            <SelectItem value="original">ORIGINAL</SelectItem>
                            <SelectItem value="inspiration">INSPIRATION</SelectItem>
                            <SelectItem value="source_material">SOURCE_MATERIAL</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTaskFormData({
                              ...taskFormData,
                              linkedAssets: taskFormData.linkedAssets.filter((_, i) => i !== index)
                            })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeTaskModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DAM Asset Browser Modal */}
      <Dialog open={isDamModalOpen} onOpenChange={setIsDamModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Browse DAM Assets</DialogTitle>
            <DialogDescription>
              Select assets to link to this task
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="brand-refresh">Brand Refresh</SelectItem>
                  <SelectItem value="product-launch">Product Launch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
              {mockDamAssets.map((asset) => {
                const isSelected = selectedAssetIds.includes(asset.id)
                return (
                  <div
                    key={asset.id}
                    className={cn(
                      "relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => {
                      setSelectedAssetIds(prev =>
                        prev.includes(asset.id)
                          ? prev.filter(id => id !== asset.id)
                          : [...prev, asset.id]
                      )
                    }}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-2 right-2">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center",
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
                      )}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Asset Thumbnail */}
                    <div className="w-full h-24 bg-muted rounded mb-2 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{asset.type.toUpperCase()}</span>
                    </div>

                    {/* Asset Info */}
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.projectName}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDamModalOpen(false)
              setSelectedAssetIds([])
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Add selected assets with default role 'output'
              const newLinkedAssets = selectedAssetIds.map(assetId => ({
                assetId,
                role: 'output' as const
              }))
              setTaskFormData({
                ...taskFormData,
                linkedAssets: [...taskFormData.linkedAssets, ...newLinkedAssets]
              })
              setIsDamModalOpen(false)
              setSelectedAssetIds([])
              toast.success(`${selectedAssetIds.length} asset(s) linked`)
            }}>
              Add Selected Assets ({selectedAssetIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
