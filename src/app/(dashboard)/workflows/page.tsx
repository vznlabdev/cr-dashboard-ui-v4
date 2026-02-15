"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PageContainer } from "@/components/layout/PageContainer"
import {
  Search,
  Plus,
  Clock,
  BarChart3,
  GitBranch,
  Activity,
  CheckCircle2,
  Pause,
  CircleDot,
  ArrowRight,
  ChevronRight,
  Zap,
  Sparkles,
} from "lucide-react"
import { getWorkflowTemplates, getWorkflowTemplateById } from "@/lib/mock-data/workflows"
import { getSystemWorkflowTemplates } from "@/lib/data/workflow-templates"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import type { WorkflowTemplate } from "@/types/workflows"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const CATEGORY_OPTIONS = ["all", "video", "image", "audio", "mixed", "custom"] as const

function categoryLabel(value: string): string {
  return value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)
}

function getTimeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}

export interface ActiveWorkflow {
  id: string
  templateId: string
  taskId: string
  taskTitle: string
  projectId: string
  projectName: string
  status: "in_progress" | "completed" | "paused" | "not_started"
  currentStepIndex: number
  totalSteps: number
  completedSteps: number
  lastActivityAt: string
  startedAt: string
  completedAt?: string
  assignee: string
}

const MOCK_ACTIVE_WORKFLOWS: ActiveWorkflow[] = [
  {
    id: "aw-1",
    templateId: "wf-social-images",
    taskId: "task-1",
    taskTitle: "Holiday Sale Banner Design",
    projectId: "1",
    projectName: "Summer Campaign 2024",
    status: "in_progress",
    currentStepIndex: 1,
    totalSteps: 3,
    completedSteps: 1,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    assignee: "Sarah Chen",
  },
  {
    id: "aw-2",
    templateId: "wf-video-production",
    taskId: "task-2",
    taskTitle: "Product Launch Video",
    projectId: "1",
    projectName: "Summer Campaign 2024",
    status: "in_progress",
    currentStepIndex: 3,
    totalSteps: 5,
    completedSteps: 3,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    assignee: "Michael Roberts",
  },
  {
    id: "aw-3",
    templateId: "wf-social-images",
    taskId: "task-3",
    taskTitle: "Instagram Story Pack",
    projectId: "2",
    projectName: "TechStart Rebrand",
    status: "completed",
    currentStepIndex: 3,
    totalSteps: 3,
    completedSteps: 3,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    assignee: "Sarah Chen",
  },
  {
    id: "aw-4",
    templateId: "wf-podcast",
    taskId: "task-4",
    taskTitle: "Weekly Podcast Episode #12",
    projectId: "1",
    projectName: "Summer Campaign 2024",
    status: "paused",
    currentStepIndex: 2,
    totalSteps: 4,
    completedSteps: 1,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    assignee: "James Wilson",
  },
  {
    id: "aw-5",
    templateId: "wf-campaign-bundle",
    taskId: "task-5",
    taskTitle: "Q2 Marketing Campaign Kit",
    projectId: "2",
    projectName: "TechStart Rebrand",
    status: "not_started",
    currentStepIndex: 0,
    totalSteps: 6,
    completedSteps: 0,
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    assignee: "Emily Park",
  },
]

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<"my-workflows" | "templates">("templates")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in_progress" | "completed" | "paused"
  >("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const templates = getWorkflowTemplates()

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return templates.filter((template) => {
      if (q) {
        const nameMatch = template.name.toLowerCase().includes(q)
        const descMatch = template.description?.toLowerCase().includes(q)
        const tagMatch = template.tags?.some((t) => t.toLowerCase().includes(q))
        if (!nameMatch && !descMatch && !tagMatch) return false
      }
      if (categoryFilter === "custom") {
        return !template.isSystem
      }
      if (categoryFilter !== "all" && template.category !== categoryFilter) return false
      return true
    })
  }, [templates, searchQuery, categoryFilter])

  const filteredActiveWorkflows = useMemo(() => {
    return MOCK_ACTIVE_WORKFLOWS.filter(
      (w) => statusFilter === "all" || w.status === statusFilter
    ).sort((a, b) => {
      if (a.status === "in_progress" && b.status !== "in_progress") return -1
      if (b.status === "in_progress" && a.status !== "in_progress") return 1
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    })
  }, [statusFilter])

  const maxUsageCount = useMemo(
    () => Math.max(...templates.map((t) => t.usageCount ?? 0), 0),
    [templates]
  )

  const router = useRouter()

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage active workflows and browse templates
          </p>
        </div>
        <Button asChild>
          <Link href="/workflows/new">
            <Plus className="mr-2 h-4 w-4" /> Create Workflow
          </Link>
        </Button>
      </div>

      {/* Tabs: Templates first, then My Workflows */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={cn(
              "pb-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === "templates"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Templates
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my-workflows")}
            className={cn(
              "pb-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === "my-workflows"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              My Workflows
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {MOCK_ACTIVE_WORKFLOWS.filter((w) => w.status === "in_progress").length}
              </Badge>
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: My Workflows */}
      {activeTab === "my-workflows" && (
        <div className="space-y-4">
          {/* Status filter pills */}
          <div className="flex items-center gap-2">
            {[
              { value: "all", label: "All", count: MOCK_ACTIVE_WORKFLOWS.length },
              {
                value: "in_progress",
                label: "In Progress",
                count: MOCK_ACTIVE_WORKFLOWS.filter((w) => w.status === "in_progress").length,
              },
              {
                value: "completed",
                label: "Completed",
                count: MOCK_ACTIVE_WORKFLOWS.filter((w) => w.status === "completed").length,
              },
              {
                value: "paused",
                label: "Paused",
                count: MOCK_ACTIVE_WORKFLOWS.filter((w) => w.status === "paused").length,
              },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value as typeof statusFilter)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  statusFilter === f.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* Workflow list */}
          <div className="border rounded-xl overflow-hidden divide-y">
            {filteredActiveWorkflows.map((workflow) => {
              const template = getWorkflowTemplateById(workflow.templateId)
              if (!template) return null
              const progressPercent = Math.round(
                (workflow.completedSteps / workflow.totalSteps) * 100
              )
              const timeAgo = getTimeAgo(workflow.lastActivityAt)
              return (
                <Link
                  key={workflow.id}
                  href={`/projects/${workflow.projectId}/tasks/${workflow.taskId}/workflow`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                >
                  <span className="text-xl shrink-0">{template.icon}</span>
                  <div className="shrink-0">
                    {workflow.status === "in_progress" && (
                      <div
                        className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"
                        title="In Progress"
                      />
                    )}
                    {workflow.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {workflow.status === "paused" && (
                      <Pause className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    {workflow.status === "not_started" && (
                      <CircleDot className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{workflow.taskTitle}</p>
                      <Badge
                        variant="outline"
                        className="text-[9px] shrink-0 capitalize"
                      >
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {template.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">
                        {workflow.projectName}
                      </span>
                    </div>
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>
                        {workflow.completedSteps}/{workflow.totalSteps} steps
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-1" />
                  </div>
                  <div className="flex items-center gap-1.5 w-28 shrink-0">
                    <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-[9px] font-semibold text-blue-600 shrink-0">
                      {workflow.assignee.charAt(0)}
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {workflow.assignee}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-20 text-right shrink-0">
                    {timeAgo}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              )
            })}
          </div>

          {/* Empty state */}
          {filteredActiveWorkflows.length === 0 && (
            <div className="text-center py-16">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No workflows found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "all"
                  ? "Start by browsing templates and creating a task."
                  : `No ${statusFilter.replace("_", " ")} workflows.`}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab("templates")}
              >
                Browse Templates
              </Button>
            </div>
          )}

          {/* Recently Completed */}
          {statusFilter === "all" &&
            MOCK_ACTIVE_WORKFLOWS.some((w) => w.status === "completed") && (
              <div className="mt-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Recently Completed
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {MOCK_ACTIVE_WORKFLOWS.filter((w) => w.status === "completed")
                    .slice(0, 3)
                    .map((workflow) => {
                      const template = getWorkflowTemplateById(workflow.templateId)
                      if (!template) return null
                      return (
                        <Link
                          key={workflow.id}
                          href={`/projects/${workflow.projectId}/tasks/${workflow.taskId}/workflow`}
                          className="p-3 rounded-lg border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span>{template.icon}</span>
                            <span className="text-xs font-medium truncate">
                              {workflow.taskTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>{workflow.totalSteps} steps completed</span>
                            <span>· {workflow.completedAt ? getTimeAgo(workflow.completedAt) : ""}</span>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Tab 2: Templates */}
      {activeTab === "templates" && (
        <div>
          {/* Start from template — system templates */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3">Start from template</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Pre-built workflows to copy and customize. Use Template opens the builder with the workflow pre-loaded.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {getSystemWorkflowTemplates().map((template) => {
                const stepCount = template.steps?.length ?? 0
                const estMin = template.estimatedTotalMinutes ?? template.steps?.reduce((s, st) => s + (st.estimatedMinutes ?? 0), 0) ?? 0
                return (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 flex flex-col gap-3 bg-card hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium truncate">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {template.description ?? "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
                      <span>{stepCount} steps</span>
                      <span>·</span>
                      <span>~{estMin} min</span>
                      <Badge variant="outline" className="text-[9px] capitalize">
                        {template.category}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-auto text-xs h-8"
                      onClick={() => router.push(`/workflows/new?template=${encodeURIComponent(template.id)}`)}
                    >
                      Use Template
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Search + category filter */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-64 text-sm"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              {CATEGORY_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategoryFilter(value)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-md transition-colors",
                    categoryFilter === value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {categoryLabel(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <GitBranch className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No workflows found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/workflows/${template.id}`}
                  className="block border rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group relative"
                >
                  {maxUsageCount > 0 &&
                    (template.usageCount ?? 0) === maxUsageCount && (
                      <Badge className="absolute top-3 right-3 text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                        🔥 Popular
                      </Badge>
                    )}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{template.name}</h3>
                        <Badge
                          variant="outline"
                          className="text-[9px] capitalize"
                        >
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {template.steps.length} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~
                      {template.estimatedTotalMinutes ?? 0}m
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> Used {template.usageCount ?? 0}x
                    </span>
                    <Badge
                      variant={template.isSystem ? "secondary" : "outline"}
                      className="text-[9px]"
                    >
                      {template.isSystem ? "System" : "Custom"}
                    </Badge>
                  </div>
                  <div className="mt-3 max-h-0 overflow-hidden group-hover:max-h-[200px] transition-all duration-300 ease-in-out">
                    <div className="pt-3 border-t space-y-1.5">
                      {template.steps.slice(0, 5).map((step, i) => {
                        const config = STEP_TYPE_CONFIG[step.stepType]
                        const Icon = config.icon
                        return (
                          <div key={step.id} className="flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground font-mono w-3">
                              {i + 1}
                            </span>
                            <div
                              className={cn(
                                "h-4 w-4 rounded flex items-center justify-center",
                                config.lightBg
                              )}
                            >
                              <Icon className={cn("h-2.5 w-2.5", config.textColor)} />
                            </div>
                            <span className="text-[10px] truncate">{step.name}</span>
                          </div>
                        )
                      })}
                      {template.steps.length > 5 && (
                        <span className="text-[9px] text-muted-foreground ml-5">
                          +{template.steps.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      View details <ArrowRight className="h-3 w-3" />
                    </span>
                    <Button
                      size="sm"
                      className="text-xs h-7"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        router.push(`/tasks?newTask=true&workflow=${template.id}`)
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
