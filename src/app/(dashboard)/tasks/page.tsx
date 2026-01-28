"use client"

import { Fragment } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageContainer } from "@/components/layout/PageContainer"
import { useData } from "@/contexts/data-context"
import { mockTasks, getCompanyById } from "@/lib/mock-data/projects-tasks"
import type { Task } from "@/types"
import { Search, Zap, Clock, X, Filter, ChevronDown, MessageSquare, Paperclip, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Signal, SignalHigh, SignalMedium, SignalLow, Plus, Check, Minus, Rocket, Bot, Pencil, User, Calendar } from "lucide-react"
import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MediaManager } from "@/components/media-manager/media-manager"
import type { MediaManagerData } from "@/types/mediaManager"
import { validateAllTabs, countMediaItems, hasMediaContent } from "@/utils/mediaValidation"
import { clearMediaDataFromStorage } from "@/contexts/MediaManagerContext"
import { getMediaCount, getMediaSummary, getMediaWarnings, hasMediaData } from "@/utils/mediaHelpers"
import { toast } from "sonner"

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

// Mock team members for assignee picker
const TEAM_MEMBERS = [
  { fullName: 'Sarah Chen', avatarColor: '#3b82f6' },
  { fullName: 'Mike Johnson', avatarColor: '#8b5cf6' },
  { fullName: 'Emma Wilson', avatarColor: '#10b981' },
  { fullName: 'Alex Kim', avatarColor: '#f59e0b' },
]

// Property Pill Component
const PropertyPill = ({ icon, label, value, onClick }: { 
  icon: React.ReactNode
  label: string
  value: string
  onClick?: () => void 
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
  >
    {icon}
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-gray-900 dark:text-white font-medium">{value}</span>
    <ChevronDown className="w-3 h-3 opacity-50" />
  </button>
)

export default function UnifiedTasksPage() {
  const router = useRouter()
  const { projects, getProjectById } = useData()
  
  // Mock current user - in real app, get from auth context
  const currentUser = "Sarah Chen" // TODO: Replace with actual auth context
  
  // Local state for tasks (so we can update them)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  
  const [activeView, setActiveView] = useState<ViewTab>('my-tasks')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMode, setSelectedMode] = useState<string>('all')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
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
    selectedProjectId: '' as string, // No project pre-selected
    targetAudience: '',
    detailedDescription: '',
    clientVisibility: 'internal' as 'internal' | 'visible' | 'commentable',
    estimatedHours: null as number | null,
    billable: false,
    mediaData: null as MediaManagerData | null,
  })
  const [taskFormError, setTaskFormError] = useState('')
  
  // Picker state
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showDesignTypePicker, setShowDesignTypePicker] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  const [showBrandPicker, setShowBrandPicker] = useState(false)
  const [showModePicker, setShowModePicker] = useState(false)
  const [showIntendedUsesPicker, setShowIntendedUsesPicker] = useState(false)
  const [showAssigneePicker, setShowAssigneePicker] = useState(false)
  
  // Media Manager state
  const [showMediaManager, setShowMediaManager] = useState(false)
  
  // Modal display state
  const [createMore, setCreateMore] = useState(false)
  
  // Refs
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // Auto-expand description textarea
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto'
      descriptionRef.current.style.height = `${Math.min(descriptionRef.current.scrollHeight, 300)}px`
    }
  }, [taskFormData.description])

  // Modal handlers
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
      selectedProjectId: '', // NO PROJECT PRE-SELECTED
      targetAudience: '',
      detailedDescription: '',
      clientVisibility: 'internal',
      estimatedHours: null,
      billable: false,
      mediaData: null,
    })
    setTaskFormError('')
    setShowMediaManager(false)
    setCreateMore(false)
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
    setShowMediaManager(false)
    setCreateMore(false)
  }

  const handleCreateTask = () => {
    // Validate title
    if (!taskFormData.title.trim()) {
      setTaskFormError('Task title is required')
      return
    }

    // Validate intended uses (required field)
    if (taskFormData.intendedUses.length === 0) {
      setTaskFormError('Please select at least one intended use')
      return
    }

    // TODO: Create task via API
    console.log('Creating task:', taskFormData)
    
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
        mediaData: null, // Clear media data for new task
      })
      setTaskFormError('')
      // Clear media data from localStorage for the next task
      clearMediaDataFromStorage('new')
      // Focus on title input for next task
      setTimeout(() => titleInputRef.current?.focus(), 0)
    } else {
      closeTaskModal()
    }
  }
  
  // Group & Sort state
  const [groupBy, setGroupBy] = useState<'none' | 'project' | 'status' | 'assignee' | 'priority'>('none')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'updated' | 'created' | 'title'>('updated')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Get all unique assignees
  const allAssignees = useMemo(() => {
    const assignees = new Set<string>()
    tasks.forEach(task => {
      if (task.assignee) assignees.add(task.assignee)
    })
    return Array.from(assignees).sort()
  }, [tasks])

  // Helper: Get priority value for sorting
  const getPriorityValue = (priority?: 'urgent' | 'high' | 'medium' | 'low') => {
    const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1 }
    return priority ? priorityMap[priority] : 0
  }

  // Helper: Get priority indicator with Linear-style icons
  const getPriorityIndicator = (priority?: 'urgent' | 'high' | 'medium' | 'low') => {
    if (!priority) return { 
      Icon: Signal, 
      color: 'text-gray-400', 
      label: 'No priority',
      bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    }
    const indicators = {
      urgent: { 
        Icon: AlertCircle, 
        color: 'text-red-600 dark:text-red-400', 
        label: 'Urgent',
        bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20'
      },
      high: { 
        Icon: SignalHigh, 
        color: 'text-orange-600 dark:text-orange-400', 
        label: 'High',
        bgColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
      },
      medium: { 
        Icon: SignalMedium, 
        color: 'text-yellow-600 dark:text-yellow-400', 
        label: 'Medium',
        bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
      },
      low: { 
        Icon: SignalLow, 
        color: 'text-gray-500 dark:text-gray-400', 
        label: 'Low',
        bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-800'
      },
    }
    return indicators[priority]
  }

  // Handler to update task priority
  const handlePriorityChange = (taskId: string, newPriority: 'urgent' | 'high' | 'medium' | 'low' | undefined) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, priority: newPriority } 
          : task
      )
    )
    // TODO: In real app, this would also call an API to persist the change
  }

  // Filter and Sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // Filter
    let filtered = tasks.filter(task => {
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

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [tasks, activeView, currentUser, searchQuery, selectedProject, selectedStatus, selectedMode, selectedAssignee, sortBy, sortDirection])

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

  // Flat list for filtering
  const filteredTasks = filteredAndSortedTasks

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

  // Format relative time (e.g., "1d ago", "3h ago", "just now")
  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffMs / 604800000)
    const diffMonths = Math.floor(diffMs / 2592000000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    return `${diffMonths}mo ago`
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
      myTasks: tasks.filter(t => t.assignee === currentUser).length,
      all: tasks.length,
      unassigned: tasks.filter(t => !t.assignee).length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length,
    }
  }, [tasks, currentUser])

  return (
    <PageContainer className="space-y-4 animate-fade-in">
      {/* View Tabs - Linear Style */}
      <div className="flex items-center justify-between gap-4 border-b pb-0">
        <div className="flex items-center gap-1">
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

        {/* New Task Button */}
        <Button 
          onClick={openTaskModal}
          size="sm"
          className="mb-2"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Task
        </Button>
      </div>

      {/* Compact Header with Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
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
          {/* Project Pills */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Project:</span>
            <button
              onClick={() => setSelectedProject('all')}
              className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors",
                selectedProject === 'all'
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "hover:bg-muted"
              )}
            >
              All Projects
            </button>
            {projects.slice(0, 5).map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1.5",
                  selectedProject === project.id
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "hover:bg-muted"
                )}
              >
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.companyId === '1' ? '#3b82f6' : project.companyId === '2' ? '#8b5cf6' : '#10b981' }}
                />
                {project.name}
              </button>
            ))}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1 border-l pl-2">
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
              groupedTasks.map(({ group, tasks }, groupIndex) => (
                <Fragment key={group || `group-${groupIndex}`}>
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
                    const priority = getPriorityIndicator(task.priority)
                    
                    return (
                      <TableRow
                        key={task.id}
                        onClick={() => router.push(`/projects/${task.projectId}/tasks/${task.id}`)}
                        className="cursor-pointer border-b border-border/40 transition-colors h-11 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                                priority.bgColor
                              )}>
                                <priority.Icon className={cn("h-3.5 w-3.5", priority.color)} />
                                <ChevronDown className="h-3 w-3 opacity-50" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePriorityChange(task.id, 'urgent')
                                }}
                                className="gap-2"
                              >
                                <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                <span className="text-xs">Urgent</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePriorityChange(task.id, 'high')
                                }}
                                className="gap-2"
                              >
                                <SignalHigh className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                <span className="text-xs">High</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePriorityChange(task.id, 'medium')
                                }}
                                className="gap-2"
                              >
                                <SignalMedium className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                                <span className="text-xs">Medium</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePriorityChange(task.id, 'low')
                                }}
                                className="gap-2"
                              >
                                <SignalLow className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                <span className="text-xs">Low</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePriorityChange(task.id, undefined)
                                }}
                                className="gap-2 border-t"
                              >
                                <Signal className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs">No priority</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

                        {/* Activity (Comments + Attachments + Time) */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {(task.commentsCount || 0) > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task.commentsCount}</span>
                              </div>
                            )}
                            {(task.attachmentsCount || 0) > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{task.attachmentsCount}</span>
                              </div>
                            )}
                            {((task.commentsCount || 0) > 0 || (task.attachmentsCount || 0) > 0) && (
                              <span className="opacity-50">•</span>
                            )}
                            <span className="opacity-70">{formatRelativeTime(task.updatedAt)}</span>
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
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
                
                {/* Project - Clickable - NO DEFAULT PROJECT */}
                <button
                  type="button"
                  onClick={() => setShowProjectPicker(true)}
                  className={cn(
                    "text-sm font-normal transition-colors",
                    !taskFormData.selectedProjectId 
                      ? "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" 
                      : "text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  {taskFormData.selectedProjectId ? getProjectById(taskFormData.selectedProjectId)?.name : "Select Project (Optional)"}
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

            {/* AI Tools Section - Conditional */}
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
                {/* Design Type */}
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
                              key={member.fullName}
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
                    icon={
                      <div className={cn(
                        "w-3.5 h-3.5 rounded-full",
                        taskFormData.priority === 'Urgent' && "bg-red-600",
                        taskFormData.priority === 'High' && "bg-orange-600",
                        taskFormData.priority === 'Medium' && "bg-yellow-600",
                        taskFormData.priority === 'Low' && "bg-gray-400"
                      )} />
                    }
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
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full",
                                  priority.value === 'Urgent' && "bg-red-600",
                                  priority.value === 'High' && "bg-orange-600",
                                  priority.value === 'Medium' && "bg-yellow-600",
                                  priority.value === 'Low' && "bg-gray-400"
                                )} />
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
              </div>
            </div>

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
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Project Picker Modal */}
      {showProjectPicker && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50" 
            onClick={() => setShowProjectPicker(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[60vh] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold">Select Project</h3>
              </div>
              <div className="p-2 overflow-y-auto flex-1">
                {/* None Option */}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded"
                  onClick={() => {
                    setTaskFormData({ ...taskFormData, selectedProjectId: '' })
                    setShowProjectPicker(false)
                  }}
                >
                  <Minus className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">No Project</span>
                </button>
                
                {projects.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 rounded",
                      taskFormData.selectedProjectId === project.id 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                        : "text-gray-900 dark:text-white"
                    )}
                    onClick={() => {
                      setTaskFormData({ ...taskFormData, selectedProjectId: project.id })
                      setShowProjectPicker(false)
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.companyId === '1' ? '#3b82f6' : project.companyId === '2' ? '#8b5cf6' : '#10b981' }}
                    />
                    <span className="text-xs font-medium">{project.name}</span>
                    {taskFormData.selectedProjectId === project.id && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
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
            prompts: data.prompts.map((prompt: any) => ({
              id: prompt.id || `prompt-${Date.now()}`,
              text: prompt.prompt,
              model: prompt.model || '',
              timestamp: new Date()
            })),
            training: data.training.map((item: any) => ({
              id: item.id || `training-${Date.now()}`,
              type: item.type,
              description: item.description || '',
              metadata: item.metadata || {}
            })),
            references: data.references.map((ref: any) => ({
              id: ref.id || `ref-${Date.now()}`,
              url: ref.url || '',
              description: ref.description || '',
              type: ref.type || 'link'
            })),
            creatorDNA: {
              tone: data.creatorDNA?.tone || [],
              style: data.creatorDNA?.style || [],
              preferences: data.creatorDNA?.preferences || {}
            }
          }
          
          setTaskFormData({ ...taskFormData, mediaData })
          setShowMediaManager(false)
        }}
      />
    </PageContainer>
  )
}
