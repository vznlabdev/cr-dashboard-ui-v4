"use client"
// Test workflow execution: /projects/1/tasks/task-1/workflow, /projects/1/tasks/task-3/workflow, /projects/3/tasks/task-7/workflow

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronRight, Zap } from "lucide-react"
import { getTaskById } from "@/lib/mock-data/projects-tasks"
import {
  getWorkflowTemplateById,
  createWorkflowInstance,
} from "@/lib/mock-data/workflows"
import { WorkflowExecutor } from "@/components/workflows/WorkflowExecutor"
import { BasicAIWorkflow } from "@/components/workflows/BasicAIWorkflow"
import { useData } from "@/contexts/data-context"
import type { Task } from "@/types"
import type { WorkflowTemplate, WorkflowInstance } from "@/types/workflows"
import { cn } from "@/lib/utils"

export default function TaskWorkflowPage() {
  const params = useParams()
  const taskId = params.taskId as string
  const projectId = params.id as string

  const { getProjectById } = useData()
  const project = getProjectById(projectId)

  const [task, setTask] = useState<Task | null>(null)
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null)
  const [instance, setInstance] = useState<WorkflowInstance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadedTask = getTaskById(taskId)
    if (loadedTask) {
      setTask(loadedTask)
      if (loadedTask.workflowTemplateId) {
        const tmpl = getWorkflowTemplateById(loadedTask.workflowTemplateId)
        if (tmpl) {
          setTemplate(tmpl)
          const inst =
            loadedTask.workflowInstance ||
            createWorkflowInstance(tmpl.id, taskId, projectId)
          inst.status = "in_progress"
          inst.startedAt = inst.startedAt || new Date().toISOString()
          if (inst.stepStatuses[0]) {
            if (inst.stepStatuses[0].status === "locked") {
              inst.stepStatuses[0].status = "active"
            }
            inst.stepStatuses[0].startedAt =
              inst.stepStatuses[0].startedAt || new Date().toISOString()
          }
          setInstance(inst)
        }
      }
    }
    setLoading(false)
  }, [taskId, projectId])

  if (loading || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    )
  }

  const isManual = !task.mode || task.mode === "manual"
  const isAINoTemplate =
    !template && task.mode && task.mode !== "manual"

  if (!template && isManual) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="rounded-lg border bg-card p-6 max-w-sm mx-auto space-y-4">
            <p className="text-sm font-medium">Manual task — no AI workflow</p>
            <p className="text-xs text-muted-foreground">
              This is a manual task. Upload and manage assets from the task page.
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                Back to task
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isAINoTemplate) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Link href="/projects" className="hover:text-foreground transition-colors">
                Projects
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/projects/${projectId}/tasks`}
                className="hover:text-foreground transition-colors"
              >
                {project?.name ?? "Project"}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/projects/${projectId}/tasks/${taskId}`}
                className="hover:text-foreground transition-colors"
              >
                {task?.title}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Workflow</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-bold">{task?.title}</h1>
                <p className="text-xs text-muted-foreground">
                  Simple AI workflow
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <BasicAIWorkflow
            task={task}
            projectId={projectId}
            taskId={taskId}
            onComplete={() => {}}
          />
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="rounded-lg border bg-card p-6 max-w-sm mx-auto space-y-4">
            <p className="text-sm font-medium">No workflow template assigned</p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/workflows">Browse workflows</Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Back to task
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/projects/${projectId}/tasks`}
              className="hover:text-foreground transition-colors"
            >
              {project?.name ?? "Project"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/projects/${projectId}/tasks/${taskId}`}
              className="hover:text-foreground transition-colors"
            >
              {task?.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Workflow</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold">{task?.title}</h1>
              <p className="text-xs text-muted-foreground">
                {template?.name} workflow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Context Banner — tells the user what to do */}
      <div className="border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Creative Workflow Active</p>
              <p className="text-xs text-muted-foreground">
                Launch your AI tool, create your content, then come back here to upload and complete each step.
                The browser extension captures everything automatically.
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Extension Connected
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {template && instance && (
          <WorkflowExecutor
            template={template}
            instance={instance}
            onUpdateInstance={(updated) => setInstance(updated)}
          />
        )}
      </div>
    </div>
  )
}
