"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Search, Zap, Clock, User } from "lucide-react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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

export default function UnifiedTasksPage() {
  const router = useRouter()
  const { projects, getProjectById } = useData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMode, setSelectedMode] = useState<string>('all')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')

  // Get all unique assignees
  const allAssignees = useMemo(() => {
    const assignees = new Set<string>()
    mockTasks.forEach(task => {
      if (task.assignee) assignees.add(task.assignee)
    })
    return Array.from(assignees).sort()
  }, [])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
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
      
      // Assignee filter
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) {
        return false
      }
      
      return true
    })
  }, [searchQuery, selectedProject, selectedStatus, selectedMode, selectedAssignee])

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

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
        <p className="text-base text-muted-foreground">
          View and manage tasks across all projects
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project Filter */}
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode Filter */}
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger>
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assignee Filter */}
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {allAssignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredTasks.length} of {mockTasks.length} tasks
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No tasks found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map(task => {
                  const project = getProjectById(task.projectId)
                  const company = project ? getCompanyById(project.companyId) : null
                  
                  return (
                    <TableRow
                      key={task.id}
                      onClick={() => router.push(`/projects/${task.projectId}/tasks/${task.id}`)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      {/* Task Title */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{task.title}</div>
                          {company && (
                            <div className="text-xs text-muted-foreground">
                              {company.name}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Project */}
                      <TableCell>
                        <div className="text-sm">
                          {project?.name || '-'}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status)} className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>

                      {/* Assignee */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {task.assignee || 'Unassigned'}
                        </div>
                      </TableCell>

                      {/* Due Date */}
                      <TableCell>
                        {task.dueDate ? (
                          <div className={cn(
                            "flex items-center gap-2 text-sm",
                            isOverdue(task.dueDate) && "text-red-600 dark:text-red-400"
                          )}>
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(task.dueDate)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Mode */}
                      <TableCell>
                        {task.mode && task.mode !== 'manual' ? (
                          <div className="flex items-center gap-1">
                            <Zap className={cn(
                              "h-3.5 w-3.5",
                              task.mode === "generative" && "text-blue-600 dark:text-blue-400",
                              task.mode === "assisted" && "text-purple-600 dark:text-purple-400"
                            )} />
                            <span className="text-xs">
                              {task.mode === "generative" ? "AI Gen" : "AI Assist"}
                              {task.aiWorkflowStep && ` (${task.aiWorkflowStep}/7)`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Manual</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
