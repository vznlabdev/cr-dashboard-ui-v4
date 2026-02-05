"use client"

import { useParams, useRouter, notFound } from "next/navigation"
import Link from "next/link"
import { PageContainer } from "@/components/layout/PageContainer"
import { useData } from "@/contexts/data-context"
import { ProjectTabs, ActivityItem, MilestoneItem } from "@/components/cr"
import { ProjectUpdateDialog } from "@/components/projects/ProjectUpdateDialog"
import { ProjectUpdateItem } from "@/components/projects/ProjectUpdateItem"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Calendar, User, Users, Building2, Clock, Target, Signal, SignalHigh, SignalMedium, SignalLow, Edit2, AlertCircle } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { getTasksByProject, getCompanyById } from "@/lib/mock-data/projects-tasks"
import type { Project, ProjectHealth } from "@/types"
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb"

// Team members for project lead assignment
const TEAM_MEMBERS = [
  { id: 'jgordon', name: 'jgordon', fullName: 'Jeff Gordon', avatarColor: '#ef4444', initials: 'JG' },
  { id: 'abdul.qadeer', name: 'abdul.qadeer', fullName: 'Abdul Qadeer', avatarColor: '#a855f7', initials: 'AQ' },
  { id: 'asad', name: 'asad', fullName: 'Asad', avatarColor: '#06b6d4', initials: 'AS' },
  { id: 'dev.vznlab', name: 'dev.vznlab', fullName: 'Dev Vznlab', avatarColor: '#8b5cf6', initials: 'DV' },
  { id: 'husnain.raza', name: 'husnain.raza', fullName: 'Husnain Raza', avatarColor: '#ec4899', initials: 'HR' },
  { id: 'jg', name: 'jg', fullName: 'JG', avatarColor: '#78350f', initials: 'JG' },
  { id: 'ryan', name: 'ryan', fullName: 'Ryan', avatarColor: '#b45309', initials: 'RY' },
  { id: 'zlane', name: 'zlane', fullName: 'Zlane', avatarColor: '#10b981', initials: 'ZL' },
]

export default function ProjectOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { projects, updateProject } = useData()

  const project = projects.find((p) => p.id === projectId)
  
  if (!project) {
    notFound()
  }

  const company = getCompanyById(project.companyId)
  const projectTasks = getTasksByProject(projectId)
  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter(t => t.status === 'delivered').length
  const inProgressTasks = projectTasks.filter(t => 
    t.status === 'production' || t.status === 'qa_review' || t.status === 'assigned'
  ).length

  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(project.description || "")
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [expandedUpdateId, setExpandedUpdateId] = useState<string | null>(null)

  // Mock activity data
  const activities = [
    {
      user: {
        ...(TEAM_MEMBERS.find(m => m.fullName === project.owner) || TEAM_MEMBERS[0]),
        color: (TEAM_MEMBERS.find(m => m.fullName === project.owner) || TEAM_MEMBERS[0]).avatarColor
      },
      action: "changed status to In Progress",
      timestamp: "2 hours ago"
    },
    {
      user: {
        ...TEAM_MEMBERS[1],
        color: TEAM_MEMBERS[1].avatarColor
      },
      action: "added 3 new tasks",
      timestamp: "5 hours ago"
    },
    {
      user: {
        ...(TEAM_MEMBERS.find(m => m.fullName === project.owner) || TEAM_MEMBERS[0]),
        color: (TEAM_MEMBERS.find(m => m.fullName === project.owner) || TEAM_MEMBERS[0]).avatarColor
      },
      action: "created this project",
      timestamp: project.updated
    }
  ]

  // Mock milestones
  const milestones = [
    { name: "Project Kickoff", progress: 4, total: 4, status: "on-track" as const, dueDate: "Jan 15, 2026" },
    { name: "Design Phase", progress: 2, total: 5, status: "on-track" as const, dueDate: "Feb 1, 2026" },
    { name: "Development", progress: 0, total: 8, status: "at-risk" as const, dueDate: "Mar 1, 2026" },
  ]

  const handleSaveDescription = () => {
    updateProject(projectId, { description })
    setIsEditingDescription(false)
  }

  const handleSaveUpdate = (update: { content: string; healthStatus: ProjectHealth }) => {
    const leadMember = TEAM_MEMBERS.find(m => m.fullName === project.owner) || TEAM_MEMBERS[0]
    
    const newUpdate = {
      id: `update-${Date.now()}`,
      projectId: project.id,
      content: update.content,
      healthStatus: update.healthStatus,
      author: {
        name: leadMember.fullName,
        initials: leadMember.initials,
        color: leadMember.avatarColor
      },
      timestamp: new Date(),
      metadata: {
        status: project.status,
        lead: project.owner,
        targetDate: project.targetDate,
        progress: `${Math.round((completedTasks / totalTasks) * 100)}%`
      }
    }

    // Add update to project
    const currentUpdates = project.updates || []
    updateProject(projectId, { updates: [newUpdate, ...currentUpdates] })
  }

  // Combine updates and activities for the feed
  const combinedFeed = useMemo(() => {
    const updates = (project.updates || []).map(u => ({ 
      type: 'update' as const, 
      data: u,
      timestamp: u.timestamp
    }))
    
    const activityItems = activities.map((a, i) => ({ 
      type: 'activity' as const, 
      data: a,
      timestamp: new Date(Date.now() - (i + 1) * 3600000) // Mock timestamps
    }))
    
    return [...updates, ...activityItems].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    )
  }, [project.updates, activities])

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <SignalHigh className="h-4 w-4 text-red-500" />
      case 'high':
        return <SignalHigh className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <SignalMedium className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <SignalLow className="h-4 w-4 text-blue-500" />
      default:
        return <Signal className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getLeadMember = () => {
    return TEAM_MEMBERS.find(m => m.fullName === project.owner) || TEAM_MEMBERS[0]
  }

  return (
    <PageContainer className="space-y-0 animate-fade-in">
      {/* Breadcrumb */}
      <LinearBreadcrumb
        backHref="/projects"
        segments={[
          { label: "Projects", href: "/projects" },
          { label: project.name }
        ]}
        className="mb-3"
      />

      {/* Project Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{project.name}</h1>
          
          {/* Minimal Metadata Indicators */}
          <div className="flex items-center gap-2">
            {/* Status dot */}
            <div 
              className={cn(
                "h-2 w-2 rounded-full",
                project.status === "Active" && "bg-green-500",
                project.status !== "Active" && "bg-gray-400"
              )}
              title={`Project Status: ${project.status}`}
            />
            
            {/* Compliance percentage */}
            <span 
              className="text-sm text-muted-foreground" 
              title={`Compliance Score: ${project.compliance}%`}
            >
              {project.compliance}%
            </span>
            
            {/* Risk icon - only show if not low */}
            {project.risk && project.risk !== 'Low' && (
              <div title={`Risk Level: ${project.risk}`}>
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
      </div>

      {/* Tabs */}
      <ProjectTabs projectId={projectId} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Horizontal Properties Bar */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex flex-wrap items-center gap-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    project.status === "Active" && "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    project.status === "Review" && "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    project.status === "Draft" && "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                    project.status === "Approved" && "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                  )}
                >
                  {project.status}
                </Badge>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <div className="flex items-center gap-1">
                  {getPriorityIcon(project.priority || undefined)}
                  <span className="text-sm capitalize">{project.priority || 'None'}</span>
                </div>
              </div>

              {/* Lead */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Lead:</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                    style={{ backgroundColor: getLeadMember().avatarColor }}
                  >
                    {getLeadMember().initials}
                  </div>
                  <span className="text-sm">{project.owner}</span>
                </div>
              </div>

              {/* Dates */}
              {project.targetDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Due {project.targetDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Latest Updates */}
          <div className="border rounded-lg bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Latest updates</h2>
              <Button size="sm" variant="outline" onClick={() => setUpdateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New update
              </Button>
            </div>
            <div className="divide-y divide-border">
              {combinedFeed.map((item, index) => (
                <div key={index} className="px-4">
                  {item.type === 'update' ? (
                    <ProjectUpdateItem
                      update={item.data}
                      isExpanded={expandedUpdateId === item.data.id}
                      onToggle={() => setExpandedUpdateId(
                        expandedUpdateId === item.data.id ? null : item.data.id
                      )}
                    />
                  ) : (
                    <ActivityItem {...item.data} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="border rounded-lg bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Description</h2>
              {!isEditingDescription && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsEditingDescription(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="p-4">
              {!isEditingDescription ? (
                <div
                  className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 rounded p-2 -m-2"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {description || "Add a description..."}
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={4}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSaveDescription}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setDescription(project.description || "")
                        setIsEditingDescription(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="border rounded-lg bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Milestones</h2>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add milestone
              </Button>
            </div>
            <div className="divide-y divide-border">
              {milestones.map((milestone, index) => (
                <div key={index} className="px-4">
                  <MilestoneItem {...milestone} />
                </div>
              ))}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="border rounded-lg bg-card p-4">
            <h2 className="text-sm font-semibold mb-4">Progress</h2>
            <div className="space-y-4">
              {/* Scope */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scope</span>
                  <span className="font-medium">{totalTasks} tasks</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              {/* Started */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">
                    {inProgressTasks} • {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0} 
                  className="h-2"
                />
              </div>

              {/* Completed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {completedTasks} • {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-4">
          <div className="border rounded-lg bg-card p-4 sticky top-4">
            <h3 className="text-sm font-semibold mb-4">Properties</h3>
            
            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select
                  value={project.status}
                  onValueChange={(value) => updateProject(projectId, { status: value as any })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select
                  value={project.priority || "none"}
                  onValueChange={(value) => updateProject(projectId, { priority: value === "none" ? null : value as any })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lead */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Lead</Label>
                <Select
                  value={project.owner}
                  onValueChange={(value) => updateProject(projectId, { owner: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" sideOffset={4} avoidCollisions={false}>
                    {TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={member.fullName}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Target Date</Label>
                <Input
                  type="date"
                  value={project.targetDate || ""}
                  onChange={(e) => updateProject(projectId, { targetDate: e.target.value })}
                  className="h-8"
                />
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Brand</Label>
                <Link 
                  href={`/creative/brands/${project.companyId}`}
                  className="flex items-center gap-2 text-sm py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{company?.name || 'Unknown'}</span>
                </Link>
              </div>

              {/* Created */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Created</Label>
                <div className="flex items-center gap-2 text-sm py-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{project.createdDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Update Dialog */}
      <ProjectUpdateDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        project={project}
        onSave={handleSaveUpdate}
      />
    </PageContainer>
  )
}
